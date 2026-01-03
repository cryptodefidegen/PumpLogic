import { db } from "../db/index";
import { users, allocations, transactions, automationConfigs, destinationWallets, allocationPresets, telegramSettings, tokenSettings, linkedWallets, priceAlerts, multiTokenSettings, deploymentRecords, featureToggles, siteSettings, adminLogs } from "@shared/schema";
import type { User, InsertUser, Allocation, InsertAllocation, Transaction, InsertTransaction, AutomationConfig, InsertAutomationConfig, DestinationWallets, InsertDestinationWallets, AllocationPreset, InsertAllocationPreset, TelegramSettings, InsertTelegramSettings, TokenSettings, InsertTokenSettings, LinkedWallet, InsertLinkedWallet, PriceAlert, InsertPriceAlert, MultiTokenSettings, InsertMultiTokenSettings, DeploymentRecord, InsertDeploymentRecord, FeatureToggle, InsertFeatureToggle, SiteSetting, InsertSiteSetting, AdminLog, InsertAdminLog } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

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

  // Linked Wallets (Multi-wallet support)
  getLinkedWallets(userId: string): Promise<LinkedWallet[]>;
  addLinkedWallet(wallet: InsertLinkedWallet): Promise<LinkedWallet>;
  removeLinkedWallet(id: string): Promise<void>;
  setActiveWallet(userId: string, walletId: string): Promise<void>;
  getActiveWallet(userId: string): Promise<LinkedWallet | undefined>;

  // Price Alerts
  getPriceAlerts(userId: string): Promise<PriceAlert[]>;
  getActivePriceAlerts(): Promise<PriceAlert[]>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert>;
  deletePriceAlert(id: string): Promise<void>;
  triggerPriceAlert(id: string): Promise<PriceAlert>;

  // Multi-Token Settings
  getMultiTokenSettings(userId: string): Promise<MultiTokenSettings[]>;
  getActiveToken(userId: string): Promise<MultiTokenSettings | undefined>;
  createMultiTokenSettings(settings: InsertMultiTokenSettings): Promise<MultiTokenSettings>;
  updateMultiTokenSettings(id: string, settings: Partial<MultiTokenSettings>): Promise<MultiTokenSettings>;
  deleteMultiTokenSettings(id: string): Promise<void>;
  setActiveToken(userId: string, tokenId: string): Promise<void>;

  // Deployment Records
  getDeploymentsByWallet(walletAddress: string): Promise<DeploymentRecord[]>;
  getAllDeployments(): Promise<DeploymentRecord[]>;
  createDeploymentRecord(record: InsertDeploymentRecord): Promise<DeploymentRecord>;

  // Feature Toggles
  getFeatureToggles(): Promise<FeatureToggle[]>;
  getFeatureToggle(featureKey: string): Promise<FeatureToggle | undefined>;
  upsertFeatureToggle(toggle: InsertFeatureToggle): Promise<FeatureToggle>;
  updateFeatureToggle(featureKey: string, isEnabled: boolean, updatedBy: string): Promise<FeatureToggle>;

  // Site Settings
  getSiteSettings(): Promise<SiteSetting[]>;
  getSiteSetting(settingKey: string): Promise<SiteSetting | undefined>;
  upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;

  // Admin Logs
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;

  // Admin Stats
  getTotalUserCount(): Promise<number>;
  getTotalTransactionCount(): Promise<number>;
  getAllTransactions(limit?: number): Promise<Transaction[]>;
  getAllAllocations(): Promise<Allocation[]>;
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
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

  // Linked Wallets
  async getLinkedWallets(userId: string): Promise<LinkedWallet[]> {
    return await db.select()
      .from(linkedWallets)
      .where(eq(linkedWallets.userId, userId))
      .orderBy(desc(linkedWallets.createdAt));
  }

  async addLinkedWallet(wallet: InsertLinkedWallet): Promise<LinkedWallet> {
    const result = await db.insert(linkedWallets).values(wallet).returning();
    return result[0];
  }

  async removeLinkedWallet(id: string): Promise<void> {
    await db.delete(linkedWallets).where(eq(linkedWallets.id, id));
  }

  async setActiveWallet(userId: string, walletId: string): Promise<void> {
    await db.update(linkedWallets)
      .set({ isActive: false })
      .where(eq(linkedWallets.userId, userId));
    await db.update(linkedWallets)
      .set({ isActive: true })
      .where(eq(linkedWallets.id, walletId));
  }

  async getActiveWallet(userId: string): Promise<LinkedWallet | undefined> {
    const result = await db.select()
      .from(linkedWallets)
      .where(and(eq(linkedWallets.userId, userId), eq(linkedWallets.isActive, true)))
      .limit(1);
    return result[0];
  }

  // Price Alerts
  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return await db.select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, userId))
      .orderBy(desc(priceAlerts.createdAt));
  }

  async getActivePriceAlerts(): Promise<PriceAlert[]> {
    return await db.select()
      .from(priceAlerts)
      .where(and(eq(priceAlerts.isActive, true), eq(priceAlerts.isTriggered, false)));
  }

  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const result = await db.insert(priceAlerts).values(alert).returning();
    return result[0];
  }

  async updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
    const result = await db.update(priceAlerts)
      .set(updates)
      .where(eq(priceAlerts.id, id))
      .returning();
    return result[0];
  }

  async deletePriceAlert(id: string): Promise<void> {
    await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
  }

  async triggerPriceAlert(id: string): Promise<PriceAlert> {
    const result = await db.update(priceAlerts)
      .set({ isTriggered: true, triggeredAt: new Date() })
      .where(eq(priceAlerts.id, id))
      .returning();
    return result[0];
  }

  // Multi-Token Settings
  async getMultiTokenSettings(userId: string): Promise<MultiTokenSettings[]> {
    return await db.select()
      .from(multiTokenSettings)
      .where(eq(multiTokenSettings.userId, userId))
      .orderBy(desc(multiTokenSettings.createdAt));
  }

  async getActiveToken(userId: string): Promise<MultiTokenSettings | undefined> {
    const result = await db.select()
      .from(multiTokenSettings)
      .where(and(eq(multiTokenSettings.userId, userId), eq(multiTokenSettings.isActive, true)))
      .limit(1);
    return result[0];
  }

  async createMultiTokenSettings(settings: InsertMultiTokenSettings): Promise<MultiTokenSettings> {
    const result = await db.insert(multiTokenSettings).values(settings).returning();
    return result[0];
  }

  async updateMultiTokenSettings(id: string, settings: Partial<MultiTokenSettings>): Promise<MultiTokenSettings> {
    const result = await db.update(multiTokenSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(multiTokenSettings.id, id))
      .returning();
    return result[0];
  }

  async deleteMultiTokenSettings(id: string): Promise<void> {
    await db.delete(multiTokenSettings).where(eq(multiTokenSettings.id, id));
  }

  async setActiveToken(userId: string, tokenId: string): Promise<void> {
    await db.update(multiTokenSettings)
      .set({ isActive: false })
      .where(eq(multiTokenSettings.userId, userId));
    await db.update(multiTokenSettings)
      .set({ isActive: true })
      .where(eq(multiTokenSettings.id, tokenId));
  }

  // Deployment Records
  async getDeploymentsByWallet(walletAddress: string): Promise<DeploymentRecord[]> {
    return await db.select()
      .from(deploymentRecords)
      .where(eq(deploymentRecords.walletAddress, walletAddress))
      .orderBy(desc(deploymentRecords.createdAt));
  }

  async getAllDeployments(): Promise<DeploymentRecord[]> {
    return await db.select()
      .from(deploymentRecords)
      .orderBy(desc(deploymentRecords.createdAt));
  }

  async createDeploymentRecord(record: InsertDeploymentRecord): Promise<DeploymentRecord> {
    const result = await db.insert(deploymentRecords).values(record).returning();
    return result[0];
  }

  // Feature Toggles
  async getFeatureToggles(): Promise<FeatureToggle[]> {
    return await db.select().from(featureToggles).orderBy(featureToggles.featureName);
  }

  async getFeatureToggle(featureKey: string): Promise<FeatureToggle | undefined> {
    const result = await db.select().from(featureToggles).where(eq(featureToggles.featureKey, featureKey)).limit(1);
    return result[0];
  }

  async upsertFeatureToggle(toggle: InsertFeatureToggle): Promise<FeatureToggle> {
    const existing = await this.getFeatureToggle(toggle.featureKey);
    
    if (existing) {
      const result = await db.update(featureToggles)
        .set({
          featureName: toggle.featureName,
          description: toggle.description,
          isEnabled: toggle.isEnabled,
          updatedBy: toggle.updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(featureToggles.featureKey, toggle.featureKey))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(featureToggles).values(toggle).returning();
      return result[0];
    }
  }

  async updateFeatureToggle(featureKey: string, isEnabled: boolean, updatedBy: string): Promise<FeatureToggle> {
    const result = await db.update(featureToggles)
      .set({
        isEnabled,
        updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(featureToggles.featureKey, featureKey))
      .returning();
    return result[0];
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).orderBy(siteSettings.settingKey);
  }

  async getSiteSetting(settingKey: string): Promise<SiteSetting | undefined> {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, settingKey)).limit(1);
    return result[0];
  }

  async upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(setting.settingKey);
    
    if (existing) {
      const result = await db.update(siteSettings)
        .set({
          settingValue: setting.settingValue,
          description: setting.description,
          updatedBy: setting.updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.settingKey, setting.settingKey))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(siteSettings).values(setting).returning();
      return result[0];
    }
  }

  // Admin Logs
  async getAdminLogs(limit: number = 100): Promise<AdminLog[]> {
    return await db.select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit);
  }

  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const result = await db.insert(adminLogs).values(log).returning();
    return result[0];
  }

  // Admin Stats
  async getTotalUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return Number(result[0].count);
  }

  async getTotalTransactionCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(transactions);
    return Number(result[0].count);
  }

  async getAllTransactions(limit: number = 100): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getAllAllocations(): Promise<Allocation[]> {
    return await db.select().from(allocations);
  }
}

export const storage = new DatabaseStorage();
