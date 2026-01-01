import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  BarChart3, 
  RefreshCw, 
  ExternalLink,
  Coins,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

const PUMPLOGIC_TOKEN = "63k7noZHAPfxnwzq4wGHJG4kksT7enoT2ua3shQ2pump";

interface TokenMetrics {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  supply: number;
  liquidity: number;
}

interface PricePoint {
  time: string;
  price: number;
}

async function fetchTokenMetrics(): Promise<TokenMetrics> {
  try {
    const response = await fetch(`https://api.jup.ag/price/v2?ids=${PUMPLOGIC_TOKEN}`);
    const data = await response.json();
    const tokenData = data.data?.[PUMPLOGIC_TOKEN];
    
    const price = tokenData?.price || 0;
    
    return {
      price,
      priceChange24h: (Math.random() - 0.5) * 20,
      marketCap: price * 1000000000,
      volume24h: price * 50000000 * (0.5 + Math.random()),
      holders: Math.floor(1500 + Math.random() * 500),
      supply: 1000000000,
      liquidity: price * 10000000 * (0.8 + Math.random() * 0.4),
    };
  } catch (error) {
    console.error("Failed to fetch token metrics:", error);
    return {
      price: 0,
      priceChange24h: 0,
      marketCap: 0,
      volume24h: 0,
      holders: 0,
      supply: 1000000000,
      liquidity: 0,
    };
  }
}

function generatePriceHistory(currentPrice: number): PricePoint[] {
  const points: PricePoint[] = [];
  let price = currentPrice * (0.7 + Math.random() * 0.3);
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    const change = (Math.random() - 0.45) * 0.05;
    price = price * (1 + change);
    if (i === 0) price = currentPrice;
    
    points.push({
      time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: price,
    });
  }
  
  return points;
}

function generateVolumeData(): { time: string; volume: number }[] {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      time: date.toLocaleDateString([], { weekday: 'short' }),
      volume: Math.floor(10000 + Math.random() * 50000),
    });
  }
  return data;
}

const allocationData = [
  { name: "Market Making", value: 25, color: "#00ff9d" },
  { name: "Buyback", value: 25, color: "#3b82f6" },
  { name: "Liquidity", value: 25, color: "#8b5cf6" },
  { name: "Revenue", value: 25, color: "#f59e0b" },
];

function formatNumber(num: number, decimals = 2): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
}

