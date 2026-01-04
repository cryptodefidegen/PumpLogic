import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  Search,
  FileText,
  Download,
  RefreshCw,
  ExternalLink,
  Activity,
  Lock,
  Unlock,
  Eye,
  Coins,
  DollarSign,
  BarChart3,
  Droplets,
  Zap,
  Copy,
  Filter,
  ArrowUpDown,
  Plus,
  Link2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";
import tokenApi from "@/lib/tokenApi";
import { useApiProvider } from "@/contexts/ApiProviderContext";

interface RiskFactor {
  name: string;
  status: "safe" | "warning" | "danger";
  description: string;
  weight: number;
}

interface TokenAnalysis {
  address: string;
  name: string;
  symbol: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  factors: RiskFactor[];
  liquidityLocked: boolean;
  topHoldersPercent: number;
  mintDisabled: boolean;
  freezeDisabled: boolean;
  lpBurned: boolean;
  createdAt: string;
  priceUsd: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  pairAddress: string;
  dexId: string;
}

function getRiskColor(level: string) {
  switch (level) {
    case "low": return "text-green-500";
    case "medium": return "text-yellow-500";
    case "high": return "text-orange-500";
    case "critical": return "text-red-500";
    default: return "text-muted-foreground";
  }
}

function getRiskBg(level: string) {
  switch (level) {
    case "low": return "bg-green-500/10 border-green-500/30";
    case "medium": return "bg-yellow-500/10 border-yellow-500/30";
    case "high": return "bg-orange-500/10 border-orange-500/30";
    case "critical": return "bg-red-500/10 border-red-500/30";
    default: return "bg-muted/10 border-muted/30";
  }
}

