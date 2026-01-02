const VOIDSCREENER_API = 'https://rehreqnnkhczmpaytulk.supabase.co/functions/v1';

export interface VoidTokenData {
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

export interface VoidPairData {
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceChange: {
    h24: number;
  };
  volume: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
}

export interface VoidWhaleAlert {
  id: string;
  chain: string;
  type: 'buy' | 'sell' | 'transfer';
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  amount: number;
  amountUsd: number;
  walletAddress: string;
  timestamp: string;
  txHash: string;
}

export interface VoidApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

class VoidScreenerAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = VOIDSCREENER_API;
  }

  async getTokens(options: {
    chain?: string;
    limit?: number;
    sortBy?: string;
  } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (options.chain) params.set('chain', options.chain);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.sortBy) params.set('sortBy', options.sortBy);

    const res = await fetch(`${this.baseUrl}/api-tokens?${params}`);
    return res.json();
  }

  async getTrending(limit = 50): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api-trending?limit=${limit}`);
    return res.json();
  }

  async getToken(chain: string, address: string): Promise<any> {
    const res = await fetch(
      `${this.baseUrl}/api-token?chain=${chain}&address=${address}`
    );
    return res.json();
  }

  async getPairs(address: string, options: {
    chain?: string;
    limit?: number;
  } = {}): Promise<any> {
    const params = new URLSearchParams({ address });
    if (options.chain) params.set('chain', options.chain);
    if (options.limit) params.set('limit', options.limit.toString());

    const res = await fetch(`${this.baseUrl}/api-pairs?${params}`);
    return res.json();
  }

  async search(query: string, limit = 20): Promise<any> {
    const res = await fetch(
      `${this.baseUrl}/api-search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return res.json();
  }

  async getWhaleAlerts(options: {
    chain?: string;
    minAmount?: number;
    type?: 'buy' | 'sell' | 'transfer';
  } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (options.chain) params.set('chain', options.chain);
    if (options.minAmount) params.set('minAmount', options.minAmount.toString());
    if (options.type) params.set('type', options.type);

    const res = await fetch(`${this.baseUrl}/api-whale-alerts?${params}`);
    return res.json();
  }

  async getStats(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api-stats`);
    return res.json();
  }

  async getTokenAnalytics(address: string): Promise<VoidTokenData | null> {
    try {
      const pairsData = await this.getPairs(address, { chain: 'solana' });
      
      if (!pairsData || !pairsData.pairs || pairsData.pairs.length === 0) {
        const tokenData = await this.getToken('solana', address);
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

      const bestPair = pairsData.pairs.reduce((best: any, pair: any) => {
        const pairLiq = parseFloat(pair.liquidity?.usd || 0);
        const bestLiq = parseFloat(best?.liquidity?.usd || 0);
        return pairLiq > bestLiq ? pair : best;
      }, pairsData.pairs[0]);

      return {
        address,
        name: bestPair.baseToken?.name || 'Unknown Token',
        symbol: bestPair.baseToken?.symbol || '???',
        price: parseFloat(bestPair.priceUsd) || 0,
        priceChange24h: parseFloat(bestPair.priceChange?.h24) || 0,
        volume24h: parseFloat(bestPair.volume?.h24) || 0,
        marketCap: parseFloat(bestPair.marketCap) || parseFloat(bestPair.fdv) || 0,
        liquidity: parseFloat(bestPair.liquidity?.usd) || 0,
        chain: 'solana',
      };
    } catch (error) {
      console.error('VoidScreener API error:', error);
      return null;
    }
  }

  async getTokenWithRiskFactors(address: string): Promise<{
    token: VoidTokenData;
    pairCreatedAt: string;
    pairAddress: string;
    dexId: string;
  } | null> {
    try {
      const pairsData = await this.getPairs(address, { chain: 'solana' });
      
      if (!pairsData || !pairsData.pairs || pairsData.pairs.length === 0) {
        return null;
      }

      const bestPair = pairsData.pairs.reduce((best: any, pair: any) => {
        const pairLiq = parseFloat(pair.liquidity?.usd || 0);
        const bestLiq = parseFloat(best?.liquidity?.usd || 0);
        return pairLiq > bestLiq ? pair : best;
      }, pairsData.pairs[0]);

      const pairCreatedAt = bestPair.pairCreatedAt 
        ? new Date(bestPair.pairCreatedAt).toISOString() 
        : new Date().toISOString();

      return {
        token: {
          address,
          name: bestPair.baseToken?.name || 'Unknown Token',
          symbol: bestPair.baseToken?.symbol || '???',
          price: parseFloat(bestPair.priceUsd) || 0,
          priceChange24h: parseFloat(bestPair.priceChange?.h24) || 0,
          volume24h: parseFloat(bestPair.volume?.h24) || 0,
          marketCap: parseFloat(bestPair.marketCap) || parseFloat(bestPair.fdv) || 0,
          liquidity: parseFloat(bestPair.liquidity?.usd) || 0,
          chain: 'solana',
        },
        pairCreatedAt,
        pairAddress: bestPair.pairAddress || '',
        dexId: bestPair.dexId || 'unknown',
      };
    } catch (error) {
      console.error('VoidScreener API error:', error);
      return null;
    }
  }
}

export const voidScreener = new VoidScreenerAPI();
export default voidScreener;
