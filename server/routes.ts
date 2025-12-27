import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertAllocationSchema, insertTransactionSchema, insertAutomationConfigSchema, insertDestinationWalletsSchema, insertTelegramSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { solanaService } from "./services/solana";
import { getBot } from "./services/telegram";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use('/downloads', express.static(path.join(process.cwd(), 'attached_assets/generated_images')));
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

  // Test telegram notification
  app.post("/api/telegram-settings/test", async (req, res) => {
    try {
      const { chatId } = req.body;
      
      if (!chatId) {
        return res.status(400).json({ error: "Chat ID is required" });
      }

      const bot = getBot();
      if (!bot) {
        return res.status(503).json({ error: "Telegram bot is not configured" });
      }

      await bot.sendMessage(
        chatId,
        `*PumpLogic Test Notification*\n\nYour Telegram notifications are working correctly!\n\nYou will receive alerts for:\n• Distribution confirmations\n• Fee accumulation reminders\n• Large buyer activity`,
        { parse_mode: "Markdown" }
      );

      return res.json({ success: true, message: "Test notification sent" });
    } catch (error: any) {
      console.error("Failed to send test notification:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
