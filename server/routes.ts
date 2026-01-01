import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertAllocationSchema, insertTransactionSchema, insertAutomationConfigSchema, insertDestinationWalletsSchema, insertTelegramSettingsSchema, insertTokenSettingsSchema, insertLinkedWalletSchema, insertPriceAlertSchema, insertMultiTokenSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { solanaService } from "./services/solana";
import { getBot } from "./services/telegram";
import { tokenMonitor } from "./services/tokenMonitor";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use('/downloads', express.static(path.join(process.cwd(), 'attached_assets/generated_images')));
  app.use('/guides', express.static(path.join(process.cwd(), 'public')));
  // Get or create user by wallet address
  app.post("/api/auth/wallet", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      let user = await storage.getUserByWallet(walletAddress);
      
      if (!user) {
        user = await storage.createUser({ walletAddress });
      }

      return res.json({ user });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });


  // Get allocation for a user
  app.get("/api/allocations/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const allocation = await storage.getAllocation(userId);
      
      if (!allocation) {
        return res.json({
          userId,
          marketMaking: 25,
          buyback: 25,
          liquidity: 25,
          revenue: 25,
        });
      }

      return res.json(allocation);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Save allocation
  app.post("/api/allocations", async (req, res) => {
    try {
      const validated = insertAllocationSchema.parse(req.body);
      
      // Validate total is 100
      const marketMaking = validated.marketMaking ?? 25;
      const buyback = validated.buyback ?? 25;
      const liquidity = validated.liquidity ?? 25;
      const revenue = validated.revenue ?? 25;
      
      const total = marketMaking + buyback + liquidity + revenue;
      if (total !== 100) {
        return res.status(400).json({ error: "Allocations must total exactly 100%" });
      }

      const allocation = await storage.upsertAllocation({
        ...validated,
        marketMaking,
        buyback,
        liquidity,
        revenue,
      });
      return res.json(allocation);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // Get transactions
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const txs = await storage.getTransactions(userId, limit);
      return res.json(txs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Create transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const validated = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validated);
      return res.json(transaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // Get automation config
  app.get("/api/automation/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const config = await storage.getAutomationConfig(userId);
      
      if (!config) {
        return res.json({
          userId,
          isActive: false,
          rsi: null,
          volatility: null,
        });
      }

      return res.json(config);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update automation config
  app.post("/api/automation", async (req, res) => {
    try {
      const validated = insertAutomationConfigSchema.parse(req.body);
      const config = await storage.upsertAutomationConfig(validated);
      return res.json(config);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // Get destination wallets
  app.get("/api/destination-wallets/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const wallets = await storage.getDestinationWallets(userId);
      
      if (!wallets) {
        return res.json({
          userId,
          marketMakingWallet: null,
          buybackWallet: null,
          liquidityWallet: null,
          revenueWallet: null,
        });
      }

      return res.json(wallets);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update destination wallets
  app.post("/api/destination-wallets", async (req, res) => {
    try {
      const validated = insertDestinationWalletsSchema.parse(req.body);
      
      // Validate wallet addresses if provided
      const walletsToValidate = [
        validated.marketMakingWallet,
        validated.buybackWallet,
        validated.liquidityWallet,
        validated.revenueWallet,
      ].filter(Boolean);
      
      for (const wallet of walletsToValidate) {
        if (wallet && !(await solanaService.validateWalletAddress(wallet))) {
          return res.status(400).json({ error: `Invalid wallet address: ${wallet}` });
        }
      }

      const wallets = await storage.upsertDestinationWallets(validated);
      return res.json(wallets);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // Get wallet balance
  app.get("/api/solana/balance/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      if (!(await solanaService.validateWalletAddress(walletAddress))) {
        return res.status(400).json({ error: "Invalid wallet address" });
      }

      const balance = await solanaService.getBalance(walletAddress);
      return res.json({ balance, walletAddress });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get network stats
  app.get("/api/solana/network-stats", async (req, res) => {
    try {
      const stats = await solanaService.getNetworkStats();
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Create distribution transaction (returns unsigned transaction for frontend signing)
  app.post("/api/solana/create-distribution", async (req, res) => {
    try {
      const { userId, fromWallet, amount } = req.body;
      
      if (!userId || !fromWallet || !amount) {
        return res.status(400).json({ error: "userId, fromWallet, and amount are required" });
      }

      // Get allocations and destination wallets
      const allocation = await storage.getAllocation(userId);
      const destWallets = await storage.getDestinationWallets(userId);

      if (!allocation) {
        return res.status(400).json({ error: "No allocation settings found" });
      }

      // Check that at least one channel has both allocation > 0 and a wallet configured
      const hasValidChannel = 
        (allocation.marketMaking > 0 && destWallets?.marketMakingWallet) ||
        (allocation.buyback > 0 && destWallets?.buybackWallet) ||
        (allocation.liquidity > 0 && destWallets?.liquidityWallet) ||
        (allocation.revenue > 0 && destWallets?.revenueWallet);

      if (!hasValidChannel) {
        return res.status(400).json({ error: "Configure at least one destination wallet for a channel with allocation > 0%" });
      }

      const result = await solanaService.createDistributionTransaction(
        fromWallet,
        {
          marketMaking: destWallets?.marketMakingWallet ? allocation.marketMaking : 0,
          buyback: destWallets?.buybackWallet ? allocation.buyback : 0,
          liquidity: destWallets?.liquidityWallet ? allocation.liquidity : 0,
          revenue: destWallets?.revenueWallet ? allocation.revenue : 0,
        },
        parseFloat(amount),
        {
          marketMaking: destWallets?.marketMakingWallet || "",
          buyback: destWallets?.buybackWallet || "",
          liquidity: destWallets?.liquidityWallet || "",
          revenue: destWallets?.revenueWallet || "",
        }
      );

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Record a confirmed transaction
  app.post("/api/solana/record-transaction", async (req, res) => {
    try {
      const { userId, signature, amount, breakdown } = req.body;
      
      if (!userId || !signature) {
        return res.status(400).json({ error: "userId and signature are required" });
      }

      // Confirm transaction on chain
      const confirmed = await solanaService.confirmTransaction(signature);
      
      if (!confirmed) {
        return res.status(400).json({ error: "Transaction not confirmed on chain" });
      }

      // Record main distribution transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "DISTRIBUTE",
        detail: `Fee distribution: ${amount} SOL`,
        amount: `${amount} SOL`,
        signature,
      });

      // Record individual channel transactions
      if (breakdown) {
        const channels = [
          { type: "MARKET_MAKING", amount: breakdown.marketMaking },
          { type: "BUYBACK", amount: breakdown.buyback },
          { type: "LIQUIDITY", amount: breakdown.liquidity },
          { type: "REVENUE", amount: breakdown.revenue },
        ];

        for (const channel of channels) {
          if (channel.amount > 0) {
            await storage.createTransaction({
              userId,
              type: channel.type,
              detail: `${channel.type.replace("_", " ")} allocation`,
              amount: `${channel.amount.toFixed(6)} SOL`,
              signature,
            });
          }
        }
      }

      return res.json({ success: true, transaction });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // AI Optimizer endpoint
  app.post("/api/optimize/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get current network stats for "AI analysis"
      let networkStats;
      try {
        networkStats = await solanaService.getNetworkStats();
      } catch {
        networkStats = { tps: 2000, slot: 0 };
      }
      
      // Simulate AI analysis based on network conditions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate optimized allocations based on "market conditions"
      // Higher TPS = more active network = favor market making
      // Lower TPS = quieter = favor buyback
      const tpsRatio = Math.min(networkStats.tps / 3000, 1);
      
      const optimized = {
        userId,
        marketMaking: Math.round(20 + (tpsRatio * 25)),
        buyback: Math.round(35 - (tpsRatio * 15)),
        liquidity: 25,
        revenue: 0,
      };
      
      // Ensure totals 100
      optimized.revenue = 100 - optimized.marketMaking - optimized.buyback - optimized.liquidity;

      const allocation = await storage.upsertAllocation(optimized);
      
      // Update automation config with current stats
      await storage.upsertAutomationConfig({
        userId,
        isActive: true,
        rsi: (30 + Math.random() * 40).toFixed(1),
        volatility: tpsRatio > 0.6 ? "High" : tpsRatio > 0.3 ? "Medium" : "Low",
      });
      
      // Log optimization event
      await storage.createTransaction({
        userId,
        type: "OPTIMIZE",
        detail: `AI rebalanced allocations (TPS: ${networkStats.tps}, Volatility: ${tpsRatio > 0.6 ? "High" : "Medium"})`,
        amount: "-",
        signature: null,
      });

      return res.json(allocation);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== ALLOCATION PRESETS =====
  
  // Get all presets for user
  app.get("/api/presets/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const presets = await storage.getPresets(userId);
      return res.json(presets);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Create a new preset
  app.post("/api/presets", async (req, res) => {
    try {
      const { userId, name, marketMaking, buyback, liquidity, revenue } = req.body;
      
      if (!userId || !name) {
        return res.status(400).json({ error: "userId and name are required" });
      }

      const total = marketMaking + buyback + liquidity + revenue;
      if (total !== 100) {
        return res.status(400).json({ error: "Allocations must sum to 100%" });
      }

      const preset = await storage.createPreset({
        userId,
        name,
        marketMaking,
        buyback,
        liquidity,
        revenue,
      });

      return res.json(preset);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Delete a preset
  app.delete("/api/presets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePreset(id);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get telegram settings for a user
  app.get("/api/telegram-settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const settings = await storage.getTelegramSettings(userId);
      return res.json(settings || {
        userId,
        chatId: null,
        isEnabled: false,
        notifyOnDistribution: true,
        notifyOnFeeReady: true,
        notifyOnLargeBuy: false,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update telegram settings
  app.post("/api/telegram-settings", async (req, res) => {
    try {
      const validated = insertTelegramSettingsSchema.parse(req.body);
      const settings = await storage.upsertTelegramSettings(validated);
      return res.json(settings);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // Get token settings for a user
  app.get("/api/token-settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const settings = await storage.getTokenSettings(userId);
      return res.json(settings || {
        userId,
        tokenName: null,
        tokenSymbol: null,
        contractAddress: null,
        feeCollectionWallet: null,
        feePercentage: 1,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update token settings
  app.post("/api/token-settings", async (req, res) => {
    try {
      const validated = insertTokenSettingsSchema.parse(req.body);
      const settings = await storage.upsertTokenSettings(validated);
      
      if (settings.contractAddress) {
        tokenMonitor.addToken(
          settings.userId,
          settings.contractAddress,
          settings.feeCollectionWallet
        );
      }
      
      return res.json(settings);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // Start monitoring a token manually
  app.post("/api/token-monitor/start", async (req, res) => {
    try {
      const { userId, contractAddress, feeWallet } = req.body;
      
      if (!userId || !contractAddress) {
        return res.status(400).json({ error: "userId and contractAddress are required" });
      }

      tokenMonitor.addToken(userId, contractAddress, feeWallet || null);
      return res.json({ success: true, message: `Monitoring started for ${contractAddress}` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Test telegram notification
  app.post("/api/telegram-settings/test", async (req, res) => {
    try {
      const { chatId, type } = req.body;
      
      if (!chatId) {
        return res.status(400).json({ error: "Chat ID is required" });
      }

      const bot = getBot();
      if (!bot) {
        return res.status(503).json({ error: "Telegram bot is not configured" });
      }

      let message = "";
      
      if (type === "large_buy") {
        message = `*Large Buy Detected*\n\nBuyer: \`7xKp2m...9aB4cD\`\nAmount: 0.5 SOL\n\n[View Token](https://solscan.io/token/93tQHLgbK4J8dzv3xictW46JqfKCjKcoe69Q9nrtpump)`;
      } else if (type === "fee_ready") {
        message = `*Fees Ready to Distribute*\n\nYour wallet has accumulated 0.25 SOL ready for distribution.\n\n[Open Dashboard](https://pumplogic.replit.app) to distribute now.`;
      } else {
        message = `*PumpLogic Test Notification*\n\nYour Telegram notifications are working correctly!\n\nYou will receive alerts for:\n• Distribution confirmations\n• Fee accumulation reminders\n• Large buyer activity`;
      }

      await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      return res.json({ success: true, message: "Test notification sent" });
    } catch (error: any) {
      console.error("Failed to send test notification:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== LINKED WALLETS (Multi-Wallet Support) =====
  
  // Get all linked wallets for a user
  app.get("/api/linked-wallets/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const wallets = await storage.getLinkedWallets(userId);
      return res.json(wallets);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Add a linked wallet
  app.post("/api/linked-wallets", async (req, res) => {
    try {
      const validated = insertLinkedWalletSchema.parse(req.body);
      
      if (!(await solanaService.validateWalletAddress(validated.walletAddress))) {
        return res.status(400).json({ error: "Invalid wallet address" });
      }

      const wallet = await storage.addLinkedWallet(validated);
      return res.json(wallet);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // Remove a linked wallet
  app.delete("/api/linked-wallets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.removeLinkedWallet(id);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Set active wallet
  app.post("/api/linked-wallets/:userId/set-active", async (req, res) => {
    try {
      const { userId } = req.params;
      const { walletId } = req.body;
      
      if (!walletId) {
        return res.status(400).json({ error: "walletId is required" });
      }

      await storage.setActiveWallet(userId, walletId);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get active wallet
  app.get("/api/linked-wallets/:userId/active", async (req, res) => {
    try {
      const { userId } = req.params;
      const wallet = await storage.getActiveWallet(userId);
      return res.json(wallet || null);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== PRICE ALERTS =====
  
  // Get all price alerts for a user
  app.get("/api/price-alerts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const alerts = await storage.getPriceAlerts(userId);
      return res.json(alerts);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Create a price alert
  app.post("/api/price-alerts", async (req, res) => {
    try {
      const validated = insertPriceAlertSchema.parse(req.body);
      const alert = await storage.createPriceAlert(validated);
      return res.json(alert);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // Update a price alert
  app.patch("/api/price-alerts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.updatePriceAlert(id, req.body);
      return res.json(alert);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Delete a price alert
  app.delete("/api/price-alerts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePriceAlert(id);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== MULTI-TOKEN SETTINGS =====
  
  // Get all tokens for a user
  app.get("/api/multi-token/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const tokens = await storage.getMultiTokenSettings(userId);
      return res.json(tokens);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get active token
  app.get("/api/multi-token/:userId/active", async (req, res) => {
    try {
      const { userId } = req.params;
      const token = await storage.getActiveToken(userId);
      return res.json(token || null);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Create a token
  app.post("/api/multi-token", async (req, res) => {
    try {
      const validated = insertMultiTokenSettingsSchema.parse(req.body);
      const token = await storage.createMultiTokenSettings(validated);
      return res.json(token);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // Update a token
  app.patch("/api/multi-token/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const token = await storage.updateMultiTokenSettings(id, req.body);
      return res.json(token);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Delete a token
  app.delete("/api/multi-token/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMultiTokenSettings(id);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Set active token
  app.post("/api/multi-token/:userId/set-active", async (req, res) => {
    try {
      const { userId } = req.params;
      const { tokenId } = req.body;
      
      if (!tokenId) {
        return res.status(400).json({ error: "tokenId is required" });
      }

      await storage.setActiveToken(userId, tokenId);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Analytics endpoint - get real data for analytics page
  app.get("/api/analytics/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const tokenAddress = req.query.tokenAddress as string | undefined;

      // Get user's allocation settings
      const allocation = await storage.getAllocation(userId);
      
      // Get user's transactions to calculate real fees
      const allTransactions = await storage.getTransactions(userId, 100);
      
      // Get user's active token or specified token
      // If tokenAddress is "default" or undefined, use PLOGIC token
      let activeToken = null;
      if (tokenAddress && tokenAddress !== "default") {
        const tokens = await storage.getMultiTokenSettings(userId);
        activeToken = tokens.find(t => t.contractAddress === tokenAddress);
      }
      // If no token specified or "default", activeToken stays null and we use PLOGIC defaults below
      
      // Get all tokens for the user
      const allTokens = await storage.getMultiTokenSettings(userId);

      // Calculate total fees from distribution transactions
      let totalFeesCollected = 0;
      let totalMarketMaking = 0;
      let totalBuyback = 0;
      let totalLiquidity = 0;
      let totalRevenue = 0;

      // Sum up distribution amounts (type is uppercase "DISTRIBUTE")
      const distributionTxs = allTransactions.filter(tx => tx.type.toUpperCase() === 'DISTRIBUTE');
      distributionTxs.forEach(tx => {
        const amount = parseFloat(tx.amount) || 0;
        totalFeesCollected += amount;
      });

      // Sum up individual channel transactions for accurate breakdown
      allTransactions.forEach(tx => {
        const amount = parseFloat(tx.amount) || 0;
        const txType = tx.type.toUpperCase();
        
        if (txType === 'MARKET_MAKING' || txType === 'MARKETMAKING') {
          totalMarketMaking += amount;
        } else if (txType === 'BUYBACK') {
          totalBuyback += amount;
        } else if (txType === 'LIQUIDITY' || txType === 'LP') {
          totalLiquidity += amount;
        } else if (txType === 'REVENUE' || txType === 'CREATOR') {
          totalRevenue += amount;
        }
      });

      // If no channel-specific transactions, estimate from distributions
      if (totalMarketMaking === 0 && totalBuyback === 0 && totalLiquidity === 0 && totalRevenue === 0 && totalFeesCollected > 0) {
        if (allocation) {
          totalMarketMaking = totalFeesCollected * (allocation.marketMaking / 100);
          totalBuyback = totalFeesCollected * (allocation.buyback / 100);
          totalLiquidity = totalFeesCollected * (allocation.liquidity / 100);
          totalRevenue = totalFeesCollected * (allocation.revenue / 100);
        }
      }

      // Fetch token data from DexScreener and Jupiter
      let tokenPrice = 0;
      let tokenSymbol = activeToken?.tokenSymbol || "$PLOGIC";
      let tokenName = activeToken?.tokenName || "PumpLogic";
      const tokenMint = activeToken?.contractAddress || "63k7noZHAPfxnwzq4wGHJG4kksT7enoT2ua3shQ2pump";
      
      let volume24h = 0;
      let liquidity = 0;
      let priceChange24h = 0;
      let marketCap = 0;
      let holders = 0;
      let txns24h = { buys: 0, sells: 0 };

      // Try DexScreener first (better data for pump.fun tokens)
      try {
        const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`);
        if (dexResponse.ok) {
          const dexData = await dexResponse.json();
          if (dexData.pairs && dexData.pairs.length > 0) {
            // Get the pair with highest liquidity
            const bestPair = dexData.pairs.reduce((best: any, pair: any) => {
              const pairLiq = parseFloat(pair.liquidity?.usd || 0);
              const bestLiq = parseFloat(best?.liquidity?.usd || 0);
              return pairLiq > bestLiq ? pair : best;
            }, dexData.pairs[0]);
            
            tokenPrice = parseFloat(bestPair.priceUsd) || 0;
            volume24h = parseFloat(bestPair.volume?.h24) || 0;
            liquidity = parseFloat(bestPair.liquidity?.usd) || 0;
            priceChange24h = parseFloat(bestPair.priceChange?.h24) || 0;
            marketCap = parseFloat(bestPair.marketCap) || parseFloat(bestPair.fdv) || 0;
            txns24h = {
              buys: bestPair.txns?.h24?.buys || 0,
              sells: bestPair.txns?.h24?.sells || 0,
            };
            
            // Update token name/symbol from DexScreener if available
            if (bestPair.baseToken) {
              tokenSymbol = bestPair.baseToken.symbol || tokenSymbol;
              tokenName = bestPair.baseToken.name || tokenName;
            }
          }
        }
      } catch (error) {
        console.error("DexScreener API error:", error);
      }

      // Fallback to Jupiter if DexScreener didn't return a price
      if (tokenPrice === 0) {
        try {
          const priceResponse = await fetch(`https://api.jup.ag/price/v2?ids=${tokenMint}`);
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            const price = priceData.data?.[tokenMint]?.price;
            tokenPrice = typeof price === "number" ? price : parseFloat(price) || 0;
          }
        } catch (error) {
          console.error("Jupiter API error:", error);
        }
      }

      // Calculate transaction stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const last30DaysTxs = allTransactions.filter(tx => new Date(tx.createdAt) >= thirtyDaysAgo);
      const last7DaysTxs = allTransactions.filter(tx => new Date(tx.createdAt) >= sevenDaysAgo);

      // Calculate daily volume for last 7 days
      const dailyVolume: { date: string; volume: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayVolume = last7DaysTxs
          .filter(tx => tx.createdAt.toISOString().split('T')[0] === dateStr)
          .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
        
        dailyVolume.push({
          date: date.toLocaleDateString([], { weekday: 'short' }),
          volume: dayVolume,
        });
      }

      return res.json({
        token: {
          address: tokenMint,
          name: tokenName,
          symbol: tokenSymbol,
          price: tokenPrice,
          marketCap: marketCap || tokenPrice * 1000000000,
          volume24h,
          liquidity,
          priceChange24h,
          txns24h,
        },
        allocation: allocation || {
          marketMaking: 25,
          buyback: 25,
          liquidity: 25,
          revenue: 25,
        },
        fees: {
          totalCollected: totalFeesCollected,
          totalCollectedUsd: totalFeesCollected * (tokenPrice > 0 ? 1 : 1), // If in SOL, this is already USD-ish
          breakdown: {
            marketMaking: totalMarketMaking,
            buyback: totalBuyback,
            liquidity: totalLiquidity,
            revenue: totalRevenue,
          },
        },
        stats: {
          transactionsLast30Days: last30DaysTxs.length,
          transactionsLast7Days: last7DaysTxs.length,
          totalTransactions: allTransactions.length,
        },
        dailyVolume,
        availableTokens: allTokens.map(t => ({
          id: t.id,
          name: t.tokenName,
          symbol: t.tokenSymbol,
          address: t.contractAddress,
          isActive: t.isActive,
        })),
      });
    } catch (error: any) {
      console.error("Analytics error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Token info endpoint for burn feature
  app.get("/api/token/:mint", async (req, res) => {
    try {
      const { mint } = req.params;
      const { wallet } = req.query;
      
      if (!mint) {
        return res.status(400).json({ error: "Mint address is required" });
      }

      const { Connection, PublicKey } = await import("@solana/web3.js");
      const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
      const connection = new Connection(SOLANA_RPC, "confirmed");
      
      const mintPubkey = new PublicKey(mint);
      
      // Get mint info
      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
      
      if (!mintInfo.value || !('parsed' in mintInfo.value.data)) {
        return res.status(404).json({ error: "Token not found" });
      }

      const mintParsed = mintInfo.value.data.parsed;
      const decimals = mintParsed.info.decimals;
      const totalSupply = parseFloat(mintParsed.info.supply) / Math.pow(10, decimals);
      const freezeAuthority = mintParsed.info.freezeAuthority || null;
      const mintAuthority = mintParsed.info.mintAuthority || null;

      let balance = 0;
      
      if (wallet) {
        try {
          const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
          const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
          const ownerPubkey = new PublicKey(wallet as string);
          
          const [ata] = PublicKey.findProgramAddressSync(
            [ownerPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID
          );
          
          const ataInfo = await connection.getParsedAccountInfo(ata);
          if (ataInfo.value && 'parsed' in ataInfo.value.data) {
            balance = parseFloat(ataInfo.value.data.parsed.info.tokenAmount.uiAmount || 0);
          }
        } catch (e) {
          // Wallet has no balance
          balance = 0;
        }
      }

      // Fetch from DexScreener for price info
      let name = null;
      let symbol = null;
      let image = null;
      let price = null;
      let fdv = null;
      let priceChange24h = null;

      try {
        const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
        const dexData = await dexResponse.json();
        if (dexData.pairs && dexData.pairs.length > 0) {
          const pair = dexData.pairs[0];
          name = pair.baseToken?.name || null;
          symbol = pair.baseToken?.symbol || null;
          image = pair.info?.imageUrl || null;
          price = parseFloat(pair.priceUsd) || null;
          fdv = pair.fdv || null;
          priceChange24h = pair.priceChange?.h24 || null;
        }
      } catch (e) {
        // DexScreener fetch failed, continue with on-chain data
      }

      return res.json({
        mint,
        decimals,
        totalSupply,
        freezeAuthority,
        mintAuthority,
        balance,
        name,
        symbol,
        image,
        price,
        fdv,
        priceChange24h,
      });
    } catch (error: any) {
      console.error("Token info error:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch token info" });
    }
  });

  return httpServer;
}
