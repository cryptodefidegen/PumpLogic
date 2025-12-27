import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { storage } from "../storage";
import { sendLargeBuyNotification, sendFeeReadyNotification } from "./telegram";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const POLL_INTERVAL = 30000;
const LARGE_BUY_THRESHOLD_TOKENS = 10000;
const FEE_READY_THRESHOLD_SOL = 0.01;

interface MonitoredToken {
  contractAddress: string;
  feeWallet: string | null;
  userId: string;
  lastCheckedSignature: string | null;
}

interface TokenBalanceChange {
  mint: string;
  owner: string;
  preAmount: number;
  postAmount: number;
  change: number;
}

class TokenMonitorService {
  private connection: Connection;
  private isRunning: boolean = false;
  private monitoredTokens: Map<string, MonitoredToken> = new Map();
  private lastFeeBalances: Map<string, number> = new Map();

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, "confirmed");
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("Token monitor service started");
    
    await this.loadTokensFromDatabase();
    this.poll();
  }

  stop() {
    this.isRunning = false;
    console.log("Token monitor service stopped");
  }

  async addToken(userId: string, contractAddress: string, feeWallet: string | null) {
    this.monitoredTokens.set(userId, {
      contractAddress,
      feeWallet,
      userId,
      lastCheckedSignature: null
    });
    console.log(`Monitoring token ${contractAddress} for user ${userId}`);
  }

  removeToken(userId: string) {
    this.monitoredTokens.delete(userId);
  }

  private async loadTokensFromDatabase() {
    try {
      const allUsers = await storage.getAllUsers();
      for (const user of allUsers) {
        const settings = await storage.getTokenSettings(user.id);
        if (settings?.contractAddress) {
          await this.addToken(user.id, settings.contractAddress, settings.feeCollectionWallet);
        }
      }
      console.log(`Loaded ${this.monitoredTokens.size} tokens for monitoring`);
    } catch (error) {
      console.error("Error loading tokens from database:", error);
    }
  }

  private async poll() {
    while (this.isRunning) {
      try {
        await this.checkAllTokens();
        await this.checkFeeWallets();
      } catch (error) {
        console.error("Token monitor poll error:", error);
      }
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
  }

  private async checkAllTokens() {
    const entries = Array.from(this.monitoredTokens.entries());
    for (const [userId, token] of entries) {
      try {
        await this.checkTokenTransactions(userId, token);
      } catch (error) {
        console.error(`Error checking token for user ${userId}:`, error);
      }
    }
  }

  private async checkTokenTransactions(userId: string, token: MonitoredToken) {
    if (!token.contractAddress) return;

    try {
      const publicKey = new PublicKey(token.contractAddress);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 20 });

      if (signatures.length === 0) return;

      const newSignatures: typeof signatures = [];
      for (const sig of signatures) {
        if (sig.signature === token.lastCheckedSignature) {
          break;
        }
        newSignatures.push(sig);
      }

      if (newSignatures.length > 0) {
        token.lastCheckedSignature = signatures[0].signature;
      }

      if (token.lastCheckedSignature === null && signatures.length > 0) {
        token.lastCheckedSignature = signatures[0].signature;
        return;
      }

      for (const sig of newSignatures) {
        try {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (tx && tx.meta) {
            const tokenChanges = this.parseTokenBalanceChanges(tx.meta, token.contractAddress);
            
            for (const change of tokenChanges) {
              if (change.change >= LARGE_BUY_THRESHOLD_TOKENS) {
                const telegramSettings = await storage.getTelegramSettings(userId);
                if (telegramSettings?.isEnabled && telegramSettings?.notifyOnLargeBuy && telegramSettings?.chatId) {
                  await sendLargeBuyNotification(
                    telegramSettings.chatId,
                    change.owner,
                    this.formatTokenAmount(change.change),
                    token.contractAddress
                  );
                  console.log(`Large buy notification sent for ${change.change} tokens to ${change.owner}`);
                }
              }
            }
          }
        } catch (txError) {
          console.error("Error processing transaction:", txError);
        }
      }
    } catch (error) {
      console.error("Error checking token transactions:", error);
    }
  }

  private parseTokenBalanceChanges(meta: any, tokenMint: string): TokenBalanceChange[] {
    const changes: TokenBalanceChange[] = [];
    const preTokenBalances = meta.preTokenBalances || [];
    const postTokenBalances = meta.postTokenBalances || [];

    const preBalanceMap = new Map<number, any>();
    for (const balance of preTokenBalances) {
      if (balance.mint === tokenMint) {
        preBalanceMap.set(balance.accountIndex, balance);
      }
    }

    for (const postBalance of postTokenBalances) {
      if (postBalance.mint !== tokenMint) continue;

      const preBalance = preBalanceMap.get(postBalance.accountIndex);
      const preAmount = preBalance?.uiTokenAmount?.uiAmount || 0;
      const postAmount = postBalance?.uiTokenAmount?.uiAmount || 0;
      const change = postAmount - preAmount;

      if (change > 0) {
        changes.push({
          mint: tokenMint,
          owner: postBalance.owner || "Unknown",
          preAmount,
          postAmount,
          change
        });
      }
    }

    return changes;
  }

  private formatTokenAmount(amount: number): string {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2) + "M";
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(2) + "K";
    }
    return amount.toFixed(2);
  }

  private async checkFeeWallets() {
    const entries = Array.from(this.monitoredTokens.entries());
    for (const [userId, token] of entries) {
      if (!token.feeWallet) continue;

      try {
        const publicKey = new PublicKey(token.feeWallet);
        const balance = await this.connection.getBalance(publicKey);
        const balanceSOL = balance / LAMPORTS_PER_SOL;
        
        const lastBalance = this.lastFeeBalances.get(userId) || 0;
        
        if (balanceSOL >= FEE_READY_THRESHOLD_SOL && lastBalance < FEE_READY_THRESHOLD_SOL) {
          const telegramSettings = await storage.getTelegramSettings(userId);
          if (telegramSettings?.isEnabled && telegramSettings?.notifyOnFeeReady && telegramSettings?.chatId) {
            const dashboardUrl = process.env.REPL_SLUG 
              ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
              : "https://pumplogic.replit.app";
            
            await sendFeeReadyNotification(
              telegramSettings.chatId,
              balanceSOL.toFixed(4),
              dashboardUrl
            );
            console.log(`Fee ready notification sent: ${balanceSOL.toFixed(4)} SOL`);
          }
        }
        
        this.lastFeeBalances.set(userId, balanceSOL);
      } catch (error) {
        console.error(`Error checking fee wallet for user ${userId}:`, error);
      }
    }
  }

  async refreshTokenForUser(userId: string) {
    try {
      const settings = await storage.getTokenSettings(userId);
      if (settings?.contractAddress) {
        this.addToken(userId, settings.contractAddress, settings.feeCollectionWallet);
        console.log(`Refreshed monitoring for user ${userId}: ${settings.contractAddress}`);
      }
    } catch (error) {
      console.error(`Error refreshing token for user ${userId}:`, error);
    }
  }
}

export const tokenMonitor = new TokenMonitorService();