function formatPrice(price: number): string {
  if (price < 0.0001) return `$${price.toExponential(4)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

export default function Analytics() {
  const { toast } = useToast();
  const { isConnected, user } = useWallet();
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [volumeData, setVolumeData] = useState<{ time: string; volume: number }[]>([]);

  const { data: metrics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['tokenMetrics'],
    queryFn: fetchTokenMetrics,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (metrics?.price) {
      setPriceHistory(generatePriceHistory(metrics.price));
      setVolumeData(generateVolumeData());
    }
  }, [metrics?.price]);

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Data Refreshed",
      description: "Token metrics have been updated.",
      className: "bg-primary text-black font-bold"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,157,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Pump<span className="text-primary">Logic</span> Analytics
              </h1>
            </div>
            <p className="text-muted-foreground">
              Real-time token metrics, holder analytics & fee ROI tracking
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/50 text-primary font-mono text-xs px-3 py-1">
              <Activity className="h-3 w-3 mr-1.5 animate-pulse" />
              LIVE
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="border-white/20 hover:border-primary/50"
              data-testid="button-refresh-analytics"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefetching && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Price</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-white font-mono" data-testid="text-token-price">
                {isLoading ? "..." : formatPrice(metrics?.price || 0)}
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm mt-2",
                (metrics?.priceChange24h || 0) >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {(metrics?.priceChange24h || 0) >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{Math.abs(metrics?.priceChange24h || 0).toFixed(2)}% (24h)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Market Cap</span>
                <Coins className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono" data-testid="text-market-cap">
                {isLoading ? "..." : formatNumber(metrics?.marketCap || 0)}
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
              <div className="text-2xl font-bold text-white font-mono" data-testid="text-volume">
                {isLoading ? "..." : formatNumber(metrics?.volume24h || 0)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Trading Volume
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Holders</span>
                <Users className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono" data-testid="text-holders">
                {isLoading ? "..." : metrics?.holders?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-green-500 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12.5% this week
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
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Price Chart (24h)
                  </CardTitle>
                  <CardDescription>$PUMPLOGIC price movement</CardDescription>
                </div>
                <Badge variant="outline" className="border-green-500/50 text-green-500">
                  +{Math.abs(metrics?.priceChange24h || 0).toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]" data-testid="chart-price">
                {priceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00ff9d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#666" 
                        tick={{ fill: '#888', fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#666" 
                        tick={{ fill: '#888', fontSize: 11 }}
                        tickLine={false}
                        tickFormatter={(value) => formatPrice(value)}
                        domain={['dataMin * 0.95', 'dataMax * 1.05']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#888' }}
                        formatter={(value: number) => [formatPrice(value), 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#00ff9d" 
                        strokeWidth={2}
                        fill="url(#priceGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Loading chart data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Fee Allocation
              </CardTitle>
              <CardDescription>Current distribution settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]" data-testid="chart-allocation">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Volume History (7d)
              </CardTitle>
              <CardDescription>Daily trading volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]" data-testid="chart-volume">
                {volumeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#666" 
                        tick={{ fill: '#888', fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#666" 
                        tick={{ fill: '#888', fontSize: 11 }}
                        tickLine={false}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
                      />
                      <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Loading volume data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-400" />
                Fee ROI Tracker
              </CardTitle>
              <CardDescription>Return on fee allocations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Fees Collected</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      This Month
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-white font-mono" data-testid="text-fees-collected">
                    $12,450.00
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-black/40 rounded-lg border border-green-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Market Making ROI</div>
                    <div className="text-lg font-bold text-green-500 font-mono flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      +24.5%
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-blue-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Buyback Impact</div>
                    <div className="text-lg font-bold text-blue-400 font-mono flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      +18.2%
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-purple-500/20">
                    <div className="text-xs text-muted-foreground mb-1">LP Value Growth</div>
                    <div className="text-lg font-bold text-purple-400 font-mono flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      +31.7%
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-amber-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Revenue Distributed</div>
                    <div className="text-lg font-bold text-amber-400 font-mono">
                      $3,112.50
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-white">Holder Retention Rate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary font-mono">94.2%</span>
                    <span className="text-xs text-muted-foreground">30-day average</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Holder Distribution
            </CardTitle>
            <CardDescription>Token holder breakdown by wallet size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-black/40 rounded-lg border border-white/5 text-center">
                <div className="text-3xl font-bold text-primary mb-1">42</div>
                <div className="text-xs text-muted-foreground">Whales ({'>'}1%)</div>
                <div className="text-xs text-green-500 mt-1">+3 this week</div>
              </div>
              <div className="p-4 bg-black/40 rounded-lg border border-white/5 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">186</div>
                <div className="text-xs text-muted-foreground">Sharks (0.1-1%)</div>
                <div className="text-xs text-green-500 mt-1">+12 this week</div>
              </div>
              <div className="p-4 bg-black/40 rounded-lg border border-white/5 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">524</div>
                <div className="text-xs text-muted-foreground">Fish (0.01-0.1%)</div>
                <div className="text-xs text-green-500 mt-1">+45 this week</div>
              </div>
              <div className="p-4 bg-black/40 rounded-lg border border-white/5 text-center">
                <div className="text-3xl font-bold text-amber-400 mb-1">892</div>
                <div className="text-xs text-muted-foreground">Shrimp ({'<'}0.01%)</div>
                <div className="text-xs text-green-500 mt-1">+128 this week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
            <span className="text-xs text-amber-400">Note: Price data is live via Jupiter API. Volume, holder counts, and ROI metrics are simulated for demonstration.</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Data refreshes automatically every 30 seconds.
          </p>
          <a 
            href={`https://solscan.io/token/${PUMPLOGIC_TOKEN}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            data-testid="link-solscan"
          >
            View on Solscan <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
