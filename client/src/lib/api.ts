import type { User, Allocation, Transaction, AutomationConfig, DestinationWallets, AllocationPreset, TelegramSettings, TokenSettings, LinkedWallet, PriceAlert, MultiTokenSettings } from "@shared/schema";

export async function authenticateWallet(walletAddress: string): Promise<User> {
  const response = await fetch("/api/auth/wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to authenticate wallet");
  }
  
  const data = await response.json();
  return data.user;
}

export async function getWalletBalance(walletAddress: string): Promise<{ balance: number }> {
  const response = await fetch(`/api/solana/balance/${walletAddress}`);
  
  if (!response.ok) {
    throw new Error("Failed to get wallet balance");
  }
  
  return await response.json();
}

export async function getNetworkStats(): Promise<{
  slot: number;
  totalSupply: number;
  circulatingSupply: number;
  tps: number;
}> {
  const response = await fetch("/api/solana/network-stats");
  
  if (!response.ok) {
    throw new Error("Failed to get network stats");
  }
  
  return await response.json();
}

export async function getDestinationWallets(userId: string): Promise<DestinationWallets> {
const response = await fetch(`/api/destination-wallets/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to get destination wallets");
  }
  
  return await response.json();
}

export async function saveDestinationWallets(userId: string, wallets: {
  marketMakingWallet: string | null;
  buybackWallet: string | null;
  liquidityWallet: string | null;
  revenueWallet: string | null;
}): Promise<DestinationWallets> {
  const response = await fetch("/api/destination-wallets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...wallets }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save destination wallets");
  }
  
  return await response.json();
}

export async function createDistribution(userId: string, fromWallet: string, amount: number): Promise<{
  transaction: string;
  breakdown: {
    marketMaking: number;
    buyback: number;
    liquidity: number;
    revenue: number;
  };
}> {
  const response = await fetch("/api/solana/create-distribution", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, fromWallet, amount }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create distribution");
  }
  
  return await response.json();
}

export async function recordTransaction(userId: string, signature: string, amount: number, breakdown: {
  marketMaking: number;
  buyback: number;
  liquidity: number;
  revenue: number;
}): Promise<{ success: boolean; transaction: Transaction }> {
  const response = await fetch("/api/solana/record-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, signature, amount, breakdown }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to record transaction");
  }
  
  return await response.json();
}

export async function getAllocation(userId: string): Promise<Allocation> {
const response = await fetch(`/api/allocations/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch allocation");
  }
  
  return await response.json();
}

export async function saveAllocation(userId: string, allocations: {
  marketMaking: number;
  buyback: number;
  liquidity: number;
  revenue: number;
}): Promise<Allocation> {
  const response = await fetch("/api/allocations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...allocations }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save allocation");
  }
  
  return await response.json();
}

export async function getTransactions(userId: string, limit?: number): Promise<Transaction[]> {
const url = `/api/transactions/${userId}${limit ? `?limit=${limit}` : ""}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  
  return await response.json();
}

export async function createTransaction(transaction: {
  userId: string;
  type: string;
  detail: string;
  amount: string;
  signature?: string | null;
}): Promise<Transaction> {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create transaction");
  }
  
  return await response.json();
}

export async function getAutomationConfig(userId: string): Promise<AutomationConfig> {
const response = await fetch(`/api/automation/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch automation config");
  }
  
  return await response.json();
}

export async function updateAutomationConfig(userId: string, config: {
  isActive: boolean;
  rsi?: string | null;
  volatility?: string | null;
}): Promise<AutomationConfig> {
  const response = await fetch("/api/automation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...config }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update automation config");
  }
  
  return await response.json();
}

export async function runOptimizer(userId: string): Promise<Allocation> {
  const response = await fetch(`/api/optimize/${userId}`, {
    method: "POST",
  });
  
  if (!response.ok) {
    throw new Error("Failed to run optimizer");
  }
  
  return await response.json();
}

// Allocation Presets
export async function getPresets(userId: string): Promise<AllocationPreset[]> {
const response = await fetch(`/api/presets/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch presets");
  }
  
  return await response.json();
}

export async function createPreset(userId: string, name: string, allocations: {
  marketMaking: number;
  buyback: number;
  liquidity: number;
  revenue: number;
}): Promise<AllocationPreset> {
  const response = await fetch("/api/presets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name, ...allocations }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create preset");
  }
  
  return await response.json();
}

export async function deletePreset(id: string): Promise<void> {
  const response = await fetch(`/api/presets/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete preset");
  }
}

// Telegram Settings
export async function getTelegramSettings(userId: string): Promise<TelegramSettings> {
const response = await fetch(`/api/telegram-settings/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch telegram settings");
  }
  
  return await response.json();
}

export async function saveTelegramSettings(userId: string, settings: {
  chatId: string | null;
  isEnabled: boolean;
  notifyOnDistribution: boolean;
  notifyOnFeeReady: boolean;
  notifyOnLargeBuy: boolean;
}): Promise<TelegramSettings> {
  const response = await fetch("/api/telegram-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...settings }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save telegram settings");
  }
  
  return await response.json();
}

// Token Settings
export async function getTokenSettings(userId: string): Promise<TokenSettings> {
const response = await fetch(`/api/token-settings/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch token settings");
  }
  
  return await response.json();
}

