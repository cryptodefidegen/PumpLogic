import type { User, Allocation, Transaction, AutomationConfig } from "@shared/schema";

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
