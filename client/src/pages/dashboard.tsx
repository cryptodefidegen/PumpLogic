import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, Activity, Zap, Play, Pause, Save, RotateCw, Copy, Check, Info, AlertTriangle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllocation, saveAllocation, getTransactions, getAutomationConfig, updateAutomationConfig, runOptimizer } from "@/lib/api";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isConnected, connect } = useWallet();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [allocations, setAllocations] = useState({
    marketMaking: 25,
    buyback: 25,
    liquidity: 25,
    revenue: 25
  });
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch allocation data
  const { data: allocationData } = useQuery({
    queryKey: ['allocation', user?.id],
    queryFn: () => getAllocation(user!.id),
    enabled: !!user,
  });

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => getTransactions(user!.id, 10),
    enabled: !!user,
  });

  // Fetch automation config
  const { data: automationData } = useQuery({
    queryKey: ['automation', user?.id],
    queryFn: () => getAutomationConfig(user!.id),
    enabled: !!user,
  });

  // Update local state when allocation data loads
  useEffect(() => {
    if (allocationData) {
      setAllocations({
        marketMaking: allocationData.marketMaking ?? 25,
        buyback: allocationData.buyback ?? 25,
        liquidity: allocationData.liquidity ?? 25,
        revenue: allocationData.revenue ?? 25,
      });
    }
  }, [allocationData]);

  // Save allocation mutation
  const saveMutation = useMutation({
    mutationFn: () => saveAllocation(user!.id, allocations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocation', user?.id] });
      toast({
        title: "Allocations Saved",
        description: "Your fee routing strategy has been updated.",
        className: "bg-primary text-black font-bold"
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to save allocations",
      });
    },
  });

  // Automation mutation
  const automationMutation = useMutation({
    mutationFn: (isActive: boolean) => updateAutomationConfig(user!.id, {
      isActive,
      rsi: automationData?.rsi || null,
      volatility: automationData?.volatility || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', user?.id] });
    },
  });

  // Optimizer mutation
  const optimizerMutation = useMutation({
    mutationFn: () => runOptimizer(user!.id),
    onSuccess: (data) => {
      setAllocations({
        marketMaking: data.marketMaking ?? 25,
        buyback: data.buyback ?? 25,
        liquidity: data.liquidity ?? 25,
        revenue: data.revenue ?? 25,
      });
      queryClient.invalidateQueries({ queryKey: ['allocation', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: "Analysis Complete",
        description: "AI has optimized allocations based on current market volatility.",
        className: "bg-black border-primary text-white"
      });
    },
  });

  const total = Object.values(allocations).reduce((a, b) => a + b, 0);
  const isValid = total === 100;

  const handleSliderChange = (key: keyof typeof allocations, value: number[]) => {
    setAllocations(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleSave = () => {
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Allocation",
        description: "Allocations must sum to exactly 100%."
      });
      return;
    }
    saveMutation.mutate();
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setTimeout(() => {
      optimizerMutation.mutate();
      setAnalyzing(false);
    }, 2000);
  };

  const handleAutomationToggle = (checked: boolean) => {
    automationMutation.mutate(checked);
  };

  // Redirect if not connected
  if (!isConnected || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card border-white/5 max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-white text-center">Connect Your Wallet</CardTitle>
            <CardDescription className="text-center">You need to connect your wallet to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={connect} className="bg-primary text-black hover:bg-primary/90" data-testid="button-connect-dashboard">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto px-4 pt-8">
        
        {/* Connection Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200/80">
            <strong className="text-yellow-500 block mb-1">IMPORTANT SECURITY NOTICE</strong>
            Your private key is processed locally to sign transactions but is <span className="text-white font-bold">NEVER STORED</span>. Keys are wiped on disconnect. Only use a dedicated fee wallet. DYOR.
          </div>
        </div>

        {/* Top Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
            <p className="text-muted-foreground">Manage your programmable liquidity engine</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full text-xs font-mono border bg-green-500/10 text-green-500 border-green-500/20">
              CONNECTED
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Controls - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Allocations Card */}
            <Card className="bg-card border-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-white">Fee Allocation</CardTitle>
                  <CardDescription>Configure how your fees are routed</CardDescription>
                </div>
                <div className={cn("text-2xl font-mono font-bold", isValid ? "text-primary" : "text-destructive")}>
                  {total}%
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <AllocationItem 
                  label="Market Making" 
                  value={allocations.marketMaking} 
                  color="bg-primary"
                  onChange={(v) => handleSliderChange('marketMaking', v)} 
                />
                <AllocationItem 
                  label="Buyback & Burn" 
                  value={allocations.buyback} 
                  color="bg-secondary"
                  onChange={(v) => handleSliderChange('buyback', v)} 
                />
                <AllocationItem 
                  label="Liquidity Pool" 
                  value={allocations.liquidity} 
                  color="bg-blue-500"
                  onChange={(v) => handleSliderChange('liquidity', v)} 
                />
                <AllocationItem 
                  label="Creator Revenue" 
                  value={allocations.revenue} 
                  color="bg-yellow-500"
                  onChange={(v) => handleSliderChange('revenue', v)} 
                />

                <Separator className="bg-white/5" />

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Must total exactly 100%
                  </div>
                  <Button onClick={handleSave} disabled={!isValid || saveMutation.isPending} className="bg-white text-black hover:bg-white/90" data-testid="button-save-allocations">
                    <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save Allocations"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Optimizer */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-white">Smart Optimizer</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-primary/50 text-primary">AI POWERED</Badge>
                </div>
                <CardDescription>AI analyzes market conditions and optimizes your allocations automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-black/40 rounded-lg p-3 font-mono text-xs text-primary/80 h-24 overflow-hidden relative">
                    {analyzing ? (
                      <div className="flex flex-col gap-1 animate-pulse">
                        <div>&gt; Analyzing order book depth...</div>
                        <div>&gt; Checking volatility index...</div>
                        <div>&gt; Calculating optimal buyback pressure...</div>
                        <div>&gt; optimizing...</div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="text-muted-foreground">&gt; System ready.</div>
                        <div className="text-muted-foreground">&gt; Last analysis: 2 hours ago</div>
                        <div className="text-green-500/50">&gt; Waiting for command...</div>
                      </div>
                    )}
                  </div>
                  <Button 
                    size="lg" 
                    onClick={runAnalysis} 
                    disabled={analyzing || optimizerMutation.isPending}
                    className="h-24 w-32 bg-primary/10 border border-primary/50 hover:bg-primary/20 text-primary flex-col gap-2"
                    data-testid="button-run-optimizer"
                  >
                    {analyzing ? <RotateCw className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6" />}
                    {analyzing ? "Running" : "Run AI"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manual Distribution */}
            <Card className="bg-card border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Manual Distribution</CardTitle>
                <CardDescription>Distribute fees manually from your wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Input placeholder="0.0" className="bg-black/40 border-white/10 text-lg font-mono pl-4 pr-12 h-12" data-testid="input-distribution-amount" />
                    <div className="absolute right-4 top-3 text-muted-foreground font-mono text-sm">SOL</div>
                  </div>
                  <Button className="h-12 px-6 bg-secondary text-white hover:bg-secondary/90 font-bold" data-testid="button-distribute">
                    Distribute Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            
            {/* Automation Status */}
            <Card className="bg-card border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-widest">Automation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("text-2xl font-bold flex items-center gap-2", automationData?.isActive ? "text-green-500" : "text-muted-foreground")}>
                    {automationData?.isActive ? "ACTIVE" : "INACTIVE"}
                    <span className={cn("relative flex h-3 w-3 ml-2")}>
                      {automationData?.isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>}
                      <span className={cn("relative inline-flex rounded-full h-3 w-3", automationData?.isActive ? "bg-green-500" : "bg-zinc-700")}></span>
                    </span>
                  </div>
                  <Switch 
                    checked={automationData?.isActive || false} 
                    onCheckedChange={handleAutomationToggle}
                    disabled={automationMutation.isPending}
                    data-testid="switch-automation"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <StatBox label="RSI (14)" value={automationData?.rsi || "42.5"} />
                  <StatBox label="Volatility" value={automationData?.volatility || "High"} />
                </div>
              </CardContent>
            </Card>

            {/* Wallet Stats */}
            <Card className="bg-card border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-widest">Wallet Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatRow label="Wallet" value={user.walletAddress.substring(0, 16) + "..."} />
                <StatRow label="User ID" value={user.id.substring(0, 8) + "..."} />
                <StatRow label="Transactions" value={transactions.length.toString()} />
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Activity Log */}
        <div className="mt-8">
          <h3 className="text-lg font-bold font-display text-white mb-4">Activity Log</h3>
          <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
             <div className="p-4 border-b border-white/5 text-xs text-muted-foreground grid grid-cols-12 gap-4 uppercase tracking-widest font-mono">
                <div className="col-span-2">Time</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-6">Details</div>
                <div className="col-span-2 text-right">Amount</div>
             </div>
             <div className="divide-y divide-white/5">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No transactions yet. Start by adjusting your allocations or running the AI optimizer.
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <LogItem 
                      key={tx.id}
                      time={new Date(tx.createdAt).toLocaleString()}
                      type={tx.type}
                      detail={tx.detail}
                      amount={tx.amount}
                    />
                  ))
                )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function AllocationItem({ label, value, color, onChange }: { label: string, value: number, color: string, onChange: (v: number[]) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-white font-medium">{label}</span>
        <span className="font-mono text-muted-foreground">{value}%</span>
      </div>
      <Slider 
        defaultValue={[value]} 
        value={[value]}
        max={100} 
        step={1} 
        onValueChange={onChange}
        className={cn("[&>.relative>.absolute]:bg-primary", color.replace('bg-', '[&>.relative>.absolute]:bg-'))}
      />
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-black/20 rounded p-3 text-center border border-white/5">
      <div className="text-xs text-muted-foreground uppercase mb-1">{label}</div>
      <div className="text-lg font-mono font-bold text-white">{value}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono font-bold text-white text-xs">{value}</span>
    </div>
  );
}

function LogItem({ time, type, detail, amount }: { time: string, type: string, detail: string, amount: string }) {
  const getColor = (t: string) => {
    switch(t) {
      case 'OPTIMIZE': return 'text-primary';
      case 'DISTRIBUTE': return 'text-secondary';
      case 'BUYBACK': return 'text-blue-400';
      case 'DEPOSIT': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-4 grid grid-cols-12 gap-4 text-sm hover:bg-white/5 transition-colors">
      <div className="col-span-2 text-muted-foreground font-mono text-xs">{time}</div>
      <div className={cn("col-span-2 font-bold text-xs uppercase", getColor(type))}>{type}</div>
      <div className="col-span-6 text-white">{detail}</div>
      <div className="col-span-2 text-right font-mono text-white">{amount}</div>
    </div>
  );
}
