import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Activity, 
  BarChart3, 
  RefreshCw, 
  ExternalLink,
  Coins,
  PieChart,
  Wallet,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  ShoppingCart,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics, type AnalyticsData } from "@/lib/api";
import { Link } from "wouter";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

function formatNumber(num: number, decimals = 2): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
}

function formatPrice(price: number): string {
  if (price === 0) return "$0.00";
  if (price < 0.00001) return `$${price.toFixed(9)}`;
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

function formatSol(amount: number): string {
  if (amount === 0) return "0 SOL";
  if (amount < 0.001) return `${amount.toFixed(6)} SOL`;
  return `${amount.toFixed(4)} SOL`;
}

const ALLOCATION_COLORS = {
  marketMaking: "#00ff9d",
  buyback: "#3b82f6",
  liquidity: "#8b5cf6",
  revenue: "#f59e0b",
};

interface PreviewBreakdown {
  marketMaking: number;
  buyback: number;
  liquidity: number;
  revenue: number;
}

export default function Analytics() {
  const { toast } = useToast();
  const { isConnected, user } = useWallet();
  const [selectedToken, setSelectedToken] = useState<string | undefined>(undefined);
  const [previewAmount, setPreviewAmount] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewBreakdown, setPreviewBreakdown] = useState<PreviewBreakdown | null>(null);

  const { data: analytics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['analytics', user?.id, selectedToken],
    queryFn: () => getAnalytics(user!.id, selectedToken),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Data Refreshed",
      description: "Analytics have been updated.",
      className: "bg-primary text-black font-bold"
    });
  };

  const showDistributionPreview = () => {
    const amount = parseFloat(previewAmount);
    if (!amount || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to preview."
      });
      return;
    }
    
    const allocation = analytics?.allocation || { marketMaking: 25, buyback: 25, liquidity: 25, revenue: 25 };
    setPreviewBreakdown({
      marketMaking: (allocation.marketMaking / 100) * amount,
      buyback: (allocation.buyback / 100) * amount,
      liquidity: (allocation.liquidity / 100) * amount,
      revenue: (allocation.revenue / 100) * amount,
    });
    setShowPreview(true);
  };

  const allocationData = analytics ? [
    { name: "Market Making", value: analytics.allocation.marketMaking, color: ALLOCATION_COLORS.marketMaking },
    { name: "Buyback", value: analytics.allocation.buyback, color: ALLOCATION_COLORS.buyback },
    { name: "Liquidity", value: analytics.allocation.liquidity, color: ALLOCATION_COLORS.liquidity },
    { name: "Revenue", value: analytics.allocation.revenue, color: ALLOCATION_COLORS.revenue },
  ] : [
    { name: "Market Making", value: 25, color: ALLOCATION_COLORS.marketMaking },
    { name: "Buyback", value: 25, color: ALLOCATION_COLORS.buyback },
    { name: "Liquidity", value: 25, color: ALLOCATION_COLORS.liquidity },
    { name: "Revenue", value: 25, color: ALLOCATION_COLORS.revenue },
  ];

  const isPreviewMode = !isConnected;

  return (
    <div className="min-h-screen text-foreground pb-20">
      {isPreviewMode && (
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/30 text-primary border-primary/50 text-xs">PREVIEW MODE</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You're viewing the analytics in preview mode. Connect your Phantom wallet to see your personalized data.
                  </p>
                </div>
              </div>
              <Button className="bg-primary text-black hover:bg-primary/90" data-testid="button-connect-preview">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Pump<span className="text-primary">Logic</span> Analytics
              </h1>
            </div>
            <p className="text-muted-foreground">
              Real-time token metrics & fee tracking for your configured tokens
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {analytics?.availableTokens && analytics.availableTokens.length > 0 && (
              <Select value={selectedToken || "default"} onValueChange={(v) => setSelectedToken(v === "default" ? undefined : v)}>
                <SelectTrigger className="w-[200px] bg-black/40 border-white/20" data-testid="select-token">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">$PLOGIC (Default)</SelectItem>
                  {analytics.availableTokens.map((token) => (
                    <SelectItem key={token.id} value={token.address}>
                      {token.symbol} {token.isActive && "✓"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Badge variant="outline" className="border-primary/50 text-primary font-mono text-xs px-3 py-1">
              <Activity className="h-3 w-3 mr-1.5 animate-pulse" />
              LIVE
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching || isLoading}
              className="border-white/20 hover:border-primary/50"
              data-testid="button-refresh-analytics"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", (isRefetching || isLoading) && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {analytics?.token && (
          <div className="mb-6 p-4 bg-black/40 rounded-lg border border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Coins className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-bold text-white">{analytics.token.name}</h2>
                  <p className="text-sm text-muted-foreground font-mono">{analytics.token.symbol}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href={`https://dexscreener.com/solana/${analytics.token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  data-testid="link-dexscreener"
                >
                  DexScreener <ExternalLink className="h-3 w-3" />
                </a>
                <a 
                  href={`https://solscan.io/token/${analytics.token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Solscan <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Token Price</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-white font-mono" data-testid="text-token-price">
                {isLoading ? "..." : formatPrice(analytics?.token.price || 0)}
              </div>
              {analytics?.token.priceChange24h !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 text-sm mt-2",
                  analytics.token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {analytics.token.priceChange24h >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span>{Math.abs(analytics.token.priceChange24h).toFixed(2)}% (24h)</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Market Cap</span>
                <Coins className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono" data-testid="text-market-cap">
                {isLoading ? "..." : formatNumber(analytics?.token.marketCap || 0)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Fully Diluted
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">24h Volume</span>
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono" data-testid="text-volume-24h">
                {isLoading ? "..." : formatNumber(analytics?.token.volume24h || 0)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Trading Volume
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Liquidity</span>
                <Droplets className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono" data-testid="text-liquidity">
                {isLoading ? "..." : (analytics?.token.liquidity || 0) > 0 ? formatNumber(analytics?.token.liquidity || 0) : "Bonding Curve"}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {(analytics?.token.liquidity || 0) > 0 ? "Pool Liquidity" : "On Pump.fun"}
              </div>
            </CardContent>
          </Card>
        </div>

        {analytics?.token && (
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {analytics.token.symbol} Price Chart
                  </CardTitle>
                  <CardDescription>Live price chart powered by DexScreener</CardDescription>
                </div>
                <a 
                  href={`https://dexscreener.com/solana/${analytics.token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Open Full Chart <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-lg overflow-hidden border border-white/10" data-testid="chart-token-price">
                <iframe
                  src={`https://dexscreener.com/solana/${analytics.token.address}?embed=1&theme=dark&trades=0&info=0`}
                  className="w-full h-full border-0"
                  title={`${analytics.token.symbol} Price Chart`}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">24h Transactions</span>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-lg font-bold text-green-500 font-mono" data-testid="text-buys">
                    {analytics?.token.txns24h?.buys || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Buys</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-lg font-bold text-red-500 font-mono" data-testid="text-sells">
                    {analytics?.token.txns24h?.sells || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Sells</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Your Fees Collected</span>
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-white font-mono" data-testid="text-fees-collected">
                {isLoading ? "..." : formatSol(analytics?.fees.totalCollected || 0)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                From {analytics?.stats.totalTransactions || 0} distributions
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Your Activity</span>
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-lg font-bold text-white font-mono">
                    {analytics?.stats.transactionsLast7Days || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">7 Days</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-lg font-bold text-white font-mono">
                    {analytics?.stats.transactionsLast30Days || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">30 Days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    Distribution Volume (7d)
                  </CardTitle>
                  <CardDescription>Your daily fee distribution volume</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]" data-testid="chart-volume">
                {analytics?.dailyVolume && analytics.dailyVolume.some(d => d.volume > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dailyVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666" 
                        tick={{ fill: '#888', fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#666" 
                        tick={{ fill: '#888', fontSize: 11 }}
                        tickLine={false}
                        tickFormatter={(value) => `${value.toFixed(2)}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(4)} SOL`, 'Volume']}
                      />
                      <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground/50" />
                    <p>No distribution data yet</p>
                    <Link href="/app">
                      <Button variant="link" className="text-primary mt-2">
                        Make your first distribution <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Current Allocation
              </CardTitle>
              <CardDescription>Your fee distribution settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 rounded-lg bg-black/40 border border-white/10">
                <p className="text-xs text-muted-foreground mb-2">Preview Distribution</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter SOL amount"
                    value={previewAmount}
                    onChange={(e) => setPreviewAmount(e.target.value)}
                    className="flex-1 bg-black/40 border-white/20 text-white"
                    data-testid="input-preview-amount"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/50 text-primary hover:bg-primary/10"
                    onClick={showDistributionPreview}
                    data-testid="button-preview"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
              <div className="h-[200px]" data-testid="chart-allocation">
                {allocationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, '']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Loading...
                  </div>
                )}
              </div>
              <div className="space-y-2 mt-4">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-white font-mono">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/40 border-white/10 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Fee Breakdown
            </CardTitle>
            <CardDescription>How your collected fees have been distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-black/40 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Market Making</span>
                </div>
                <div className="text-xl font-bold text-primary font-mono" data-testid="text-mm-fees">
                  {formatSol(analytics?.fees.breakdown.marketMaking || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {analytics?.allocation.marketMaking || 25}% of total
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Buyback</span>
                </div>
                <div className="text-xl font-bold text-blue-400 font-mono" data-testid="text-buyback-fees">
                  {formatSol(analytics?.fees.breakdown.buyback || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {analytics?.allocation.buyback || 25}% of total
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-muted-foreground">Liquidity</span>
                </div>
                <div className="text-xl font-bold text-purple-400 font-mono" data-testid="text-lp-fees">
                  {formatSol(analytics?.fees.breakdown.liquidity || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {analytics?.allocation.liquidity || 25}% of total
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-lg border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-muted-foreground">Revenue</span>
                </div>
                <div className="text-xl font-bold text-amber-400 font-mono" data-testid="text-revenue-fees">
                  {formatSol(analytics?.fees.breakdown.revenue || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {analytics?.allocation.revenue || 25}% of total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {analytics?.fees.totalCollected === 0 && (
          <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Get Started with PumpLogic</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't made any distributions yet. Head to the main app to configure your allocations and start routing your token fees automatically.
                  </p>
                  <Link href="/app">
                    <Button className="bg-primary text-black hover:bg-primary/90" data-testid="button-go-to-app">
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Data refreshes automatically every 30 seconds. Price data provided by Jupiter API.
          </p>
          {analytics?.token && (
            <a 
              href={`https://solscan.io/token/${analytics.token.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              data-testid="link-solscan"
            >
              View on Solscan <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Distribution Preview
            </DialogTitle>
            <DialogDescription>
              Review how {previewAmount} SOL will be distributed across channels.
            </DialogDescription>
          </DialogHeader>
          {previewBreakdown && (
            <div className="py-4 space-y-4">
              <div className="space-y-3">
                {previewBreakdown.marketMaking > 0 && (
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="text-white">Market Making</span>
                    <span className="text-primary font-mono font-bold">{previewBreakdown.marketMaking.toFixed(6)} SOL</span>
                  </div>
                )}
                {previewBreakdown.buyback > 0 && (
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-white">Buyback</span>
                    <span className="text-blue-400 font-mono font-bold">{previewBreakdown.buyback.toFixed(6)} SOL</span>
                  </div>
                )}
                {previewBreakdown.liquidity > 0 && (
                  <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <span className="text-white">Liquidity Pool</span>
                    <span className="text-purple-400 font-mono font-bold">{previewBreakdown.liquidity.toFixed(6)} SOL</span>
                  </div>
                )}
                {previewBreakdown.revenue > 0 && (
                  <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <span className="text-white">Creator Revenue</span>
                    <span className="text-amber-400 font-mono font-bold">{previewBreakdown.revenue.toFixed(6)} SOL</span>
                  </div>
                )}
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total</span>
                <span className="text-white font-mono font-bold text-lg">{previewAmount} SOL</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
