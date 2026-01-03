import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const allocations = pgTable("allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  marketMaking: integer("market_making").notNull().default(25),
  buyback: integer("buyback").notNull().default(25),
  liquidity: integer("liquidity").notNull().default(25),
  revenue: integer("revenue").notNull().default(25),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAllocationSchema = createInsertSchema(allocations).omit({
  id: true,
  updatedAt: true,
});
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type Allocation = typeof allocations.$inferSelect;

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  detail: text("detail").notNull(),
  amount: text("amount").notNull(),
  signature: text("signature"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export const automationConfigs = pgTable("automation_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  isActive: boolean("is_active").notNull().default(false),
  rsi: text("rsi"),
  volatility: text("volatility"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAutomationConfigSchema = createInsertSchema(automationConfigs).omit({
  id: true,
  updatedAt: true,
});
export type InsertAutomationConfig = z.infer<typeof insertAutomationConfigSchema>;
export type AutomationConfig = typeof automationConfigs.$inferSelect;

export const destinationWallets = pgTable("destination_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  marketMakingWallet: text("market_making_wallet"),
  buybackWallet: text("buyback_wallet"),
  liquidityWallet: text("liquidity_wallet"),
  revenueWallet: text("revenue_wallet"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDestinationWalletsSchema = createInsertSchema(destinationWallets).omit({
  id: true,
  updatedAt: true,
});
export type InsertDestinationWallets = z.infer<typeof insertDestinationWalletsSchema>;
export type DestinationWallets = typeof destinationWallets.$inferSelect;

export const allocationPresets = pgTable("allocation_presets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  marketMaking: integer("market_making").notNull(),
  buyback: integer("buyback").notNull(),
  liquidity: integer("liquidity").notNull(),
  revenue: integer("revenue").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAllocationPresetSchema = createInsertSchema(allocationPresets).omit({
  id: true,
  createdAt: true,
});
export type InsertAllocationPreset = z.infer<typeof insertAllocationPresetSchema>;
export type AllocationPreset = typeof allocationPresets.$inferSelect;

export const telegramSettings = pgTable("telegram_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  chatId: text("chat_id"),
  isEnabled: boolean("is_enabled").notNull().default(false),
  notifyOnDistribution: boolean("notify_on_distribution").notNull().default(true),
  notifyOnFeeReady: boolean("notify_on_fee_ready").notNull().default(true),
  notifyOnLargeBuy: boolean("notify_on_large_buy").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTelegramSettingsSchema = createInsertSchema(telegramSettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertTelegramSettings = z.infer<typeof insertTelegramSettingsSchema>;
export type TelegramSettings = typeof telegramSettings.$inferSelect;

export const tokenSettings = pgTable("token_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  tokenName: text("token_name"),
  tokenSymbol: text("token_symbol"),
  contractAddress: text("contract_address"),
  feeCollectionWallet: text("fee_collection_wallet"),
  feePercentage: integer("fee_percentage").default(1),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTokenSettingsSchema = createInsertSchema(tokenSettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertTokenSettings = z.infer<typeof insertTokenSettingsSchema>;
export type TokenSettings = typeof tokenSettings.$inferSelect;

// Multi-wallet support - linked wallets per user
export const linkedWallets = pgTable("linked_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  walletAddress: text("wallet_address").notNull(),
  label: text("label"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLinkedWalletSchema = createInsertSchema(linkedWallets).omit({
  id: true,
  createdAt: true,
});
export type InsertLinkedWallet = z.infer<typeof insertLinkedWalletSchema>;
export type LinkedWallet = typeof linkedWallets.$inferSelect;

// Price alerts
export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tokenAddress: text("token_address").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  targetPrice: text("target_price").notNull(),
  direction: text("direction").notNull(), // 'above' or 'below'
  isActive: boolean("is_active").notNull().default(true),
  isTriggered: boolean("is_triggered").notNull().default(false),
  triggeredAt: timestamp("triggered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({
  id: true,
  createdAt: true,
  isTriggered: true,
  triggeredAt: true,
});
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

// Multi-token settings (separate from single token settings)
export const multiTokenSettings = pgTable("multi_token_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tokenName: text("token_name").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  contractAddress: text("contract_address").notNull(),
  feeCollectionWallet: text("fee_collection_wallet"),
  feePercentage: integer("fee_percentage").default(1),
  isActive: boolean("is_active").notNull().default(false),
  marketMaking: integer("market_making").notNull().default(25),
  buyback: integer("buyback").notNull().default(25),
  liquidity: integer("liquidity").notNull().default(25),
  revenue: integer("revenue").notNull().default(25),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMultiTokenSettingsSchema = createInsertSchema(multiTokenSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMultiTokenSettings = z.infer<typeof insertMultiTokenSettingsSchema>;
export type MultiTokenSettings = typeof multiTokenSettings.$inferSelect;

// Deployment records - tracks tokens deployed via PumpLogic Deployer
export const deploymentRecords = pgTable("deployment_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  mintAddress: text("mint_address").notNull(),
  signature: text("signature").notNull(),
  tokenName: text("token_name").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenDescription: text("token_description"),
  imageUri: text("image_uri"),
  initialBuy: text("initial_buy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeploymentRecordSchema = createInsertSchema(deploymentRecords).omit({
  id: true,
  createdAt: true,
});
export type InsertDeploymentRecord = z.infer<typeof insertDeploymentRecordSchema>;
export type DeploymentRecord = typeof deploymentRecords.$inferSelect;

// Feature toggles for admin control
export const featureToggles = pgTable("feature_toggles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  featureKey: text("feature_key").notNull().unique(),
  featureName: text("feature_name").notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFeatureToggleSchema = createInsertSchema(featureToggles).omit({
  id: true,
  updatedAt: true,
});
export type InsertFeatureToggle = z.infer<typeof insertFeatureToggleSchema>;
export type FeatureToggle = typeof featureToggles.$inferSelect;

// Site settings for admin configuration
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value"),
  description: text("description"),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

// Admin action logs for audit trail
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminAddress: text("admin_address").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;

// Feature whitelist - grants specific wallets access to features during maintenance
export const featureWhitelist = pgTable("feature_whitelist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  featureKey: text("feature_key").notNull(),
  addedBy: text("added_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeatureWhitelistSchema = createInsertSchema(featureWhitelist).omit({
  id: true,
  createdAt: true,
});
export type InsertFeatureWhitelist = z.infer<typeof insertFeatureWhitelistSchema>;
export type FeatureWhitelist = typeof featureWhitelist.$inferSelect;

// Wallet blacklist for banning/suspending users
export const walletBlacklist = pgTable("wallet_blacklist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  reason: text("reason"),
  status: text("status").notNull().default("banned"), // 'banned' | 'suspended'
  suspendedUntil: timestamp("suspended_until"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWalletBlacklistSchema = createInsertSchema(walletBlacklist).omit({
  id: true,
  createdAt: true,
});
export type InsertWalletBlacklist = z.infer<typeof insertWalletBlacklistSchema>;
export type WalletBlacklist = typeof walletBlacklist.$inferSelect;

// User badges (VIP, verified, etc.)
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  badgeType: text("badge_type").notNull(), // 'vip' | 'verified' | 'early_adopter' | 'whale'
  grantedBy: text("granted_by").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  createdAt: true,
});
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// Platform announcements
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // 'info' | 'warning' | 'success' | 'error'
  isActive: boolean("is_active").notNull().default(true),
  isPinned: boolean("is_pinned").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// Featured tokens
export const featuredTokens = pgTable("featured_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mintAddress: text("mint_address").notNull().unique(),
  tokenName: text("token_name").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  imageUri: text("image_uri"),
  isVerified: boolean("is_verified").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  addedBy: text("added_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeaturedTokenSchema = createInsertSchema(featuredTokens).omit({
  id: true,
  createdAt: true,
});
export type InsertFeaturedToken = z.infer<typeof insertFeaturedTokenSchema>;
export type FeaturedToken = typeof featuredTokens.$inferSelect;

// Daily platform stats for analytics charts
export const dailyStats = pgTable("daily_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  newUsers: integer("new_users").notNull().default(0),
  totalTransactions: integer("total_transactions").notNull().default(0),
  totalDeployments: integer("total_deployments").notNull().default(0),
  totalBurns: integer("total_burns").notNull().default(0),
  totalVolume: text("total_volume").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({
  id: true,
  createdAt: true,
});
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type DailyStats = typeof dailyStats.$inferSelect;

// Rate limiting configuration per wallet
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  maxRequestsPerMinute: integer("max_requests_per_minute").notNull().default(60),
  maxDeploysPerDay: integer("max_deploys_per_day").notNull().default(10),
  maxBurnsPerDay: integer("max_burns_per_day").notNull().default(50),
  updatedBy: text("updated_by").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({
  id: true,
  updatedAt: true,
});
export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;
