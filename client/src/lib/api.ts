import type { User, Allocation, Transaction, AutomationConfig, DestinationWallets, AllocationPreset, TelegramSettings, TokenSettings } from "@shared/schema";

function isDemoMode() {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  return import.meta.env.VITE_DEMO_MODE === 'true' || urlParams.get('demo') === 'true';
}

const DEMO_ALLOCATION: Allocation = {
  id: 'demo-alloc-1',
  userId: 'demo-user-id',
  marketMaking: 30,
  buyback: 25,
  liquidity: 25,
  revenue: 20,
  updatedAt: new Date()
};

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-tx-1',
    userId: 'demo-user-id',
    type: 'distribution',
    amount: '1.5',
    signature: 'demo1234567890abcdef',
    detail: 'Fee distribution: 0.45 SOL Market Making, 0.375 SOL Buyback, 0.375 SOL Liquidity, 0.3 SOL Revenue',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'demo-tx-2',
    userId: 'demo-user-id',
    type: 'optimize',
    amount: '0',
    signature: null,
    detail: 'AI optimization applied: High volatility detected, increased buyback allocation',
    createdAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'demo-tx-3',
    userId: 'demo-user-id',
    type: 'distribution',
    amount: '2.0',
    signature: 'demo0987654321fedcba',
    detail: 'Fee distribution: 0.6 SOL Market Making, 0.5 SOL Buyback, 0.5 SOL Liquidity, 0.4 SOL Revenue',
    createdAt: new Date(Date.now() - 86400000)
  }
];

const DEMO_AUTOMATION: AutomationConfig = {
  id: 'demo-auto-1',
  userId: 'demo-user-id',
  isActive: true,
  rsi: '50',
  volatility: 'medium',
  updatedAt: new Date()
};

const DEMO_WALLETS: DestinationWallets = {
  id: 'demo-wallets-1',
  userId: 'demo-user-id',
  marketMakingWallet: 'MarketMak1ngWa11etAddress123456789ABC',
  buybackWallet: 'BuybackWa11etAddress123456789ABCDEF',
  liquidityWallet: 'L1qu1d1tyWa11etAddress123456789ABCDE',
  revenueWallet: 'RevenueWa11etAddress123456789ABCDEFG',
  updatedAt: new Date()
};

const DEMO_PRESETS: AllocationPreset[] = [
  { id: 'demo-preset-1', userId: 'demo-user-id', name: 'Aggressive Buyback', marketMaking: 20, buyback: 40, liquidity: 20, revenue: 20, createdAt: new Date() },
  { id: 'demo-preset-2', userId: 'demo-user-id', name: 'Balanced Growth', marketMaking: 25, buyback: 25, liquidity: 25, revenue: 25, createdAt: new Date() }
];

const DEMO_TELEGRAM: TelegramSettings = {
  id: 'demo-tg-1',
  userId: 'demo-user-id',
  chatId: '123456789',
  isEnabled: true,
  notifyOnDistribution: true,
  notifyOnFeeReady: true,
  notifyOnLargeBuy: true,
  updatedAt: new Date()
};

const DEMO_TOKEN: TokenSettings = {
  id: 'demo-token-1',
  userId: 'demo-user-id',
  tokenName: 'PumpToken',
  tokenSymbol: 'PUMP',
  contractAddress: 'TokenContractAddress123456789ABCDEFGH',
  feeCollectionWallet: 'FeeCol1ect1onWa11et123456789ABCDEFG',
  feePercentage: 1,
  updatedAt: new Date()
};

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
  if (isDemoMode()) return DEMO_WALLETS;
  
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
  if (isDemoMode()) return DEMO_ALLOCATION;
  
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
  if (isDemoMode()) return DEMO_TRANSACTIONS;
  
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
  if (isDemoMode()) return DEMO_AUTOMATION;
  
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
  if (isDemoMode()) return DEMO_PRESETS;
  
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
  if (isDemoMode()) return DEMO_TELEGRAM;
  
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
  if (isDemoMode()) return DEMO_TOKEN;
  
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
