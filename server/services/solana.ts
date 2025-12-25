import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, "confirmed");
  }

  async getBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting balance:", error);
      throw new Error("Failed to get wallet balance");
    }
  }

  async getRecentTransactions(walletAddress: string, limit: number = 10) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });
      
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            err: sig.err,
            memo: sig.memo,
          };
        })
      );

      return transactions;
    } catch (error) {
      console.error("Error getting transactions:", error);
      throw new Error("Failed to get recent transactions");
    }
  }

  async validateWalletAddress(address: string): Promise<boolean> {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  async getSlotInfo() {
    try {
      const slot = await this.connection.getSlot();
      const blockTime = await this.connection.getBlockTime(slot);
      return { slot, blockTime };
    } catch (error) {
      console.error("Error getting slot info:", error);
      throw new Error("Failed to get network info");
    }
  }

  async createDistributionTransaction(
    fromWallet: string,
    allocations: {
      marketMaking: number;
      buyback: number;
      liquidity: number;
      revenue: number;
    },
    totalAmount: number,
    destinationWallets: {
      marketMaking: string;
      buyback: string;
      liquidity: string;
      revenue: string;
    }
  ): Promise<{
    transaction: string;
    breakdown: {
      marketMaking: number;
      buyback: number;
      liquidity: number;
      revenue: number;
    };
  }> {
    try {
      const fromPubkey = new PublicKey(fromWallet);
      const lamports = totalAmount * LAMPORTS_PER_SOL;

      const breakdown = {
        marketMaking: (allocations.marketMaking / 100) * lamports,
        buyback: (allocations.buyback / 100) * lamports,
        liquidity: (allocations.liquidity / 100) * lamports,
        revenue: (allocations.revenue / 100) * lamports,
      };

      const transaction = new Transaction();

      if (breakdown.marketMaking > 0) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: new PublicKey(destinationWallets.marketMaking),
            lamports: Math.floor(breakdown.marketMaking),
          })
        );
      }

      if (breakdown.buyback > 0) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: new PublicKey(destinationWallets.buyback),
            lamports: Math.floor(breakdown.buyback),
          })
        );
      }

      if (breakdown.liquidity > 0) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: new PublicKey(destinationWallets.liquidity),
            lamports: Math.floor(breakdown.liquidity),
          })
        );
      }

      if (breakdown.revenue > 0) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: new PublicKey(destinationWallets.revenue),
            lamports: Math.floor(breakdown.revenue),
          })
        );
      }

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      return {
        transaction: bs58.encode(serializedTransaction),
        breakdown: {
          marketMaking: breakdown.marketMaking / LAMPORTS_PER_SOL,
          buyback: breakdown.buyback / LAMPORTS_PER_SOL,
          liquidity: breakdown.liquidity / LAMPORTS_PER_SOL,
          revenue: breakdown.revenue / LAMPORTS_PER_SOL,
        },
      };
    } catch (error) {
      console.error("Error creating distribution transaction:", error);
      throw new Error("Failed to create distribution transaction");
    }
  }

  async confirmTransaction(signature: string): Promise<boolean> {
    try {
      const result = await this.connection.confirmTransaction(signature, "confirmed");
      return !result.value.err;
    } catch (error) {
      console.error("Error confirming transaction:", error);
      return false;
    }
  }

  async getNetworkStats() {
    try {
      const [slot, supply, performance] = await Promise.all([
        this.connection.getSlot(),
        this.connection.getSupply(),
        this.connection.getRecentPerformanceSamples(1),
      ]);

      return {
        slot,
        totalSupply: supply.value.total / LAMPORTS_PER_SOL,
        circulatingSupply: supply.value.circulating / LAMPORTS_PER_SOL,
        tps: performance[0]?.numTransactions || 0,
      };
    } catch (error) {
      console.error("Error getting network stats:", error);
      throw new Error("Failed to get network stats");
    }
  }

  async estimateTransactionFee(transaction: string): Promise<number> {
    try {
      const txBuffer = bs58.decode(transaction);
      const tx = Transaction.from(txBuffer);
      const fee = await this.connection.getFeeForMessage(tx.compileMessage());
      return (fee.value || 5000) / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error estimating fee:", error);
      return 0.000005;
    }
  }
}

export const solanaService = new SolanaService();
