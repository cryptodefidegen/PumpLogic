import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Rocket, ArrowRightLeft, PieChart, ToggleLeft, Settings, ScrollText, Shield, RefreshCcw, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";

const ADMIN_WALLET = "9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8";

interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalDeployments: number;
  totalAllocations: number;
  recentDeployments: any[];
}

interface FeatureToggle {
  id: string;
  featureKey: string;
  featureName: string;
  description: string | null;
  isEnabled: boolean;
  updatedBy: string | null;
  updatedAt: string;
}

interface User {
  id: string;
  walletAddress: string;
  createdAt: string;
}

interface Deployment {
  id: string;
  walletAddress: string;
  mintAddress: string;
  signature: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDescription: string | null;
  imageUri: string | null;
  initialBuy: string | null;
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  detail: string;
  amount: string;
  signature: string | null;
  createdAt: string;
}

interface Allocation {
  id: string;
  userId: string;
  marketMaking: number;
  buyback: number;
  liquidity: number;
  revenue: number;
  updatedAt: string;
}

interface AdminLog {
  id: string;
  adminAddress: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  createdAt: string;
}

export default function Admin() {
  const { walletAddress } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const isAdmin = walletAddress === ADMIN_WALLET;

  const apiHeaders = {
    "Content-Type": "application/json",
    "x-wallet-address": walletAddress || "",
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchFeatures = async () => {
    try {
      const res = await fetch("/api/admin/features", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setFeatures(data);
      }
    } catch (error) {
      console.error("Failed to fetch features:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchDeployments = async () => {
    try {
      const res = await fetch("/api/admin/deployments", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setDeployments(data);
      }
    } catch (error) {
      console.error("Failed to fetch deployments:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/admin/transactions?limit=100", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const fetchAllocations = async () => {
    try {
      const res = await fetch("/api/admin/allocations", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setAllocations(data);
      }
    } catch (error) {
      console.error("Failed to fetch allocations:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs?limit=50", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const initializeFeatures = async () => {
    try {
      const res = await fetch("/api/admin/features/init", {
        method: "POST",
        headers: apiHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setFeatures(data);
        toast({
          title: "Features Initialized",
          description: `${data.length} feature toggles are now available`,
        });
      }
    } catch (error) {
      console.error("Failed to initialize features:", error);
    }
  };

  const toggleFeature = async (featureKey: string, isEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/features/${featureKey}`, {
        method: "PATCH",
        headers: apiHeaders,
        body: JSON.stringify({ isEnabled }),
      });
      if (res.ok) {
        setFeatures(prev =>
          prev.map(f =>
            f.featureKey === featureKey ? { ...f, isEnabled } : f
          )
        );
        toast({
          title: "Feature Updated",
          description: `${featureKey} has been ${isEnabled ? "enabled" : "disabled"}`,
        });
        fetchLogs();
      }
    } catch (error) {
      console.error("Failed to toggle feature:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update feature toggle",
      });
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchFeatures(),
      fetchUsers(),
      fetchDeployments(),
      fetchTransactions(),
      fetchAllocations(),
      fetchLogs(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [walletAddress]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Address copied to clipboard" });
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/60 border-red-500/30">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-500">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin panel.
              {walletAddress && (
                <span className="block mt-2 text-xs font-mono text-muted-foreground">
                  Connected: {truncateAddress(walletAddress)}
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage platform features, users, and monitor activity
              </p>
            </div>
            <Button
              variant="outline"
              onClick={loadAllData}
              className="border-primary/50 text-primary hover:bg-primary/10"
              data-testid="button-refresh-admin"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Features
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Users
            </TabsTrigger>
            <TabsTrigger value="deployments" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Deployments
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="allocations" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Allocations
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary" data-testid="text-total-users">
                    {stats?.totalUsers || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Total Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-400" data-testid="text-total-transactions">
                    {stats?.totalTransactions || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    Total Deployments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-400" data-testid="text-total-deployments">
                    {stats?.totalDeployments || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Active Allocations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-400" data-testid="text-total-allocations">
                    {stats?.totalAllocations || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Recent Deployments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentDeployments?.length ? (
                  <div className="space-y-3">
                    {stats.recentDeployments.slice(0, 5).map((dep: any) => (
                      <div key={dep.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          {dep.imageUri && (
                            <img src={dep.imageUri} alt={dep.tokenName} className="h-10 w-10 rounded-full object-cover" />
                          )}
                          <div>
                            <p className="font-medium text-white">{dep.tokenName}</p>
                            <p className="text-sm text-muted-foreground">${dep.tokenSymbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-mono">{truncateAddress(dep.mintAddress)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(dep.createdAt), "MMM d, HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No deployments yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ToggleLeft className="h-5 w-5 text-primary" />
                      Feature Toggles
                    </CardTitle>
                    <CardDescription>Enable or disable platform features</CardDescription>
                  </div>
                  {features.length === 0 && (
                    <Button onClick={initializeFeatures} className="bg-primary text-black hover:bg-primary/90" data-testid="button-init-features">
                      Initialize Features
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {features.length > 0 ? (
                  <div className="space-y-4">
                    {features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{feature.featureName}</p>
                            <Badge
                              variant={feature.isEnabled ? "default" : "secondary"}
                              className={feature.isEnabled ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"}
                            >
                              {feature.isEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                          {feature.updatedBy && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Last updated: {format(new Date(feature.updatedAt), "MMM d, yyyy HH:mm")}
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={feature.isEnabled}
                          onCheckedChange={(checked) => toggleFeature(feature.featureKey, checked)}
                          data-testid={`switch-feature-${feature.featureKey}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No feature toggles configured. Click "Initialize Features" to set up defaults.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Registered Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Wallet Address</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-white">{truncateAddress(user.walletAddress)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(user.createdAt), "MMM d, yyyy")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(user.walletAddress)}
                                className="h-8 w-8 p-0"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <a
                                href={`https://solscan.io/account/${user.walletAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 w-8 flex items-center justify-center hover:text-primary"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployments" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Token Deployments ({deployments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deployments.length > 0 ? (
                    deployments.map((dep) => (
                      <div key={dep.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {dep.imageUri && (
                              <img src={dep.imageUri} alt={dep.tokenName} className="h-12 w-12 rounded-full object-cover" />
                            )}
                            <div>
                              <p className="font-medium text-white">{dep.tokenName}</p>
                              <p className="text-sm text-primary">${dep.tokenSymbol}</p>
                              {dep.tokenDescription && (
                                <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">{dep.tokenDescription}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(dep.createdAt), "MMM d, yyyy HH:mm")}
                            </p>
                            {dep.initialBuy && (
                              <Badge className="bg-blue-500/20 text-blue-400">{dep.initialBuy} SOL</Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Mint: </span>
                            <span className="font-mono text-white">{truncateAddress(dep.mintAddress)}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1" onClick={() => copyToClipboard(dep.mintAddress)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Deployer: </span>
                            <span className="font-mono text-white">{truncateAddress(dep.walletAddress)}</span>
                          </div>
                          <a
                            href={`https://solscan.io/tx/${dep.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 ml-auto"
                          >
                            View TX <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No deployments recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Recent Transactions ({transactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Detail</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">TX</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <Badge className="bg-primary/20 text-primary">{tx.type}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-white max-w-xs truncate block">{tx.detail}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono text-white">{tx.amount}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(tx.createdAt), "MMM d, HH:mm")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {tx.signature ? (
                              <a
                                href={`https://solscan.io/tx/${tx.signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocations" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  User Allocations ({allocations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User ID</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Market Making</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Buyback</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Liquidity</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.map((alloc) => (
                        <tr key={alloc.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs text-white">{alloc.userId.slice(0, 12)}...</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className="bg-blue-500/20 text-blue-400">{alloc.marketMaking}%</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className="bg-purple-500/20 text-purple-400">{alloc.buyback}%</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className="bg-cyan-500/20 text-cyan-400">{alloc.liquidity}%</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className="bg-primary/20 text-primary">{alloc.revenue}%</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(alloc.updatedAt), "MMM d, HH:mm")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-primary" />
                  Admin Activity Logs ({logs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length > 0 ? (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/20 text-primary">{log.action}</Badge>
                            {log.targetType && (
                              <span className="text-xs text-muted-foreground">on {log.targetType}</span>
                            )}
                          </div>
                          {log.details && (
                            <p className="text-sm text-white mt-1">{log.details}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No admin activity logs yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
