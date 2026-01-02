import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";
import voidScreener from "@/lib/voidscreener";

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

export default function Guard() {
  const { isConnected, user } = useWallet();
  const [tokenAddress, setTokenAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watchlistInput, setWatchlistInput] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistToken[]>([]);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner");

  const scanFromWatchlist = async (address: string) => {
    setTokenAddress(address);
    setActiveTab("scanner");
    setError(null);
    setAnalysis(null);
    setIsAnalyzing(true);
    
    try {
      const result = await voidScreener.getTokenWithRiskFactors(address);
      
      if (!result) {
        throw new Error("Token not found or no trading pairs available");
      }
      
      const { token, pairCreatedAt } = result;
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
      
      const dexId = bestPair.dexId || "unknown";
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
        pairAddress: bestPair.pairAddress || "",
        dexId,
      });
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
      const tokenData = await voidScreener.getTokenAnalytics(watchlistInput);
      
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
      const result = await voidScreener.getTokenWithRiskFactors(tokenAddress);
      
      if (!result) {
        throw new Error("Token not found or no trading pairs available");
      }
      
      const { token, pairCreatedAt } = result;
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
      const dexId = bestPair.dexId || "unknown";
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
        pairAddress: bestPair.pairAddress || "",
        dexId,
      };
      
      setAnalysis(tokenAnalysis);
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
          <div className="bg-primary/10 border-2 border-primary/50 rounded-lg p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-3 items-start">
              <Wallet className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-primary block mb-1">PREVIEW MODE</strong>
                <span className="text-white/80">You're viewing Guard in preview mode. Connect your Phantom wallet to save watchlists and set alerts.</span>
              </div>
            </div>
            <Button className="bg-primary text-black hover:bg-primary/90 shrink-0" data-testid="button-connect-preview-guard">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
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
              </>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Risk Monitoring
                </CardTitle>
                <CardDescription>
                  Real-time alerts for tokens in your watchlist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">Large Holder Activity Detected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Top holder of SAMPLE moved 15% of supply to exchange wallet
                      </p>
                      <p className="text-xs text-yellow-500 mt-2">2 minutes ago</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">Liquidity Removal Warning</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        30% of liquidity removed from TOKEN/SOL pool
                      </p>
                      <p className="text-xs text-red-500 mt-2">15 minutes ago</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">Liquidity Lock Renewed</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PLOGIC liquidity lock extended for another 6 months
                      </p>
                      <p className="text-xs text-green-500 mt-2">1 hour ago</p>
                    </div>
                  </div>
                </div>
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
      </div>
    </div>
  );
}
