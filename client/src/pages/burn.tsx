import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { 
  Flame, Loader2, AlertTriangle, Wallet, ExternalLink, Lock, 
  Info, TrendingDown, DollarSign, Percent, Shield, CheckCircle2,
  Clock, Copy, X
} from "lucide-react";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

// Use server-side RPC proxy to avoid rate limits
async function getBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
  const response = await fetch("/api/deployer/blockhash");
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to get blockhash" }));
    throw new Error(error.error || "Failed to get blockhash");
  }
  const data = await response.json();
  return { blockhash: data.value.blockhash, lastValidBlockHeight: data.value.lastValidBlockHeight };
}

interface TokenMetadata {
  name: string | null;
  symbol: string | null;
  image: string | null;
  totalSupply: number | null;
  price: number | null;
  fdv: number | null;
  priceChange24h: number | null;
  freezeAuthority: string | null;
  mintAuthority: string | null;
  tokenProgram: string | null;
  tokenAccountAddress: string | null;
}

interface BurnRecord {
  signature: string;
  amount: number;
  symbol: string | null;
  tokenAddress: string;
  timestamp: Date;
}

function createBurnInstruction(
  tokenAccount: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  amount: bigint,
  programId: PublicKey = TOKEN_PROGRAM_ID
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
    programId,
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
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata>({
    name: null,
    symbol: null,
    image: null,
    totalSupply: null,
    price: null,
    fdv: null,
    priceChange24h: null,
    freezeAuthority: null,
    mintAuthority: null,
    tokenProgram: null,
    tokenAccountAddress: null,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [burnResult, setBurnResult] = useState<{ signature: string; amount: number; symbol: string | null } | null>(null);
  const [burnHistory, setBurnHistory] = useState<BurnRecord[]>([]);

  const isPreviewMode = !isConnected;

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
    setTokenMetadata({
      name: null,
      symbol: null,
      image: null,
      totalSupply: null,
      price: null,
      fdv: null,
      priceChange24h: null,
      freezeAuthority: null,
      mintAuthority: null,
      tokenProgram: null,
      tokenAccountAddress: null,
    });

    try {
      const response = await fetch(`/api/token/${tokenAddress}?wallet=${fullWalletAddress}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Token not found");
      }

      const data = await response.json();

      setTokenDecimals(data.decimals);
      setTokenBalance(data.balance);
      setTokenMetadata({
        name: data.name,
        symbol: data.symbol,
        image: data.image,
        totalSupply: data.totalSupply,
        price: data.price,
        fdv: data.fdv,
        priceChange24h: data.priceChange24h,
        freezeAuthority: data.freezeAuthority,
        mintAuthority: data.mintAuthority,
        tokenProgram: data.tokenProgram,
        tokenAccountAddress: data.tokenAccountAddress,
      });

      if (data.balance > 0) {
        toast({
          title: "Token Found",
          description: `Balance loaded successfully`,
          className: "bg-primary text-black font-bold"
        });
      } else {
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
        description: error.message || "Could not find this token. Please check the address.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBurnClick = () => {
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

    setShowConfirmDialog(true);
  };

  const executeBurn = async () => {
    setShowConfirmDialog(false);
    setIsBurning(true);

    try {
      const mintPubkey = new PublicKey(tokenAddress);
      const ownerPubkey = new PublicKey(fullWalletAddress!);
      
      // Use token account from server (handles both Token Program and Token-2022)
      if (!tokenMetadata.tokenAccountAddress) {
        throw new Error("Token account not found. Please reload token info.");
      }
      const ata = new PublicKey(tokenMetadata.tokenAccountAddress);
      
      // Use correct program ID based on the token
      const programId = tokenMetadata.tokenProgram === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" 
        ? TOKEN_2022_PROGRAM_ID 
        : TOKEN_PROGRAM_ID;
      
      const parsedAmount = parseFloat(burnAmount);
      const multiplier = BigInt(10 ** tokenDecimals);
      const wholeTokens = BigInt(Math.floor(parsedAmount));
      const fractionalPart = parsedAmount - Math.floor(parsedAmount);
      const fractionalRaw = BigInt(Math.round(fractionalPart * Number(multiplier)));
      const burnAmountRaw = wholeTokens * multiplier + fractionalRaw;
      
      const burnInstruction = createBurnInstruction(
        ata,
        mintPubkey,
        ownerPubkey,
        burnAmountRaw,
        programId
      );

      const transaction = new Transaction().add(burnInstruction);
      
      // Get blockhash from server-side Helius RPC
      const { blockhash, lastValidBlockHeight } = await getBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = ownerPubkey;

      const wallet = availableWallets.find(w => w.name === connectedWallet);
      if (!wallet?.provider) {
        throw new Error("Wallet not connected");
      }

      // Exclusively use signAndSendTransaction for Phantom/Blowfish compliance
      // This method signs and sends in one call with an UNSIGNED transaction
      // Required to avoid "malicious dApp" warnings from Blowfish security
      if (!wallet.provider.signAndSendTransaction) {
        throw new Error("Your wallet doesn't support secure transaction signing. Please use Phantom, Solflare, or Backpack.");
      }
      
      const result = await wallet.provider.signAndSendTransaction(transaction);
      const signature = result.signature;
      
      // Confirm transaction was processed
      const confirmResponse = await fetch("/api/deployer/confirm-tx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      const confirmResult = await confirmResponse.json();
      if (!confirmResult.confirmed) {
        console.warn("Transaction confirmation warning:", confirmResult.error);
      }

      const amount = parseFloat(burnAmount);

      const newBurnRecord: BurnRecord = {
        signature,
        amount,
        symbol: tokenMetadata.symbol,
        tokenAddress,
        timestamp: new Date(),
      };
      setBurnHistory(prev => [newBurnRecord, ...prev]);

      // Show success dialog
      setBurnResult({ signature, amount, symbol: tokenMetadata.symbol });
      setShowSuccessDialog(true);

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

  const burnAmountNum = parseFloat(burnAmount) || 0;
  const burnValueUsd = tokenMetadata.price ? burnAmountNum * tokenMetadata.price : null;
  const supplyPercentage = tokenMetadata.totalSupply ? (burnAmountNum / tokenMetadata.totalSupply) * 100 : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen pb-12">
        <div className="container mx-auto px-4 pt-8">
          {isPreviewMode && (
            <div className="bg-primary/10 border-2 border-primary/50 rounded-lg p-4 mb-8 flex items-start gap-3">
              <Wallet className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-primary block mb-1">PREVIEW MODE</strong>
                <span className="text-white/80">
                  {!isConnected 
                    ? "You're viewing the burn feature in preview mode. Connect your Phantom wallet to burn tokens."
                    : "Token Burn is currently in beta. Only whitelisted addresses can execute burns."}
                </span>
              </div>
            </div>
          )}
          
          {/* Phantom Whitelist Notice */}
          {isConnected && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-yellow-500 block mb-1">
                  PHANTOM WHITELIST PENDING
                </strong>
                <span className="text-white/80">
                  We're awaiting Phantom wallet whitelist approval. You may see a "This dApp could be malicious" warning when signing transactions. 
                  This is temporary - click "Proceed Anyway" to continue. Your tokens are safe.
                </span>
              </div>
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                    Pump<span className="text-primary">Logic</span> Burn
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary border border-primary/50 rounded-full">BETA</span>
                </div>
                <p className="text-muted-foreground">
                  Permanently remove tokens from circulation by burning them
                </p>
              </div>
            </div>

            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" />
                  Burn Token
                </CardTitle>
                <CardDescription>
                  Enter a Solana token address to burn tokens permanently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    id="tokenAddress"
                    placeholder="Enter token contract address..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    className="bg-black/60 border-white/10 font-mono text-base h-12 flex-1"
                    data-testid="input-token-address"
                  />
                  <Button
                    onClick={fetchTokenBalance}
                    disabled={isLoading || !tokenAddress}
                    className="h-12 px-6 bg-primary text-black hover:bg-primary/90"
                    data-testid="button-fetch-balance"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Flame className="mr-2 h-5 w-5" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-black/40 border-white/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      Burn Amount
                    </CardTitle>
                    <CardDescription>
                      Specify the amount of tokens you want to permanently destroy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-primary font-medium">Warning: Irreversible Action</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Burned tokens are permanently destroyed and cannot be recovered. Make sure you understand this before proceeding.
                          </p>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {tokenBalance !== null && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Your Balance</p>
                              <p className="text-3xl font-bold text-white">
                                {tokenBalance.toLocaleString()} {tokenMetadata.symbol && <span className="text-primary">{tokenMetadata.symbol}</span>}
                              </p>
                              {tokenMetadata.price && tokenBalance > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  ≈ ${(tokenBalance * tokenMetadata.price).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                                </p>
                              )}
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
                    </AnimatePresence>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="burnAmount" className="text-base">Amount to Burn</Label>
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
                        className="bg-black/60 border-white/10 text-xl h-14"
                        disabled={tokenBalance === null}
                        data-testid="input-burn-amount"
                      />
                    </div>

                    <AnimatePresence>
                      {burnAmountNum > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            {burnValueUsd !== null && (
                              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                  <DollarSign className="h-3 w-3" />
                                  Burn Value
                                </div>
                                <p className="text-white font-semibold">
                                  ${burnValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            )}
                            {supplyPercentage !== null && (
                              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                  <Percent className="h-3 w-3" />
                                  Supply Impact
                                </div>
                                <p className="text-white font-semibold">
                                  {supplyPercentage < 0.01 ? '<0.01' : supplyPercentage.toFixed(4)}%
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      size="lg"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 text-lg"
                      onClick={handleBurnClick}
                      disabled={isBurning || !burnAmount || tokenBalance === null || burnAmountNum <= 0}
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
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <AnimatePresence>
                  {(tokenMetadata.name || tokenMetadata.totalSupply) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card className="bg-black/40 border-white/10">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white flex items-center gap-2 text-lg">
                            <Info className="h-4 w-4 text-primary" />
                            Token Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-3">
                            {tokenMetadata.image ? (
                              <img 
                                src={tokenMetadata.image} 
                                alt={tokenMetadata.name || "Token"} 
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                                <Flame className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white">
                                {tokenMetadata.name || "Unknown Token"}
                              </p>
                              {tokenMetadata.symbol && (
                                <p className="text-sm text-muted-foreground">${tokenMetadata.symbol}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {tokenMetadata.price !== null && (
                              <div className="p-3 rounded-lg bg-white/5">
                                <p className="text-xs text-muted-foreground mb-1">Price</p>
                                <p className="text-white font-medium">
                                  ${tokenMetadata.price < 0.000001 ? tokenMetadata.price.toFixed(10) : tokenMetadata.price < 0.0001 ? tokenMetadata.price.toFixed(8) : tokenMetadata.price < 0.01 ? tokenMetadata.price.toFixed(6) : tokenMetadata.price.toFixed(4)}
                                </p>
                                {tokenMetadata.priceChange24h !== null && (
                                  <p className={`text-xs ${tokenMetadata.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {tokenMetadata.priceChange24h >= 0 ? '+' : ''}{tokenMetadata.priceChange24h.toFixed(2)}% (24h)
                                  </p>
                                )}
                              </div>
                            )}
                            {tokenMetadata.fdv !== null && (
                              <div className="p-3 rounded-lg bg-white/5">
                                <p className="text-xs text-muted-foreground mb-1">FDV</p>
                                <p className="text-white font-medium">
                                  ${tokenMetadata.fdv >= 1e9 
                                    ? (tokenMetadata.fdv / 1e9).toFixed(2) + 'B'
                                    : tokenMetadata.fdv >= 1e6 
                                      ? (tokenMetadata.fdv / 1e6).toFixed(2) + 'M'
                                      : tokenMetadata.fdv.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {tokenMetadata.totalSupply !== null && (
                              <div className="p-3 rounded-lg bg-white/5">
                                <p className="text-xs text-muted-foreground mb-1">Total Supply</p>
                                <p className="text-white font-medium">
                                  {tokenMetadata.totalSupply >= 1e9 
                                    ? (tokenMetadata.totalSupply / 1e9).toFixed(2) + 'B'
                                    : tokenMetadata.totalSupply >= 1e6 
                                      ? (tokenMetadata.totalSupply / 1e6).toFixed(2) + 'M'
                                      : tokenMetadata.totalSupply.toLocaleString()}
                                </p>
                              </div>
                            )}
                            <div className="p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-muted-foreground mb-1">Decimals</p>
                              <p className="text-white font-medium">{tokenDecimals}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 rounded bg-white/5">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Mint Authority</span>
                              </div>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${tokenMetadata.mintAuthority ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                    {tokenMetadata.mintAuthority ? 'Active' : 'Revoked'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {tokenMetadata.mintAuthority 
                                    ? 'Token creator can mint more tokens' 
                                    : 'No new tokens can be created'}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded bg-white/5">
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Freeze Authority</span>
                              </div>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${tokenMetadata.freezeAuthority ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                    {tokenMetadata.freezeAuthority ? 'Active' : 'Revoked'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {tokenMetadata.freezeAuthority 
                                    ? 'Token accounts can be frozen by creator' 
                                    : 'Token accounts cannot be frozen'}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {burnHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-black/40 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <Clock className="h-4 w-4 text-primary" />
                          Recent Burns
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {burnHistory.slice(0, 5).map((record, index) => (
                            <div key={record.signature} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                              <div>
                                <p className="text-white font-medium">
                                  {record.amount.toLocaleString()} {record.symbol || 'tokens'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {record.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                              <a
                                href={`https://solscan.io/tx/${record.signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 text-sm"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <Card className="bg-black/40 border-white/10">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      How Token Burning Works
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">1.</span>
                        Enter the SPL token mint address you want to burn
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">2.</span>
                        Check your balance and review token details
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">3.</span>
                        Enter the amount and review the supply impact
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">4.</span>
                        Confirm the transaction in your wallet
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-black/95 border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                Confirm Token Burn
              </DialogTitle>
              <DialogDescription>
                Please review the details before confirming this irreversible action.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">Warning</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This action is permanent and cannot be undone. The burned tokens will be removed from circulation forever.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Token</span>
                  <span className="text-white font-medium">
                    {tokenMetadata.symbol || tokenAddress.slice(0, 8) + '...'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Amount to Burn</span>
                  <span className="text-white font-bold text-lg">
                    {parseFloat(burnAmount).toLocaleString()}
                  </span>
                </div>
                {burnValueUsd !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-muted-foreground">USD Value</span>
                    <span className="text-white font-medium">
                      ${burnValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {supplyPercentage !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-muted-foreground">% of Total Supply</span>
                    <span className="text-white font-medium">
                      {supplyPercentage < 0.01 ? '<0.01' : supplyPercentage.toFixed(4)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
                data-testid="button-cancel-burn"
              >
                Cancel
              </Button>
              <Button
                onClick={executeBurn}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="button-confirm-burn"
              >
                <Flame className="mr-2 h-4 w-4" />
                Confirm Burn
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-md" style={{ backgroundColor: '#0a0a0a' }}>
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Burn Complete
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Your tokens have been permanently removed from circulation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Success
                </div>
                <p className="text-sm text-gray-300">
                  The burn transaction was confirmed on the Solana blockchain. The tokens are now permanently destroyed.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">Token</span>
                  <span className="text-white font-medium">{burnResult?.symbol || tokenAddress.slice(0, 8) + '...'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">Amount Burned</span>
                  <span className="text-white font-bold text-lg">{burnResult?.amount.toLocaleString()}</span>
                </div>
                {burnValueUsd !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-400">USD Value</span>
                    <span className="text-white font-medium">${burnValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {supplyPercentage !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-400">% of Total Supply</span>
                    <span className="text-white font-medium">{supplyPercentage < 0.01 ? '<0.01' : supplyPercentage.toFixed(4)}%</span>
                  </div>
                )}
                {burnResult?.signature && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-400">Transaction</span>
                    <a
                      href={`https://solscan.io/tx/${burnResult.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                      data-testid="link-solscan-tx"
                    >
                      View on Solscan <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSuccessDialog(false)}
                className="flex-1 border-white/20 bg-transparent hover:bg-white/10"
                data-testid="button-close-success"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  setTokenAddress("");
                  setTokenBalance(null);
                  setBurnAmount("");
                  setTokenMetadata({
                    name: null,
                    symbol: null,
                    image: null,
                    totalSupply: null,
                    price: null,
                    fdv: null,
                    priceChange24h: null,
                    freezeAuthority: null,
                    mintAuthority: null,
                    tokenProgram: null,
                    tokenAccountAddress: null,
                  });
                }}
                className="flex-1 bg-primary text-black hover:bg-primary/90"
                data-testid="button-burn-another"
              >
                <Flame className="mr-2 h-4 w-4" />
                Burn More
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