export async function saveTokenSettings(userId: string, settings: {
  tokenName: string | null;
  tokenSymbol: string | null;
  contractAddress: string | null;
  feeCollectionWallet: string | null;
  feePercentage: number;
}): Promise<TokenSettings> {
  const response = await fetch("/api/token-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...settings }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save token settings");
  }
  
  return await response.json();
}

// ===== LINKED WALLETS (Multi-Wallet Support) =====

export async function getLinkedWallets(userId: string): Promise<LinkedWallet[]> {
  const response = await fetch(`/api/linked-wallets/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch linked wallets");
  }
  
  return await response.json();
}

export async function addLinkedWallet(userId: string, walletAddress: string, label?: string): Promise<LinkedWallet> {
  const response = await fetch("/api/linked-wallets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, walletAddress, label, isActive: false }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add linked wallet");
  }
  
  return await response.json();
}

export async function removeLinkedWallet(id: string): Promise<void> {
  const response = await fetch(`/api/linked-wallets/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to remove linked wallet");
  }
}

export async function setActiveWallet(userId: string, walletId: string): Promise<void> {
  const response = await fetch(`/api/linked-wallets/${userId}/set-active`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletId }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to set active wallet");
  }
}

export async function getActiveWallet(userId: string): Promise<LinkedWallet | null> {
  const response = await fetch(`/api/linked-wallets/${userId}/active`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch active wallet");
  }
  
  return await response.json();
}

// ===== PRICE ALERTS =====

export async function getPriceAlerts(userId: string): Promise<PriceAlert[]> {
  const response = await fetch(`/api/price-alerts/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch price alerts");
  }
  
  return await response.json();
}

export async function createPriceAlert(userId: string, alert: {
  tokenAddress: string;
  tokenSymbol: string;
  targetPrice: string;
  direction: string;
  isActive?: boolean;
}): Promise<PriceAlert> {
  const response = await fetch("/api/price-alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...alert }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create price alert");
  }
  
  return await response.json();
}

export async function updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
  const response = await fetch(`/api/price-alerts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update price alert");
  }
  
  return await response.json();
}

export async function deletePriceAlert(id: string): Promise<void> {
  const response = await fetch(`/api/price-alerts/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete price alert");
  }
}

// ===== MULTI-TOKEN SETTINGS =====

export async function getMultiTokenSettings(userId: string): Promise<MultiTokenSettings[]> {
  const response = await fetch(`/api/multi-token/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch token settings");
  }
  
  return await response.json();
}

export async function getActiveToken(userId: string): Promise<MultiTokenSettings | null> {
  const response = await fetch(`/api/multi-token/${userId}/active`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch active token");
  }
  
  return await response.json();
}

export async function createMultiToken(userId: string, settings: {
  tokenName: string;
  tokenSymbol: string;
  contractAddress: string;
  feeCollectionWallet?: string | null;
  feePercentage?: number;
  isActive?: boolean;
  marketMaking?: number;
  buyback?: number;
  liquidity?: number;
  revenue?: number;
}): Promise<MultiTokenSettings> {
  const response = await fetch("/api/multi-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...settings }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create token");
  }
  
  return await response.json();
}

export async function updateMultiToken(id: string, settings: Partial<MultiTokenSettings>): Promise<MultiTokenSettings> {
  const response = await fetch(`/api/multi-token/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update token");
  }
  
  return await response.json();
}

export async function deleteMultiToken(id: string): Promise<void> {
  const response = await fetch(`/api/multi-token/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete token");
  }
}

export async function setActiveToken(userId: string, tokenId: string): Promise<void> {
  const response = await fetch(`/api/multi-token/${userId}/set-active`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokenId }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to set active token");
  }
}

// ===== TOKEN GATING =====

export interface TokenGateResult {
  allowed: boolean;
  reason: string;
  tokenBalance: number;
  tokenPriceUsd: number;
  valueUsd: number;
  minRequired: number;
  isWhitelisted: boolean;
}

export async function checkTokenGate(walletAddress: string): Promise<TokenGateResult> {
  const response = await fetch(`/api/token-gate/${walletAddress}`);
  
  if (!response.ok) {
    throw new Error("Failed to check token gate");
  }
  
  return await response.json();
}

// ===== ANALYTICS =====

export interface AnalyticsData {
  token: {
    address: string;
    name: string;
    symbol: string;
    price: number;
    marketCap: number;
    volume24h: number;
    liquidity: number;
    priceChange24h: number;
    txns24h: { buys: number; sells: number };
  };
  allocation: {
    marketMaking: number;
    buyback: number;
    liquidity: number;
    revenue: number;
  };
  fees: {
    totalCollected: number;
    totalCollectedUsd: number;
    breakdown: {
      marketMaking: number;
      buyback: number;
      liquidity: number;
      revenue: number;
    };
  };
  stats: {
    transactionsLast30Days: number;
    transactionsLast7Days: number;
    totalTransactions: number;
  };
  dailyVolume: { date: string; volume: number }[];
  availableTokens: {
    id: string;
    name: string;
    symbol: string;
    address: string;
    isActive: boolean;
  }[];
}

export async function getAnalytics(userId: string, tokenAddress?: string): Promise<AnalyticsData> {
  const url = tokenAddress 
    ? `/api/analytics/${userId}?tokenAddress=${encodeURIComponent(tokenAddress)}`
    : `/api/analytics/${userId}`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }
  
  return await response.json();
}
