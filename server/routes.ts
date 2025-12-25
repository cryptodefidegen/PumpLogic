import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAllocationSchema, insertTransactionSchema, insertAutomationConfigSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  // AI Optimizer endpoint (simulated for now)
  app.post("/api/optimize/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return optimized allocations based on "market conditions"
      const optimized = {
        userId,
        marketMaking: 40,
        buyback: 25,
        liquidity: 25,
        revenue: 10,
      };

      const allocation = await storage.upsertAllocation(optimized);
      
      // Log optimization event
      await storage.createTransaction({
        userId,
        type: "OPTIMIZE",
        detail: "AI rebalanced allocations (High Volatility detected)",
        amount: "-",
        signature: null,
      });

      return res.json(allocation);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
