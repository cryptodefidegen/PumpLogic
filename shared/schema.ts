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
