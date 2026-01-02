import type { ApiProvider } from "@/contexts/ApiProviderContext";

const VOIDSCREENER_API = 'https://rehreqnnkhczmpaytulk.supabase.co/functions/v1';
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  chain: string;
}

export interface TokenWithRiskFactors {
  token: TokenData;
  pairCreatedAt: string;
  pairAddress: string;
  dexId: string;
}

export interface WhaleAlert {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  tokenImage?: string;
  amount: number;
  amountUsd: number;
  walletAddress: string;
  timestamp: string;
  txHash: string;
  priceUsd?: number;
  liquidity?: number;
  liquidityImpact?: number;
  dexId?: string;
}

class TokenAPI {
  async getTokenAnalytics(address: string, provider: ApiProvider): Promise<TokenData | null> {
    if (provider === 'dexscreener') {
      return this.getDexScreenerTokenAnalytics(address);
    }
    return this.getVoidScreenerTokenAnalytics(address);
  }

  async getTokenWithRiskFactors(address: string, provider: ApiProvider): Promise<TokenWithRiskFactors | null> {
    if (provider === 'dexscreener') {
      return this.getDexScreenerTokenWithRisk(address);
    }
    return this.getVoidScreenerTokenWithRisk(address);
  }

  async getWhaleAlerts(options: { chain?: string; minAmount?: number } = {}, provider: ApiProvider = 'voidscreener'): Promise<{ alerts: WhaleAlert[]; unavailable?: boolean }> {
    if (provider === 'dexscreener') {
      return { alerts: [], unavailable: true };
    }
    
    try {
      const params = new URLSearchParams();
      if (options.chain) params.set('chain', options.chain);
      if (options.minAmount) params.set('minAmount', options.minAmount.toString());

      const res = await fetch(`${VOIDSCREENER_API}/api-whale-alerts?${params}`);
      const data = await res.json();
      return { alerts: data?.alerts || [] };
    } catch (error) {
      console.error('Whale alerts API error:', error);
      return { alerts: [] };
    }
  }

  private async getVoidScreenerTokenAnalytics(address: string): Promise<TokenData | null> {
    try {
      const res = await fetch(`${VOIDSCREENER_API}/api-pairs?address=${address}&chain=solana`);
      const pairsData = await res.json();

      if (!pairsData || !pairsData.pairs || pairsData.pairs.length === 0) {
        const tokenRes = await fetch(`${VOIDSCREENER_API}/api-token?chain=solana&address=${address}`);
        const tokenData = await tokenRes.json();
        if (tokenData && tokenData.token) {
          return {
            address,
            name: tokenData.token.name || 'Unknown Token',
            symbol: tokenData.token.symbol || '???',
            price: parseFloat(tokenData.token.priceUsd) || 0,
            priceChange24h: tokenData.token.priceChange?.h24 || 0,
            volume24h: tokenData.token.volume?.h24 || 0,
            marketCap: tokenData.token.marketCap || tokenData.token.fdv || 0,
            liquidity: tokenData.token.liquidity?.usd || 0,
            chain: 'solana',
          };
        }
        return null;
      }

      const bestPair = this.getBestPair(pairsData.pairs);
      return this.formatTokenData(address, bestPair);
    } catch (error) {
      console.error('VoidScreener API error:', error);
      return null;
    }
  }

  private async getDexScreenerTokenAnalytics(address: string): Promise<TokenData | null> {
    try {
      const res = await fetch(`${DEXSCREENER_API}/tokens/${address}`);
      const data = await res.json();

      if (!data.pairs || data.pairs.length === 0) {
        return null;
      }

      const bestPair = this.getBestPair(data.pairs);
      return this.formatTokenData(address, bestPair);
    } catch (error) {
      console.error('DexScreener API error:', error);
      return null;
    }
  }

  private async getVoidScreenerTokenWithRisk(address: string): Promise<TokenWithRiskFactors | null> {
    try {
      const res = await fetch(`${VOIDSCREENER_API}/api-pairs?address=${address}&chain=solana`);
      const pairsData = await res.json();

      if (!pairsData || !pairsData.pairs || pairsData.pairs.length === 0) {
        return null;
      }

      const bestPair = this.getBestPair(pairsData.pairs);
      return this.formatTokenWithRisk(address, bestPair);
    } catch (error) {
      console.error('VoidScreener API error:', error);
      return null;
    }
  }

  private async getDexScreenerTokenWithRisk(address: string): Promise<TokenWithRiskFactors | null> {
    try {
      const res = await fetch(`${DEXSCREENER_API}/tokens/${address}`);
      const data = await res.json();

      if (!data.pairs || data.pairs.length === 0) {
        return null;
      }

      const bestPair = this.getBestPair(data.pairs);
      return this.formatTokenWithRisk(address, bestPair);
    } catch (error) {
      console.error('DexScreener API error:', error);
      return null;
    }
  }

  private getBestPair(pairs: any[]): any {
    return pairs.reduce((best: any, pair: any) => {
      const pairLiq = parseFloat(pair.liquidity?.usd || 0);
      const bestLiq = parseFloat(best?.liquidity?.usd || 0);
      return pairLiq > bestLiq ? pair : best;
    }, pairs[0]);
  }

  private formatTokenData(address: string, pair: any): TokenData {
    return {
      address,
      name: pair.baseToken?.name || 'Unknown Token',
      symbol: pair.baseToken?.symbol || '???',
      price: parseFloat(pair.priceUsd) || 0,
      priceChange24h: parseFloat(pair.priceChange?.h24) || 0,
      volume24h: parseFloat(pair.volume?.h24) || 0,
      marketCap: parseFloat(pair.marketCap) || parseFloat(pair.fdv) || 0,
      liquidity: parseFloat(pair.liquidity?.usd) || 0,
      chain: 'solana',
    };
  }

  private formatTokenWithRisk(address: string, pair: any): TokenWithRiskFactors {
    const pairCreatedAt = pair.pairCreatedAt 
      ? new Date(pair.pairCreatedAt).toISOString() 
      : new Date().toISOString();

    return {
      token: this.formatTokenData(address, pair),
      pairCreatedAt,
      pairAddress: pair.pairAddress || '',
      dexId: pair.dexId || 'unknown',
    };
  }
}

export const tokenApi = new TokenAPI();
export default tokenApi;
