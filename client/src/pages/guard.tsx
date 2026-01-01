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
  Coins
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";

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

export default function Guard() {
  const { isConnected, user } = useWallet();
  const [tokenAddress, setTokenAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);

  const analyzeToken = async () => {
    if (!tokenAddress) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis with mock data for now
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis result
    const mockAnalysis: TokenAnalysis = {
      address: tokenAddress,
      name: "Sample Token",
      symbol: "SAMPLE",
      riskScore: 35,
      riskLevel: "medium",
      factors: [
        { name: "Liquidity Lock", status: "safe", description: "Liquidity is locked for 6 months", weight: 20 },
        { name: "Top 10 Holders", status: "warning", description: "Top 10 holders own 45% of supply", weight: 15 },
        { name: "Mint Authority", status: "safe", description: "Mint authority is disabled", weight: 25 },
        { name: "Freeze Authority", status: "safe", description: "Freeze authority is disabled", weight: 20 },
        { name: "Contract Verified", status: "safe", description: "Contract source code is verified", weight: 10 },
        { name: "Honeypot Check", status: "safe", description: "No honeypot patterns detected", weight: 10 },
      ],
      liquidityLocked: true,
      topHoldersPercent: 45,
      mintDisabled: true,
      freezeDisabled: true,
      lpBurned: false,
      createdAt: new Date().toISOString(),
    };
    
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center">
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Connect your Phantom wallet to access PumpLogic Guard security features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground pb-20">
      <div className="container mx-auto px-4 pt-8">
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

        <Tabs defaultValue="scanner" className="space-y-6">
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
                      {analysis.liquidityLocked ? (
                        <Lock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      ) : (
                        <Unlock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      )}
                      <p className="text-sm font-medium text-white">Liquidity</p>
                      <p className={cn("text-xs", analysis.liquidityLocked ? "text-green-500" : "text-red-500")}>
                        {analysis.liquidityLocked ? "Locked" : "Unlocked"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Top 10 Holders</p>
                      <p className="text-xs text-yellow-500">{analysis.topHoldersPercent}%</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      {analysis.mintDisabled ? (
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      )}
                      <p className="text-sm font-medium text-white">Mint Authority</p>
                      <p className={cn("text-xs", analysis.mintDisabled ? "text-green-500" : "text-red-500")}>
                        {analysis.mintDisabled ? "Disabled" : "Enabled"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4 text-center">
                      {analysis.freezeDisabled ? (
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      )}
                      <p className="text-sm font-medium text-white">Freeze Authority</p>
                      <p className={cn("text-xs", analysis.freezeDisabled ? "text-green-500" : "text-red-500")}>
                        {analysis.freezeDisabled ? "Disabled" : "Enabled"}
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
                    className="bg-black/40 border-white/20 font-mono text-sm"
                    data-testid="input-watchlist"
                  />
                  <Button className="bg-primary text-black hover:bg-primary/90 shrink-0" data-testid="button-add-watchlist">
                    Add
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center py-8">
                  No tokens in watchlist. Add tokens above to monitor them.
                </p>
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
