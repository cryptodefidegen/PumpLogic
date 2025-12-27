import { db } from "../db/index";
import { users, allocations, transactions, automationConfigs, destinationWallets, allocationPresets, telegramSettings, tokenSettings } from "@shared/schema";
import type { User, InsertUser, Allocation, InsertAllocation, Transaction, InsertTransaction, AutomationConfig, InsertAutomationConfig, DestinationWallets, InsertDestinationWallets, AllocationPreset, InsertAllocationPreset, TelegramSettings, InsertTelegramSettings, TokenSettings, InsertTokenSettings } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Allocations
  getAllocation(userId: string): Promise<Allocation | undefined>;
  upsertAllocation(allocation: InsertAllocation): Promise<Allocation>;

  // Transactions  
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(userId: string, limit?: number): Promise<Transaction[]>;

  // Automation
  getAutomationConfig(userId: string): Promise<AutomationConfig | undefined>;
  upsertAutomationConfig(config: InsertAutomationConfig): Promise<AutomationConfig>;

  // Destination Wallets
  getDestinationWallets(userId: string): Promise<DestinationWallets | undefined>;
  upsertDestinationWallets(wallets: InsertDestinationWallets): Promise<DestinationWallets>;

  // Allocation Presets
  getPresets(userId: string): Promise<AllocationPreset[]>;
  createPreset(preset: InsertAllocationPreset): Promise<AllocationPreset>;
  deletePreset(id: string): Promise<void>;

  // Telegram Settings
  getTelegramSettings(userId: string): Promise<TelegramSettings | undefined>;
  upsertTelegramSettings(settings: InsertTelegramSettings): Promise<TelegramSettings>;
  getTelegramSettingsByChatId(chatId: string): Promise<TelegramSettings | undefined>;

  // Token Settings
  getTokenSettings(userId: string): Promise<TokenSettings | undefined>;
  upsertTokenSettings(settings: InsertTokenSettings): Promise<TokenSettings>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Allocations
  async getAllocation(userId: string): Promise<Allocation | undefined> {
    const result = await db.select().from(allocations).where(eq(allocations.userId, userId)).limit(1);
    return result[0];
  }

  async upsertAllocation(allocation: InsertAllocation): Promise<Allocation> {
    const existing = await this.getAllocation(allocation.userId);
    
    if (existing) {
      const result = await db.update(allocations)
        .set({
          marketMaking: allocation.marketMaking,
          buyback: allocation.buyback,
          liquidity: allocation.liquidity,
          revenue: allocation.revenue,
          updatedAt: new Date(),
        })
        .where(eq(allocations.userId, allocation.userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(allocations).values(allocation).returning();
      return result[0];
    }
  }

  // Transactions
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async getTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Automation
  async getAutomationConfig(userId: string): Promise<AutomationConfig | undefined> {
    const result = await db.select().from(automationConfigs).where(eq(automationConfigs.userId, userId)).limit(1);
    return result[0];
  }

  async upsertAutomationConfig(config: InsertAutomationConfig): Promise<AutomationConfig> {
    const existing = await this.getAutomationConfig(config.userId);
    
    if (existing) {
      const result = await db.update(automationConfigs)
        .set({
          isActive: config.isActive,
          rsi: config.rsi,
          volatility: config.volatility,
          updatedAt: new Date(),
        })
        .where(eq(automationConfigs.userId, config.userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(automationConfigs).values(config).returning();
      return result[0];
    }
  }

  // Destination Wallets
  async getDestinationWallets(userId: string): Promise<DestinationWallets | undefined> {
    const result = await db.select().from(destinationWallets).where(eq(destinationWallets.userId, userId)).limit(1);
    return result[0];
  }

  async upsertDestinationWallets(wallets: InsertDestinationWallets): Promise<DestinationWallets> {
    const existing = await this.getDestinationWallets(wallets.userId);
    
    if (existing) {
      const result = await db.update(destinationWallets)
        .set({
          marketMakingWallet: wallets.marketMakingWallet,
          buybackWallet: wallets.buybackWallet,
          liquidityWallet: wallets.liquidityWallet,
          revenueWallet: wallets.revenueWallet,
          updatedAt: new Date(),
        })
        .where(eq(destinationWallets.userId, wallets.userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(destinationWallets).values(wallets).returning();
      return result[0];
    }
  }

  // Allocation Presets
  async getPresets(userId: string): Promise<AllocationPreset[]> {
    return await db.select()
      .from(allocationPresets)
      .where(eq(allocationPresets.userId, userId))
      .orderBy(desc(allocationPresets.createdAt));
  }

  async createPreset(preset: InsertAllocationPreset): Promise<AllocationPreset> {
    const result = await db.insert(allocationPresets).values(preset).returning();
    return result[0];
  }

  async deletePreset(id: string): Promise<void> {
    await db.delete(allocationPresets).where(eq(allocationPresets.id, id));
  }

  // Telegram Settings
  async getTelegramSettings(userId: string): Promise<TelegramSettings | undefined> {
    const result = await db.select().from(telegramSettings).where(eq(telegramSettings.userId, userId)).limit(1);
    return result[0];
  }

  async upsertTelegramSettings(settings: InsertTelegramSettings): Promise<TelegramSettings> {
    const existing = await this.getTelegramSettings(settings.userId);
    
    if (existing) {
      const result = await db.update(telegramSettings)
        .set({
          chatId: settings.chatId,
          isEnabled: settings.isEnabled,
          notifyOnDistribution: settings.notifyOnDistribution,
          notifyOnFeeReady: settings.notifyOnFeeReady,
          notifyOnLargeBuy: settings.notifyOnLargeBuy,
          updatedAt: new Date(),
        })
        .where(eq(telegramSettings.userId, settings.userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(telegramSettings).values(settings).returning();
      return result[0];
    }
  }

  async getTelegramSettingsByChatId(chatId: string): Promise<TelegramSettings | undefined> {
    const result = await db.select().from(telegramSettings).where(eq(telegramSettings.chatId, chatId)).limit(1);
    return result[0];
  }

  // Token Settings
  async getTokenSettings(userId: string): Promise<TokenSettings | undefined> {
    const result = await db.select().from(tokenSettings).where(eq(tokenSettings.userId, userId)).limit(1);
    return result[0];
  }

  async upsertTokenSettings(settings: InsertTokenSettings): Promise<TokenSettings> {
    const existing = await this.getTokenSettings(settings.userId);
    
    if (existing) {
      const result = await db.update(tokenSettings)
        .set({
          tokenName: settings.tokenName,
          tokenSymbol: settings.tokenSymbol,
          contractAddress: settings.contractAddress,
          feeCollectionWallet: settings.feeCollectionWallet,
          feePercentage: settings.feePercentage,
          updatedAt: new Date(),
        })
        .where(eq(tokenSettings.userId, settings.userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(tokenSettings).values(settings).returning();
      return result[0];
    }
  }
}

export const storage = new DatabaseStorage();
