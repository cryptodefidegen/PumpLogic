import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { Flame, Loader2, AlertTriangle, Wallet, ExternalLink } from "lucide-react";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

function createBurnInstruction(
  tokenAccount: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  amount: bigint
): TransactionInstruction {
  const data = new Uint8Array(9);
  data[0] = 8;
  
  const amountBytes = new ArrayBuffer(8);
  const view = new DataView(amountBytes);
  view.setBigUint64(0, amount, true);
  data.set(new Uint8Array(amountBytes), 1);

  return new TransactionInstruction({
    keys: [
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data: data as unknown as Buffer,
  });
}

async function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
  const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
  
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  
  return address;
}

export default function Burn() {
  const { toast } = useToast();
  const { user, isConnected, connect, fullWalletAddress, connectedWallet, availableWallets } = useWallet();
  
  const [tokenAddress, setTokenAddress] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<number>(9);
  const [isLoading, setIsLoading] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null);

  const fetchTokenBalance = async () => {
    if (!tokenAddress || !fullWalletAddress) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a token address and connect your wallet",
      });
      return;
    }

    setIsLoading(true);
    try {
      const connection = new Connection(SOLANA_RPC);
      const mintPubkey = new PublicKey(tokenAddress);
      const ownerPubkey = new PublicKey(fullWalletAddress);
      
      const ata = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
      
      try {
        const accountInfo = await connection.getParsedAccountInfo(ata);
        
        if (accountInfo.value && 'parsed' in accountInfo.value.data) {
          const parsed = accountInfo.value.data.parsed;
          const decimals = parsed.info.tokenAmount.decimals;
          const balance = parseFloat(parsed.info.tokenAmount.uiAmount);
          
          setTokenDecimals(decimals);
          setTokenBalance(balance);
        } else {
          throw new Error("No balance");
        }

        try {
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
          const data = await response.json();
          if (data.pairs && data.pairs.length > 0) {
            setTokenSymbol(data.pairs[0].baseToken.symbol);
          }
        } catch {
          setTokenSymbol(null);
        }

        toast({
          title: "Token Found",
          description: `Balance loaded successfully`,
          className: "bg-primary text-black font-bold"
        });
      } catch (err) {
        setTokenBalance(0);
        toast({
          variant: "destructive",
          title: "No Balance",
          description: "You don't have any of this token in your wallet",
        });
      }
    } catch (error: any) {
      console.error("Error fetching balance:", error);
      toast({
        variant: "destructive",
        title: "Invalid Token",
        description: "Could not find this token. Please check the address.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeBurn = async () => {
    if (!fullWalletAddress || !tokenAddress || !burnAmount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    const amount = parseFloat(burnAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to burn",
      });
      return;
    }

    if (tokenBalance !== null && amount > tokenBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You only have ${tokenBalance.toLocaleString()} tokens`,
      });
      return;
    }

    setIsBurning(true);
    try {
      const connection = new Connection(SOLANA_RPC);
      const mintPubkey = new PublicKey(tokenAddress);
      const ownerPubkey = new PublicKey(fullWalletAddress);
      
      const ata = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
      
      const [whole, fractional = ""] = burnAmount.split(".");
      const paddedFractional = fractional.padEnd(tokenDecimals, "0").slice(0, tokenDecimals);
      const burnAmountRaw = BigInt(whole + paddedFractional);
      
      const burnInstruction = createBurnInstruction(
        ata,
        mintPubkey,
        ownerPubkey,
        burnAmountRaw
      );

      const transaction = new Transaction().add(burnInstruction);
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = ownerPubkey;

      const wallet = availableWallets.find(w => w.name === connectedWallet);
      if (!wallet?.provider) {
        throw new Error("Wallet not connected");
      }

      const signedTransaction = await wallet.provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, "confirmed");

      toast({
        title: "Burn Successful!",
        description: (
          <div className="flex flex-col gap-2">
            <span>Burned {amount.toLocaleString()} {tokenSymbol || 'tokens'}</span>
            <a 
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline flex items-center gap-1"
            >
              View on Solscan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ),
        className: "bg-primary text-black font-bold"
      });

      if (tokenBalance !== null) {
        setTokenBalance(tokenBalance - amount);
      }
      setBurnAmount("");

    } catch (error: any) {
      console.error("Burn error:", error);
      toast({
        variant: "destructive",
        title: "Burn Failed",
        description: error.message || "Failed to burn tokens. Please try again.",
      });
    } finally {
      setIsBurning(false);
    }
  };

  const setMaxAmount = () => {
    if (tokenBalance !== null) {
      setBurnAmount(tokenBalance.toString());
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="bg-black/40 border-white/10">
              <CardContent className="pt-12 pb-12">
                <Wallet className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
                <p className="text-muted-foreground mb-8">
                  Connect your wallet to access the token burn feature
                </p>
                <Button
                  size="lg"
                  className="bg-primary text-black hover:bg-primary/90"
                  onClick={() => connect()}
                  data-testid="button-connect-burn"
                >
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-mono mb-4">
              <Flame className="h-4 w-4" />
              Token Burner
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Burn Tokens</h1>
            <p className="text-muted-foreground">
              Permanently remove tokens from circulation by burning them
            </p>
          </div>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Token Burn
              </CardTitle>
              <CardDescription>
                Enter the token address and amount you want to burn. This action is irreversible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-orange-500 font-medium">Warning: Irreversible Action</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Burned tokens are permanently destroyed and cannot be recovered. Make sure you understand this before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenAddress">Token Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tokenAddress"
                      placeholder="Enter SPL token mint address"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="bg-black/40 border-white/10"
                      data-testid="input-token-address"
                    />
                    <Button
                      onClick={fetchTokenBalance}
                      disabled={isLoading || !tokenAddress}
                      className="shrink-0"
                      data-testid="button-fetch-balance"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Check"
                      )}
                    </Button>
                  </div>
                </div>

                {tokenBalance !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Your Balance</p>
                        <p className="text-2xl font-bold text-white">
                          {tokenBalance.toLocaleString()} {tokenSymbol && <span className="text-primary">{tokenSymbol}</span>}
                        </p>
                      </div>
                      {tokenAddress && (
                        <a
                          href={`https://solscan.io/token/${tokenAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                          View on Solscan
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="burnAmount">Amount to Burn</Label>
                    {tokenBalance !== null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={setMaxAmount}
                        className="text-primary hover:text-primary/80 h-auto py-0"
                        data-testid="button-max-amount"
                      >
                        Max
                      </Button>
                    )}
                  </div>
                  <Input
                    id="burnAmount"
                    type="number"
                    placeholder="0.00"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    className="bg-black/40 border-white/10 text-lg"
                    disabled={tokenBalance === null}
                    data-testid="input-burn-amount"
                  />
                </div>

                <Button
                  size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={executeBurn}
                  disabled={isBurning || !burnAmount || tokenBalance === null}
                  data-testid="button-execute-burn"
                >
                  {isBurning ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Burning...
                    </>
                  ) : (
                    <>
                      <Flame className="mr-2 h-5 w-5" />
                      Burn Tokens
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-white mb-3">How Token Burning Works</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  Enter the SPL token mint address you want to burn
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  Check your balance to see how many tokens you hold
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  Enter the amount you want to burn (up to your full balance)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  Confirm the transaction in your wallet to execute the burn
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
