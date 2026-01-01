import { Connection, PublicKey } from "@solana/web3.js";

const PUMPLOGIC_TOKEN_MINT = "63k7noZHAPfxnwzq4wGHJG4kksT7enoT2ua3shQ2pump";
const MIN_USD_VALUE = 50;

const WHITELISTED_ADDRESSES = [
  "9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8",
];

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

interface TokenGateResult {
  allowed: boolean;
  reason: string;
  tokenBalance: number;
  tokenPriceUsd: number;
  valueUsd: number;
  minRequired: number;
  isWhitelisted: boolean;
}

export async function checkTokenGate(walletAddress: string): Promise<TokenGateResult> {
  if (WHITELISTED_ADDRESSES.includes(walletAddress)) {
    return {
      allowed: true,
      reason: "Whitelisted address",
      tokenBalance: 0,
      tokenPriceUsd: 0,
      valueUsd: 0,
      minRequired: MIN_USD_VALUE,
      isWhitelisted: true,
    };
  }

  try {
    const tokenBalance = await getTokenBalance(walletAddress, PUMPLOGIC_TOKEN_MINT);
    const tokenPriceUsd = await getTokenPrice(PUMPLOGIC_TOKEN_MINT);
    const valueUsd = tokenBalance * tokenPriceUsd;

    const allowed = valueUsd >= MIN_USD_VALUE;

    return {
      allowed,
      reason: allowed
        ? "Sufficient token holdings"
        : `Need at least $${MIN_USD_VALUE} worth of $PLOGIC tokens`,
      tokenBalance,
      tokenPriceUsd,
      valueUsd,
      minRequired: MIN_USD_VALUE,
      isWhitelisted: false,
    };
  } catch (error) {
    console.error("Token gate check failed:", error);
    return {
      allowed: false,
      reason: "Failed to verify token holdings. Please try again.",
      tokenBalance: 0,
      tokenPriceUsd: 0,
      valueUsd: 0,
      minRequired: MIN_USD_VALUE,
      isWhitelisted: false,
    };
  }
}

async function getTokenBalance(walletAddress: string, tokenMint: string): Promise<number> {
  const connection = new Connection(RPC_URL);
  
  try {
    const walletPubkey = new PublicKey(walletAddress);
    const mintPubkey = new PublicKey(tokenMint);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
      mint: mintPubkey,
    });

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    let totalBalance = 0;
    for (const account of tokenAccounts.value) {
      const parsedInfo = account.account.data.parsed?.info;
      if (parsedInfo?.tokenAmount?.uiAmount) {
        totalBalance += parsedInfo.tokenAmount.uiAmount;
      }
    }

    return totalBalance;
  } catch (error) {
    console.error("Failed to get token balance:", error);
    return 0;
  }
}

async function getTokenPrice(tokenMint: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.jup.ag/price/v2?ids=${tokenMint}`
    );

    if (!response.ok) {
      console.error("Jupiter price API error:", response.status);
      return 0;
    }

    const data = await response.json();
    const price = data.data?.[tokenMint]?.price;
    
    return typeof price === "number" ? price : parseFloat(price) || 0;
  } catch (error) {
    console.error("Failed to get token price:", error);
    return 0;
  }
}

export function isWhitelisted(walletAddress: string): boolean {
  return WHITELISTED_ADDRESSES.includes(walletAddress);
}

export function getTokenMint(): string {
  return PUMPLOGIC_TOKEN_MINT;
}

export function getMinUsdValue(): number {
  return MIN_USD_VALUE;
}
