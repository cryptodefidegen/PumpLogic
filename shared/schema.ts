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