function formatPrice(price: number): string {
  if (price === 0) return "$0.00";
  if (price < 0.000001) return `$${price.toFixed(9)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

interface WatchlistToken {
  address: string;
  name: string;
  symbol: string;
  addedAt: Date;
}

interface TokenHolder {
  address: string;
  balance: number;
  percentage: number;
}

interface BundleInfo {
  wallets: string[];
  totalPercentage: number;
  signature?: string;
}

interface HoldersData {
  mint: string;
  totalSupply: number;
  totalHolders: number;
  holders: TokenHolder[];
  concentration: {
    top10Percentage: number;
    top20Percentage: number;
    isHighlyConcentrated: boolean;
  };
  bundles?: BundleInfo[];
}

interface WhaleAlert {
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

type AlertFilterType = 'all' | 'buy' | 'sell' | 'transfer';
type AlertSortType = 'time' | 'amount' | 'impact';
type AlertTimeframe = 'all' | '15m' | '1h' | '24h';

function getSeverityBadge(amount: number) {
  if (amount >= 1000000) {
    return { label: 'MEGA WHALE', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' };
  }
  if (amount >= 500000) {
    return { label: 'LARGE WHALE', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
  }
  if (amount >= 250000) {
    return { label: 'WHALE', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' };
  }
  return { label: 'DOLPHIN', color: 'bg-gray-500/20 text-gray-400 border-gray-500/50' };
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function Guard() {
  const { isConnected, user } = useWallet();
  const { provider } = useApiProvider();
  const { toast } = useToast();
  const [tokenAddress, setTokenAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [holdersData, setHoldersData] = useState<HoldersData | null>(null);
  const [isLoadingHolders, setIsLoadingHolders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlistInput, setWatchlistInput] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistToken[]>([]);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner");
  const [whaleAlerts, setWhaleAlerts] = useState<WhaleAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [whaleAlertsUnavailable, setWhaleAlertsUnavailable] = useState(false);
  
  const [alertFilter, setAlertFilter] = useState<AlertFilterType>('all');
  const [alertSort, setAlertSort] = useState<AlertSortType>('time');
  const [alertTimeframe, setAlertTimeframe] = useState<AlertTimeframe>('all');

  const filteredAlerts = whaleAlerts
    .filter(alert => {
      if (alertFilter !== 'all' && alert.type !== alertFilter) return false;
      if (alertTimeframe !== 'all') {
        const now = new Date();
        const alertTime = new Date(alert.timestamp);
        const diffMs = now.getTime() - alertTime.getTime();
        const diffMins = diffMs / 60000;
        if (alertTimeframe === '15m' && diffMins > 15) return false;
        if (alertTimeframe === '1h' && diffMins > 60) return false;
        if (alertTimeframe === '24h' && diffMins > 1440) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (alertSort === 'amount') return (b.amount || 0) - (a.amount || 0);
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const alertStats = {
    totalAlerts: whaleAlerts.length,
    buyCount: whaleAlerts.filter(a => a.type === 'buy').length,
    sellCount: whaleAlerts.filter(a => a.type === 'sell').length,
    transferCount: whaleAlerts.filter(a => a.type === 'transfer').length,
    uniqueWhales: new Set(whaleAlerts.map(a => a.walletAddress)).size,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
      className: "bg-primary text-black font-bold"
    });
  };

  const scanTokenFromAlert = (address: string) => {
    setTokenAddress(address);
    setActiveTab("scanner");
    setAnalysis(null);
    setError(null);
  };

  const fetchWhaleAlerts = async () => {
    setIsLoadingAlerts(true);
    setWhaleAlertsUnavailable(false);
    try {
      const result = await tokenApi.getWhaleAlerts({ chain: 'solana', minAmount: 10000 }, provider);
      if (result.unavailable) {
        setWhaleAlertsUnavailable(true);
        setWhaleAlerts([]);
      } else if (result.alerts && Array.isArray(result.alerts)) {
        setWhaleAlerts(result.alerts.slice(0, 10));
      }
    } catch (err) {
      console.error('Failed to fetch whale alerts:', err);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchWhaleAlerts();
    }
  }, [activeTab, provider]);

  const fetchHolders = async (mintAddress: string) => {
    setIsLoadingHolders(true);
    setHoldersData(null);
    try {
      const response = await fetch(`/api/token/${mintAddress}/holders?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setHoldersData(data);
      }
    } catch (err) {
      console.error("Failed to fetch holders:", err);
    } finally {
      setIsLoadingHolders(false);
    }
  };

  const scanFromWatchlist = async (address: string) => {
    setTokenAddress(address);
    setActiveTab("scanner");
    setError(null);
    setAnalysis(null);
    setIsAnalyzing(true);
    
    try {
      const result = await tokenApi.getTokenWithRiskFactors(address, provider);
      
      if (!result) {
        throw new Error("Token not found or no trading pairs available");
      }
      
      const { token, pairCreatedAt, pairAddress, dexId } = result;
      const tokenName = token.name;
      const tokenSymbol = token.symbol;
      const priceUsd = token.price;
      const priceChange24h = token.priceChange24h;
      const volume24h = token.volume24h;
      const liquidity = token.liquidity;
      const marketCap = token.marketCap;
      
      const factors: RiskFactor[] = [];
      let riskScore = 0;
      
      if (liquidity > 100000) {
        factors.push({ name: "Liquidity Depth", status: "safe", description: `Strong liquidity: ${formatLargeNumber(liquidity)}`, weight: 20 });
      } else if (liquidity > 10000) {
        factors.push({ name: "Liquidity Depth", status: "warning", description: `Moderate liquidity: ${formatLargeNumber(liquidity)}`, weight: 20 });
        riskScore += 15;
      } else if (liquidity > 0) {
        factors.push({ name: "Liquidity Depth", status: "danger", description: `Low liquidity: ${formatLargeNumber(liquidity)}`, weight: 20 });
        riskScore += 30;
      } else {
        factors.push({ name: "Liquidity Depth", status: "danger", description: "No DEX liquidity (may be on bonding curve)", weight: 20 });
        riskScore += 30;
      }
      
      if (volume24h > 50000) {
        factors.push({ name: "Trading Volume", status: "safe", description: `Healthy 24h volume: ${formatLargeNumber(volume24h)}`, weight: 15 });
      } else if (volume24h > 5000) {
        factors.push({ name: "Trading Volume", status: "warning", description: `Low 24h volume: ${formatLargeNumber(volume24h)}`, weight: 15 });
        riskScore += 10;
      } else {
        factors.push({ name: "Trading Volume", status: "danger", description: `Very low 24h volume: ${formatLargeNumber(volume24h)}`, weight: 15 });
        riskScore += 20;
      }
      
      const absChange = Math.abs(priceChange24h);
      if (absChange < 10) {
        factors.push({ name: "Price Stability", status: "safe", description: `Stable price movement: ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`, weight: 15 });
      } else if (absChange < 30) {
        factors.push({ name: "Price Stability", status: "warning", description: `Moderate volatility: ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`, weight: 15 });
        riskScore += 10;
      } else {
        factors.push({ name: "Price Stability", status: "danger", description: `High volatility: ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`, weight: 15 });
        riskScore += 20;
      }
      
      if (marketCap > 1000000) {
        factors.push({ name: "Market Cap", status: "safe", description: `Strong market cap: ${formatLargeNumber(marketCap)}`, weight: 20 });
      } else if (marketCap > 100000) {
        factors.push({ name: "Market Cap", status: "warning", description: `Small market cap: ${formatLargeNumber(marketCap)}`, weight: 20 });
        riskScore += 15;
      } else {
        factors.push({ name: "Market Cap", status: "danger", description: `Micro cap: ${formatLargeNumber(marketCap)}`, weight: 20 });
        riskScore += 25;
      }
      
      const ageInDays = (Date.now() - new Date(pairCreatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > 30) {
        factors.push({ name: "Token Age", status: "safe", description: `Established token: ${Math.floor(ageInDays)} days old`, weight: 15 });
      } else if (ageInDays > 7) {
        factors.push({ name: "Token Age", status: "warning", description: `Newer token: ${Math.floor(ageInDays)} days old`, weight: 15 });
        riskScore += 10;
      } else {
        factors.push({ name: "Token Age", status: "danger", description: `Very new token: ${Math.floor(ageInDays)} days old`, weight: 15 });
        riskScore += 20;
      }
      
      if (dexId === "raydium" || dexId === "orca") {
        factors.push({ name: "DEX Platform", status: "safe", description: `Trading on ${dexId.charAt(0).toUpperCase() + dexId.slice(1)}`, weight: 15 });
      } else {
        factors.push({ name: "DEX Platform", status: "warning", description: `Trading on ${dexId}`, weight: 15 });
        riskScore += 5;
      }
      
      let riskLevel: "low" | "medium" | "high" | "critical";
      if (riskScore < 25) riskLevel = "low";
      else if (riskScore < 50) riskLevel = "medium";
      else if (riskScore < 75) riskLevel = "high";
      else riskLevel = "critical";
      
      setAnalysis({
        address,
        name: tokenName,
        symbol: tokenSymbol,
        riskScore,
        riskLevel,
        factors,
        liquidityLocked: liquidity > 50000,
        topHoldersPercent: 45,
        mintDisabled: true,
        freezeDisabled: true,
        lpBurned: false,
        createdAt: pairCreatedAt,
        priceUsd,
        priceChange24h,
        volume24h,
        liquidity,
        marketCap,
        pairAddress,
        dexId,
      });
      
      // Fetch holders data in parallel
      fetchHolders(address);
    } catch (err: any) {
      setError(err.message || "Failed to analyze token");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToWatchlist = async () => {
    if (!watchlistInput.trim()) return;
    
    if (watchlist.some(t => t.address.toLowerCase() === watchlistInput.toLowerCase())) {
      return;
    }
    
    setIsAddingToWatchlist(true);
    
    try {
      const tokenData = await tokenApi.getTokenAnalytics(watchlistInput, provider);
      
      let tokenName = "Unknown Token";
      let tokenSymbol = "???";
      
      if (tokenData) {
        tokenName = tokenData.name;
        tokenSymbol = tokenData.symbol;
      }
      
      setWatchlist(prev => [...prev, {
        address: watchlistInput,
        name: tokenName,
        symbol: tokenSymbol,
        addedAt: new Date()
      }]);
      setWatchlistInput("");
    } catch (err) {
      setWatchlist(prev => [...prev, {
        address: watchlistInput,
        name: "Unknown Token",
        symbol: "???",
        addedAt: new Date()
      }]);
      setWatchlistInput("");
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const removeFromWatchlist = (address: string) => {
    setWatchlist(prev => prev.filter(t => t.address !== address));
  };

  const analyzeToken = async () => {
    if (!tokenAddress) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const result = await tokenApi.getTokenWithRiskFactors(tokenAddress, provider);
      
      if (!result) {
        throw new Error("Token not found or no trading pairs available");
      }
      
      const { token, pairCreatedAt, pairAddress, dexId } = result;
      const tokenName = token.name;
      const tokenSymbol = token.symbol;
      const priceUsd = token.price;
      const priceChange24h = token.priceChange24h;
      const volume24h = token.volume24h;
      const liquidity = token.liquidity;
      const marketCap = token.marketCap;
      
      // Calculate risk factors based on real data
      const factors: RiskFactor[] = [];
      let riskScore = 0;
      
      // Liquidity check
      if (liquidity > 100000) {
        factors.push({ name: "Liquidity Depth", status: "safe", description: `Strong liquidity: ${formatLargeNumber(liquidity)}`, weight: 20 });
      } else if (liquidity > 10000) {
        factors.push({ name: "Liquidity Depth", status: "warning", description: `Moderate liquidity: ${formatLargeNumber(liquidity)}`, weight: 20 });
        riskScore += 15;
      } else if (liquidity > 0) {
        factors.push({ name: "Liquidity Depth", status: "danger", description: `Low liquidity: ${formatLargeNumber(liquidity)}`, weight: 20 });
        riskScore += 30;
      } else {
        factors.push({ name: "Liquidity Depth", status: "danger", description: "No DEX liquidity (may be on bonding curve)", weight: 20 });
        riskScore += 30;
      }
      
      // Volume check
      if (volume24h > 50000) {
        factors.push({ name: "Trading Volume", status: "safe", description: `Healthy 24h volume: ${formatLargeNumber(volume24h)}`, weight: 15 });
      } else if (volume24h > 5000) {
        factors.push({ name: "Trading Volume", status: "warning", description: `Low 24h volume: ${formatLargeNumber(volume24h)}`, weight: 15 });
        riskScore += 10;
      } else {
        factors.push({ name: "Trading Volume", status: "danger", description: `Very low 24h volume: ${formatLargeNumber(volume24h)}`, weight: 15 });
        riskScore += 20;
      }
      
      // Price volatility check
      const absChange = Math.abs(priceChange24h);
      if (absChange < 10) {
        factors.push({ name: "Price Stability", status: "safe", description: `Stable price movement: ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`, weight: 15 });
      } else if (absChange < 30) {
        factors.push({ name: "Price Stability", status: "warning", description: `Moderate volatility: ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`, weight: 15 });
        riskScore += 10;
      } else {
        factors.push({ name: "Price Stability", status: "danger", description: `High volatility: ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`, weight: 15 });
        riskScore += 20;
      }
      
      // Market cap check
      if (marketCap > 1000000) {
        factors.push({ name: "Market Cap", status: "safe", description: `Strong market cap: ${formatLargeNumber(marketCap)}`, weight: 20 });
      } else if (marketCap > 100000) {
        factors.push({ name: "Market Cap", status: "warning", description: `Small market cap: ${formatLargeNumber(marketCap)}`, weight: 20 });
        riskScore += 15;
      } else {
        factors.push({ name: "Market Cap", status: "danger", description: `Micro cap: ${formatLargeNumber(marketCap)}`, weight: 20 });
        riskScore += 25;
      }
      
      // Age check (based on pair creation)
      const ageInDays = (Date.now() - new Date(pairCreatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > 30) {
        factors.push({ name: "Token Age", status: "safe", description: `Established token: ${Math.floor(ageInDays)} days old`, weight: 15 });
      } else if (ageInDays > 7) {
        factors.push({ name: "Token Age", status: "warning", description: `Newer token: ${Math.floor(ageInDays)} days old`, weight: 15 });
        riskScore += 10;
      } else {
        factors.push({ name: "Token Age", status: "danger", description: `Very new token: ${Math.floor(ageInDays)} days old`, weight: 15 });
        riskScore += 20;
      }
      
      // DEX check
      if (dexId === "raydium" || dexId === "orca") {
        factors.push({ name: "DEX Platform", status: "safe", description: `Trading on ${dexId.charAt(0).toUpperCase() + dexId.slice(1)}`, weight: 15 });
      } else {
        factors.push({ name: "DEX Platform", status: "warning", description: `Trading on ${dexId}`, weight: 15 });
        riskScore += 5;
      }
      
      // Determine risk level
      let riskLevel: "low" | "medium" | "high" | "critical";
      if (riskScore < 25) riskLevel = "low";
      else if (riskScore < 50) riskLevel = "medium";
      else if (riskScore < 75) riskLevel = "high";
      else riskLevel = "critical";
      
      const tokenAnalysis: TokenAnalysis = {
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        riskScore,
        riskLevel,
        factors,
        liquidityLocked: liquidity > 50000,
        topHoldersPercent: 45,
        mintDisabled: true,
        freezeDisabled: true,
        lpBurned: false,
        createdAt: pairCreatedAt,
        priceUsd,
        priceChange24h,
        volume24h,
        liquidity,
        marketCap,
        pairAddress,
        dexId,
      };
      
      setAnalysis(tokenAnalysis);
      
      // Fetch holders data in parallel
      fetchHolders(tokenAddress);
    } catch (err: any) {
      setError(err.message || "Failed to analyze token");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isPreviewMode = !isConnected;

  return (
    <div className="min-h-screen text-foreground pb-20">
      <div className="container mx-auto px-4 pt-8">
        {isPreviewMode && (
          <div className="bg-primary/10 border-2 border-primary/50 rounded-lg p-4 mb-8 flex items-start gap-3">
            <Wallet className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="text-primary block mb-1">PREVIEW MODE</strong>
              <span className="text-white/80">You're viewing Guard in preview mode. Connect your Phantom wallet to save watchlists and set alerts.</span>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Pump<span className="text-primary">Logic</span> Guard
              </h1>
              <Badge className="bg-primary/20 text-primary border-primary/50">BETA</Badge>
            </div>
            <p className="text-muted-foreground">
              Token security analysis, rug-pull detection & risk monitoring
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="scanner" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Search className="h-4 w-4 mr-2" />
              Token Scanner
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risk Alerts
            </TabsTrigger>
            <TabsTrigger value="tax" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <FileText className="h-4 w-4 mr-2" />
              Tax Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Analyze Token
                </CardTitle>
                <CardDescription>
                  Enter a Solana token address to scan for rug-pull patterns and security risks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter token contract address..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    className="bg-black/40 border-white/20 font-mono text-sm"
                    data-testid="input-token-address"
                  />
                  <Button 
                    onClick={analyzeToken}
                    disabled={!tokenAddress || isAnalyzing}
                    className="bg-primary text-black hover:bg-primary/90 shrink-0"
                    data-testid="button-analyze"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
                {error && (
                  <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {analysis && (
              <>
                <Card className={cn("border", getRiskBg(analysis.riskLevel))}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold",
                          analysis.riskLevel === "low" ? "bg-green-500/20 text-green-500" :
                          analysis.riskLevel === "medium" ? "bg-yellow-500/20 text-yellow-500" :
                          analysis.riskLevel === "high" ? "bg-orange-500/20 text-orange-500" :
                          "bg-red-500/20 text-red-500"
                        )}>
                          {analysis.riskScore}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{analysis.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{analysis.symbol}</p>
                          <p className={cn("text-sm font-semibold mt-1 uppercase", getRiskColor(analysis.riskLevel))}>
                            {analysis.riskLevel} Risk
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={`https://solscan.io/token/${analysis.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="border-white/20">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Solscan
                          </Button>
                        </a>
                        <a 
                          href={`https://dexscreener.com/solana/${analysis.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="border-white/20">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            DexScreener
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Price</p>
                      <p className="text-lg font-bold text-primary font-mono">{formatPrice(analysis.priceUsd)}</p>
                      <p className={cn("text-xs mt-1", analysis.priceChange24h >= 0 ? "text-green-500" : "text-red-500")}>
                        {analysis.priceChange24h >= 0 ? "+" : ""}{analysis.priceChange24h.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">24h Volume</p>
                      <p className="text-lg font-bold text-blue-400 font-mono">{formatLargeNumber(analysis.volume24h)}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      <Droplets className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Liquidity</p>
                      <p className="text-lg font-bold text-purple-400 font-mono">{formatLargeNumber(analysis.liquidity)}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      <Coins className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Market Cap</p>
                      <p className="text-lg font-bold text-yellow-400 font-mono">{formatLargeNumber(analysis.marketCap)}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      {analysis.liquidityLocked ? (
                        <Lock className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      ) : (
                        <Unlock className="h-6 w-6 text-red-500 mx-auto mb-2" />
                      )}
                      <p className="text-xs font-medium text-white">Liquidity Status</p>
                      <p className={cn("text-xs", analysis.liquidityLocked ? "text-green-500" : "text-red-500")}>
                        {analysis.liquidityLocked ? "Strong" : "Low"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">Token Age</p>
                      <p className="text-xs text-blue-400">
                        {Math.floor((Date.now() - new Date(analysis.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">DEX</p>
                      <p className="text-xs text-primary capitalize">{analysis.dexId}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      {analysis.priceChange24h >= 0 ? (
                        <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-500 mx-auto mb-2" />
                      )}
                      <p className="text-xs font-medium text-white">24h Trend</p>
                      <p className={cn("text-xs", analysis.priceChange24h >= 0 ? "text-green-500" : "text-red-500")}>
                        {analysis.priceChange24h >= 0 ? "Bullish" : "Bearish"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-black/40 border-white/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Price Chart
                      </CardTitle>
                      <Badge variant="outline" className="border-white/20 text-xs">
                        {provider === 'voidscreener' ? 'VoidScreener Data' : 'DexScreener'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="w-full h-[300px] rounded-b-lg overflow-hidden">
                      <iframe
                        src={`https://dexscreener.com/solana/${analysis.address}?embed=1&theme=dark&trades=0&info=0`}
                        className="w-full h-full border-0"
                        title="Price Chart"
                        loading="lazy"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Risk Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.factors.map((factor, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          {factor.status === "safe" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : factor.status === "warning" ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{factor.name}</p>
                            <p className="text-xs text-muted-foreground">{factor.description}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            factor.status === "safe" ? "border-green-500/50 text-green-500" :
                            factor.status === "warning" ? "border-yellow-500/50 text-yellow-500" :
                            "border-red-500/50 text-red-500"
                          )}
                        >
                          {factor.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Top Holders
                      </CardTitle>
                      {holdersData && (
                        <Badge variant="outline" className="border-white/20">
                          {holdersData.totalHolders.toLocaleString()} holders
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingHolders ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading holders...</span>
                      </div>
                    ) : holdersData ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {holdersData.concentration && (
                            <div className={cn(
                              "p-3 rounded-lg border",
                              holdersData.concentration.isHighlyConcentrated 
                                ? "bg-red-500/10 border-red-500/30" 
                                : "bg-green-500/10 border-green-500/30"
                            )}>
                              <div className="flex items-center gap-1.5 mb-2">
                                {holdersData.concentration.isHighlyConcentrated ? (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                <span className={cn(
                                  "font-semibold text-sm",
                                  holdersData.concentration.isHighlyConcentrated ? "text-red-500" : "text-green-500"
                                )}>
                                  {holdersData.concentration.isHighlyConcentrated ? "High Risk" : "Healthy"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 text-xs mb-2">
                                <div className="p-1.5 rounded bg-black/30">
                                  <p className="text-muted-foreground text-[10px]">Top 10</p>
                                  <p className={cn(
                                    "font-bold",
                                    holdersData.concentration.top10Percentage > 50 ? "text-red-500" : "text-green-500"
                                  )}>
                                    {holdersData.concentration.top10Percentage.toFixed(1)}%
                                  </p>
                                </div>
                                <div className="p-1.5 rounded bg-black/30">
                                  <p className="text-muted-foreground text-[10px]">Top 20</p>
                                  <p className={cn(
                                    "font-bold",
                                    holdersData.concentration.top20Percentage > 70 ? "text-yellow-500" : "text-green-500"
                                  )}>
                                    {holdersData.concentration.top20Percentage.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                              
                              {(() => {
                                const top1 = holdersData.holders[0]?.percentage || 0;
                                const whaleCount = holdersData.holders.filter(h => h.percentage >= 5).length;
                                const remainingPercent = Math.max(0, 100 - holdersData.concentration.top10Percentage);
                                
                                return (
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-muted-foreground">Largest</span>
                                      <span className={cn(
                                        "font-medium",
                                        top1 > 20 ? "text-red-500" : top1 > 10 ? "text-yellow-500" : "text-green-500"
                                      )}>
                                        {top1.toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-muted-foreground">Whales</span>
                                      <span className={cn(
                                        "font-medium",
                                        whaleCount > 5 ? "text-red-500" : whaleCount > 2 ? "text-yellow-500" : "text-green-500"
                                      )}>
                                        {whaleCount}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-muted-foreground">Community</span>
                                      <span className={cn(
                                        "font-medium",
                                        remainingPercent < 30 ? "text-red-500" : remainingPercent < 50 ? "text-yellow-500" : "text-green-500"
                                      )}>
                                        {remainingPercent.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          <div className="p-3 rounded-lg border border-white/10 bg-black/20">
                            <p className="text-xs font-medium text-white mb-1 flex items-center gap-1.5">
                              <BarChart3 className="h-3 w-3 text-primary" />
                              Distribution
                            </p>
                            <div className="h-[100px]">
                              {(() => {
                                const top10Total = holdersData.holders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);
                                const othersTotal = Math.max(0, 100 - top10Total);
                                const chartData: { name: string; value: number }[] = holdersData.holders.slice(0, 5).map((h, i) => ({
                                  name: `#${i + 1}`,
                                  value: h.percentage
                                }));
                                const top5Total = chartData.reduce((sum, d) => sum + d.value, 0);
                                if (holdersData.holders.length > 5) {
                                  chartData.push({
                                    name: '#6-10',
                                    value: Math.max(0, top10Total - top5Total)
                                  });
                                }
                                if (othersTotal > 0) {
                                  chartData.push({
                                    name: 'Others',
                                    value: othersTotal
                                  });
                                }
                                const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#64748b'];
                                
                                return (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={35}
                                        outerRadius={55}
                                        paddingAngle={2}
                                        dataKey="value"
                                      >
                                        {chartData.map((_, index) => (
                                          <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]}
                                          />
                                        ))}
                                      </Pie>
                                      <Tooltip 
                                        content={({ active, payload }) => {
                                          if (active && payload && payload.length) {
                                            const data = payload[0];
                                            return (
                                              <div className="bg-black/95 border border-white/20 rounded-lg px-3 py-2 text-sm">
                                                <p className="text-white font-medium">{data.name}</p>
                                                <p className="text-primary">{Number(data.value).toFixed(2)}%</p>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                      />
                                    </PieChart>
                                  </ResponsiveContainer>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className={cn(
                          "p-4 rounded-lg border",
                          holdersData.bundles && holdersData.bundles.length > 0 
                            ? "border-orange-500/30 bg-orange-500/10" 
                            : "border-green-500/30 bg-green-500/10"
                        )}>
                          <div className="flex items-center gap-2 mb-3">
                            <Link2 className={cn(
                              "h-5 w-5",
                              holdersData.bundles && holdersData.bundles.length > 0 ? "text-orange-500" : "text-green-500"
                            )} />
                            <span className={cn(
                              "font-semibold",
                              holdersData.bundles && holdersData.bundles.length > 0 ? "text-orange-500" : "text-green-500"
                            )}>
                              {holdersData.bundles && holdersData.bundles.length > 0 
                                ? `Bundle Detection: ${holdersData.bundles.length} potential bundle${holdersData.bundles.length > 1 ? 's' : ''} found`
                                : "Bundle Detection: No suspicious bundles detected"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {holdersData.bundles && holdersData.bundles.length > 0 
                              ? "Wallets with matching or near-identical balances may indicate coordinated buying"
                              : "No groups of wallets found with identical token amounts (potential bundled purchases)"}
                          </p>
                          {holdersData.bundles && holdersData.bundles.length > 0 && (
                            <div className="space-y-2">
                              {holdersData.bundles.slice(0, 3).map((bundle: any, bundleIndex: number) => (
                                <div key={bundleIndex} className="p-2 rounded bg-black/40 border border-white/5">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-orange-400 font-medium">
                                      Bundle #{bundleIndex + 1} - {bundle.wallets.length} wallets
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {bundle.totalPercentage.toFixed(2)}% combined
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {bundle.wallets.slice(0, 5).map((wallet: string, i: number) => (
                                      <a
                                        key={i}
                                        href={`https://solscan.io/account/${wallet}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono text-primary hover:underline"
                                      >
                                        {wallet.slice(0, 4)}...{wallet.slice(-4)}
                                      </a>
                                    ))}
                                    {bundle.wallets.length > 5 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{bundle.wallets.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">#</th>
                                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Wallet</th>
                                <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Balance</th>
                                <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {holdersData.holders.slice(0, 10).map((holder, index) => (
                                <tr key={holder.address} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="py-2 px-2 text-sm text-muted-foreground">{index + 1}</td>
                                  <td className="py-2 px-2">
                                    <div className="flex items-center gap-2">
                                      <a 
                                        href={`https://solscan.io/account/${holder.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-xs text-primary hover:underline"
                                      >
                                        {holder.address.slice(0, 4)}...{holder.address.slice(-4)}
                                      </a>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(holder.address, "Address")}
                                        className="h-6 w-6 p-0 hover:bg-white/10"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                  <td className="py-2 px-2 text-right font-mono text-xs text-white">
                                    {holder.balance >= 1000000 
                                      ? `${(holder.balance / 1000000).toFixed(2)}M`
                                      : holder.balance >= 1000 
                                        ? `${(holder.balance / 1000).toFixed(2)}K`
                                        : holder.balance.toFixed(2)
                                    }
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs",
                                        holder.percentage > 10 ? "border-red-500/50 text-red-500" :
                                        holder.percentage > 5 ? "border-yellow-500/50 text-yellow-500" :
                                        "border-green-500/50 text-green-500"
                                      )}
                                    >
                                      {holder.percentage.toFixed(2)}%
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Holder data will appear after token analysis
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {/* Summary Statistics */}
            {!whaleAlertsUnavailable && whaleAlerts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="bg-black/40 border-white/10 p-4">
                  <p className="text-xs text-muted-foreground">Total Alerts</p>
                  <p className="text-lg font-bold text-white">{alertStats.totalAlerts}</p>
                </Card>
                <Card className="bg-black/40 border-white/10 p-4">
                  <p className="text-xs text-muted-foreground">Buy Alerts</p>
                  <p className="text-lg font-bold text-green-500">{alertStats.buyCount}</p>
                </Card>
                <Card className="bg-black/40 border-white/10 p-4">
                  <p className="text-xs text-muted-foreground">Sell Alerts</p>
                  <p className="text-lg font-bold text-red-500">{alertStats.sellCount}</p>
                </Card>
                <Card className="bg-black/40 border-white/10 p-4">
                  <p className="text-xs text-muted-foreground">Transfers</p>
                  <p className="text-lg font-bold text-yellow-500">{alertStats.transferCount}</p>
                </Card>
                <Card className="bg-black/40 border-white/10 p-4">
                  <p className="text-xs text-muted-foreground">Unique Whales</p>
                  <p className="text-lg font-bold text-blue-400">{alertStats.uniqueWhales}</p>
                </Card>
              </div>
            )}

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Whale Alerts
                      <Badge className="bg-primary/20 text-primary border-primary/50 text-xs">VoidScreener</Badge>
                    </CardTitle>
                    <CardDescription>
                      Real-time large transaction alerts on Solana
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Select value={alertFilter} onValueChange={(v) => setAlertFilter(v as AlertFilterType)}>
                      <SelectTrigger className="w-[100px] h-8 text-xs bg-black/40 border-white/20">
                        <Filter className="h-3 w-3 mr-1" />
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="buy">Buys</SelectItem>
                        <SelectItem value="sell">Sells</SelectItem>
                        <SelectItem value="transfer">Transfers</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={alertTimeframe} onValueChange={(v) => setAlertTimeframe(v as AlertTimeframe)}>
                      <SelectTrigger className="w-[90px] h-8 text-xs bg-black/40 border-white/20">
                        <Clock className="h-3 w-3 mr-1" />
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="15m">15 min</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={alertSort} onValueChange={(v) => setAlertSort(v as AlertSortType)}>
                      <SelectTrigger className="w-[100px] h-8 text-xs bg-black/40 border-white/20">
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">Latest</SelectItem>
                        <SelectItem value="amount">Largest</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchWhaleAlerts}
                      disabled={isLoadingAlerts}
                      className="border-white/20 h-8"
                      data-testid="button-refresh-alerts"
                    >
                      <RefreshCw className={cn("h-3 w-3 mr-1", isLoadingAlerts && "animate-spin")} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAlerts ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading whale alerts...</span>
                  </div>
                ) : whaleAlertsUnavailable ? (
                  <div className="space-y-4">
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500/50" />
                      <p className="text-sm text-yellow-400">Whale Alerts Unavailable</p>
                      <p className="text-xs mt-1">Whale alerts are only available when using VoidScreener API.</p>
                      <p className="text-xs mt-1 text-muted-foreground">Switch to VoidScreener using the toggle in the navbar.</p>
                    </div>
                  </div>
                ) : filteredAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {filteredAlerts.map((alert, index) => {
                      const severity = getSeverityBadge(alert.amount);
                      return (
                        <div 
                          key={alert.id || index}
                          className={cn(
                            "p-4 rounded-lg border transition-all hover:bg-white/5",
                            alert.type === 'sell' 
                              ? "bg-red-500/5 border-red-500/20" 
                              : alert.type === 'buy'
                              ? "bg-green-500/5 border-green-500/20"
                              : "bg-yellow-500/5 border-yellow-500/20"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={cn(
                              "p-2 rounded-lg shrink-0",
                              alert.type === 'sell' ? "bg-red-500/20" : 
                              alert.type === 'buy' ? "bg-green-500/20" : "bg-yellow-500/20"
                            )}>
                              {alert.type === 'sell' ? (
                                <TrendingDown className="h-5 w-5 text-red-500" />
                              ) : alert.type === 'buy' ? (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                              ) : (
                                <Activity className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-white">
                                  {alert.tokenSymbol || 'Unknown'}
                                </p>
                                <Badge variant="outline" className={cn("text-xs", severity.color)}>
                                  {severity.label}
                                </Badge>
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  alert.type === 'sell' ? "border-red-500/50 text-red-400" : 
                                  alert.type === 'buy' ? "border-green-500/50 text-green-400" :
                                  "border-yellow-500/50 text-yellow-400"
                                )}>
                                  {alert.type.toUpperCase()}
                                </Badge>
                                {alert.dexId && (
                                  <span className="text-xs text-muted-foreground">{alert.dexId}</span>
                                )}
                              </div>

                              {/* Amount */}
                              <div className="mt-2">
                                <p className="text-lg font-bold text-white">
                                  {(alert.amount || 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{alert.tokenSymbol}</span>
                                </p>
                              </div>

                              {/* Wallet & Time */}
                              <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getTimeAgo(alert.timestamp)}
                                </span>
                                <span className="font-mono">
                                  {alert.walletAddress?.slice(0, 6)}...{alert.walletAddress?.slice(-4)}
                                </span>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-col gap-1 shrink-0">
                              {alert.tokenAddress && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => scanTokenFromAlert(alert.tokenAddress)}
                                  className="h-7 px-2 text-primary hover:text-primary/80"
                                  title="Scan Token"
                                >
                                  <Search className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(alert.walletAddress, 'Wallet')}
                                className="h-7 px-2 text-muted-foreground hover:text-white"
                                title="Copy Wallet"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {alert.txHash && (
                                <a 
                                  href={`https://solscan.io/tx/${alert.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 px-2 flex items-center justify-center text-muted-foreground hover:text-white"
                                  title="View on Solscan"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {alert.tokenAddress && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (!watchlist.some(t => t.address === alert.tokenAddress)) {
                                      setWatchlist(prev => [...prev, {
                                        address: alert.tokenAddress,
                                        name: alert.tokenName || 'Unknown',
                                        symbol: alert.tokenSymbol || '???',
                                        addedAt: new Date()
                                      }]);
                                      toast({
                                        title: "Added to Watchlist",
                                        description: `${alert.tokenSymbol} added to your watchlist`,
                                        className: "bg-primary text-black font-bold"
                                      });
                                    }
                                  }}
                                  className="h-7 px-2 text-muted-foreground hover:text-white"
                                  title="Add to Watchlist"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : whaleAlerts.length > 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No alerts match your filters</p>
                    <p className="text-xs mt-1">Try adjusting your filter settings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-6 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No whale alerts available right now</p>
                      <p className="text-xs mt-1">Check back later for large transaction alerts</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Watchlist
                </CardTitle>
                <CardDescription>
                  Add tokens to monitor for suspicious activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Input
                    placeholder="Add token to watchlist..."
                    value={watchlistInput}
                    onChange={(e) => setWatchlistInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
                    className="bg-black/40 border-white/20 font-mono text-sm"
                    data-testid="input-watchlist"
                  />
                  <Button 
                    onClick={addToWatchlist}
                    disabled={!watchlistInput.trim() || isAddingToWatchlist}
                    className="bg-primary text-black hover:bg-primary/90 shrink-0" 
                    data-testid="button-add-watchlist"
                  >
                    {isAddingToWatchlist ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
                {watchlist.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tokens in watchlist. Add tokens above to monitor them.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {watchlist.map((token) => (
                      <div 
                        key={token.address}
                        className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Coins className="h-5 w-5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {token.name} <span className="text-muted-foreground">${token.symbol}</span>
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate">{token.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => scanFromWatchlist(token.address)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromWatchlist(token.address)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Tax Report Generator
                </CardTitle>
                <CardDescription>
                  Generate tax reports for your Solana transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Start Date</label>
                    <Input type="date" className="bg-black/40 border-white/20" data-testid="input-start-date" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">End Date</label>
                    <Input type="date" className="bg-black/40 border-white/20" data-testid="input-end-date" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-primary text-black hover:bg-primary/90" data-testid="button-generate-report">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="border-white/20" data-testid="button-download-csv">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  Transaction Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-center">
                    <p className="text-2xl font-bold text-white font-mono">0</p>
                    <p className="text-xs text-muted-foreground">Total Transactions</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-center">
                    <p className="text-2xl font-bold text-green-500 font-mono">$0.00</p>
                    <p className="text-xs text-muted-foreground">Total Gains</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-center">
                    <p className="text-2xl font-bold text-red-500 font-mono">$0.00</p>
                    <p className="text-xs text-muted-foreground">Total Losses</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-center">
                    <p className="text-2xl font-bold text-primary font-mono">$0.00</p>
                    <p className="text-xs text-muted-foreground">Net P&L</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center py-4">
                  Select a date range and generate a report to see your transaction summary.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Powered by VoidScreener */}
        <div className="flex items-center justify-center gap-2 pt-8 pb-4">
          <span className="text-xs text-muted-foreground">Powered by</span>
          <a 
            href="https://voidscreener.fun" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            VoidScreener
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
