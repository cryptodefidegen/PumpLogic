import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Rocket, ArrowRightLeft, PieChart, ToggleLeft, ScrollText, Shield, RefreshCcw, ExternalLink, Copy, Ban, Award, Megaphone, Star, Gauge, Trash2, Plus } from "lucide-react";
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

interface BlacklistEntry {
  id: string;
  walletAddress: string;
  reason: string;
  status: "banned" | "suspended";
  suspendedUntil: string | null;
  createdBy: string;
  createdAt: string;
}

interface UserBadge {
  id: string;
  walletAddress: string;
  badgeType: "vip" | "verified" | "early_adopter" | "whale";
  grantedBy: string;
  expiresAt: string | null;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isActive: boolean;
  isPinned: boolean;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
}

interface FeaturedToken {
  id: string;
  mintAddress: string;
  tokenName: string;
  tokenSymbol: string;
  imageUri: string | null;
  isVerified: boolean;
  displayOrder: number;
  addedBy: string;
  createdAt: string;
}

interface RateLimit {
  id: string;
  walletAddress: string;
  maxRequestsPerMinute: number;
  maxDeploysPerDay: number;
  maxBurnsPerDay: number;
  updatedBy: string;
  updatedAt: string;
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
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [featuredTokens, setFeaturedTokens] = useState<FeaturedToken[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [blacklistForm, setBlacklistForm] = useState({ walletAddress: "", reason: "", status: "banned" as "banned" | "suspended", suspendedUntil: "" });
  const [badgeForm, setBadgeForm] = useState({ walletAddress: "", badgeType: "vip" as "vip" | "verified" | "early_adopter" | "whale", expiresAt: "" });
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", type: "info" as "info" | "warning" | "success" | "error", isPinned: false, expiresAt: "" });
  const [tokenForm, setTokenForm] = useState({ mintAddress: "", tokenName: "", tokenSymbol: "", imageUri: "", isVerified: false, displayOrder: 0 });
  const [rateLimitForm, setRateLimitForm] = useState({ walletAddress: "", maxRequestsPerMinute: 60, maxDeploysPerDay: 10, maxBurnsPerDay: 10 });

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

  const fetchBlacklist = async () => {
    try {
      const res = await fetch("/api/admin/blacklist", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setBlacklist(data);
      }
    } catch (error) {
      console.error("Failed to fetch blacklist:", error);
    }
  };

  const fetchBadges = async () => {
    try {
      const res = await fetch("/api/admin/badges", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setBadges(data);
      }
    } catch (error) {
      console.error("Failed to fetch badges:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    }
  };

  const fetchFeaturedTokens = async () => {
    try {
      const res = await fetch("/api/admin/featured-tokens", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setFeaturedTokens(data);
      }
    } catch (error) {
      console.error("Failed to fetch featured tokens:", error);
    }
  };

  const fetchRateLimits = async () => {
    try {
      const res = await fetch("/api/admin/rate-limits", { headers: apiHeaders });
      if (res.ok) {
        const data = await res.json();
        setRateLimits(data);
      }
    } catch (error) {
      console.error("Failed to fetch rate limits:", error);
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

  const addToBlacklist = async () => {
    if (!blacklistForm.walletAddress || !blacklistForm.reason) {
      toast({ variant: "destructive", title: "Error", description: "Wallet address and reason are required" });
      return;
    }
    try {
      const res = await fetch("/api/admin/blacklist", {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          ...blacklistForm,
          suspendedUntil: blacklistForm.suspendedUntil || null,
        }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Wallet added to blacklist" });
        setBlacklistForm({ walletAddress: "", reason: "", status: "banned", suspendedUntil: "" });
        fetchBlacklist();
        fetchLogs();
      } else {
        const error = await res.json();
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add to blacklist" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add to blacklist" });
    }
  };

  const removeFromBlacklist = async (walletAddr: string) => {
    try {
      const res = await fetch(`/api/admin/blacklist/${walletAddr}`, {
        method: "DELETE",
        headers: apiHeaders,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Wallet removed from blacklist" });
        fetchBlacklist();
        fetchLogs();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to remove from blacklist" });
    }
  };

  const grantBadge = async () => {
    if (!badgeForm.walletAddress) {
      toast({ variant: "destructive", title: "Error", description: "Wallet address is required" });
      return;
    }
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          ...badgeForm,
          expiresAt: badgeForm.expiresAt || null,
        }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Badge granted successfully" });
        setBadgeForm({ walletAddress: "", badgeType: "vip", expiresAt: "" });
        fetchBadges();
        fetchLogs();
      } else {
        const error = await res.json();
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to grant badge" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to grant badge" });
    }
  };

  const revokeBadge = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/badges/${id}`, {
        method: "DELETE",
        headers: apiHeaders,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Badge revoked" });
        fetchBadges();
        fetchLogs();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to revoke badge" });
    }
  };

  const createAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      toast({ variant: "destructive", title: "Error", description: "Title and message are required" });
      return;
    }
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          ...announcementForm,
          expiresAt: announcementForm.expiresAt || null,
        }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Announcement created" });
        setAnnouncementForm({ title: "", message: "", type: "info", isPinned: false, expiresAt: "" });
        fetchAnnouncements();
        fetchLogs();
      } else {
        const error = await res.json();
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create announcement" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create announcement" });
    }
  };

  const toggleAnnouncement = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: apiHeaders,
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        setAnnouncements(prev =>
          prev.map(a => a.id === id ? { ...a, isActive } : a)
        );
        toast({ title: "Success", description: `Announcement ${isActive ? "activated" : "deactivated"}` });
        fetchLogs();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update announcement" });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: apiHeaders,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Announcement deleted" });
        fetchAnnouncements();
        fetchLogs();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete announcement" });
    }
  };

  const addFeaturedToken = async () => {
    if (!tokenForm.mintAddress || !tokenForm.tokenName || !tokenForm.tokenSymbol) {
      toast({ variant: "destructive", title: "Error", description: "Mint address, name, and symbol are required" });
      return;
    }
    try {
      const res = await fetch("/api/admin/featured-tokens", {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          ...tokenForm,
          imageUri: tokenForm.imageUri || null,
        }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Token added to featured list" });
        setTokenForm({ mintAddress: "", tokenName: "", tokenSymbol: "", imageUri: "", isVerified: false, displayOrder: 0 });
        fetchFeaturedTokens();
        fetchLogs();
      } else {
        const error = await res.json();
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add token" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add token" });
    }
  };

  const toggleTokenVerified = async (id: string, isVerified: boolean) => {
    try {
      const res = await fetch(`/api/admin/featured-tokens/${id}`, {
        method: "PATCH",
        headers: apiHeaders,
        body: JSON.stringify({ isVerified }),
      });
      if (res.ok) {
        setFeaturedTokens(prev =>
          prev.map(t => t.id === id ? { ...t, isVerified } : t)
        );
        toast({ title: "Success", description: `Token ${isVerified ? "verified" : "unverified"}` });
        fetchLogs();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update token" });
    }
  };

  const removeFeaturedToken = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/featured-tokens/${id}`, {
        method: "DELETE",
        headers: apiHeaders,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Token removed from featured list" });
        fetchFeaturedTokens();
        fetchLogs();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to remove token" });
    }
  };

  const setRateLimit = async () => {
    if (!rateLimitForm.walletAddress) {
      toast({ variant: "destructive", title: "Error", description: "Wallet address is required" });
      return;
    }
    try {
      const res = await fetch("/api/admin/rate-limits", {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify(rateLimitForm),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Rate limit set successfully" });
        setRateLimitForm({ walletAddress: "", maxRequestsPerMinute: 60, maxDeploysPerDay: 10, maxBurnsPerDay: 10 });
        fetchRateLimits();
        fetchLogs();
      } else {
        const error = await res.json();
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to set rate limit" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to set rate limit" });
    }
  };

  const removeRateLimit = async (walletAddr: string) => {
    try {
      const res = await fetch(`/api/admin/rate-limits/${walletAddr}`, {
        method: "DELETE",
        headers: apiHeaders,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Rate limit removed" });
        fetchRateLimits();
        fetchLogs();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to remove rate limit" });
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
      fetchBlacklist(),
      fetchBadges(),
      fetchAnnouncements(),
      fetchFeaturedTokens(),
      fetchRateLimits(),
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

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "vip": return "bg-yellow-500/20 text-yellow-400";
      case "verified": return "bg-blue-500/20 text-blue-400";
      case "early_adopter": return "bg-purple-500/20 text-purple-400";
      case "whale": return "bg-cyan-500/20 text-cyan-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case "info": return "bg-blue-500/20 text-blue-400";
      case "warning": return "bg-yellow-500/20 text-yellow-400";
      case "success": return "bg-green-500/20 text-green-400";
      case "error": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

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
          <TabsList className="bg-black/40 border border-white/10 p-1 flex-wrap h-auto">
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
            <TabsTrigger value="blacklist" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Ban className="h-4 w-4 mr-1" />
              Blacklist
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Award className="h-4 w-4 mr-1" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Megaphone className="h-4 w-4 mr-1" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="featured-tokens" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Star className="h-4 w-4 mr-1" />
              Featured Tokens
            </TabsTrigger>
            <TabsTrigger value="rate-limits" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Gauge className="h-4 w-4 mr-1" />
              Rate Limits
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

          <TabsContent value="blacklist" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-500" />
                  Add to Blacklist
                </CardTitle>
                <CardDescription>Ban or suspend wallets from using the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <Label htmlFor="blacklist-wallet" className="text-sm text-muted-foreground">Wallet Address</Label>
                    <Input
                      id="blacklist-wallet"
                      placeholder="Enter wallet address"
                      value={blacklistForm.walletAddress}
                      onChange={(e) => setBlacklistForm({ ...blacklistForm, walletAddress: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-blacklist-wallet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blacklist-status" className="text-sm text-muted-foreground">Status</Label>
                    <Select value={blacklistForm.status} onValueChange={(v: "banned" | "suspended") => setBlacklistForm({ ...blacklistForm, status: v })}>
                      <SelectTrigger className="mt-1 bg-white/5 border-white/10" data-testid="select-blacklist-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banned">Banned</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="blacklist-until" className="text-sm text-muted-foreground">Suspended Until (Optional)</Label>
                    <Input
                      id="blacklist-until"
                      type="datetime-local"
                      value={blacklistForm.suspendedUntil}
                      onChange={(e) => setBlacklistForm({ ...blacklistForm, suspendedUntil: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-blacklist-until"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addToBlacklist} className="w-full bg-red-600 hover:bg-red-700 text-white" data-testid="button-add-blacklist">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Blacklist
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="blacklist-reason" className="text-sm text-muted-foreground">Reason</Label>
                  <Textarea
                    id="blacklist-reason"
                    placeholder="Enter reason for blacklisting"
                    value={blacklistForm.reason}
                    onChange={(e) => setBlacklistForm({ ...blacklistForm, reason: e.target.value })}
                    className="mt-1 bg-white/5 border-white/10"
                    data-testid="input-blacklist-reason"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ban className="h-5 w-5 text-primary" />
                  Blacklisted Wallets ({blacklist.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blacklist.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Wallet</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reason</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Until</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blacklist.map((entry) => (
                          <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`row-blacklist-${entry.id}`}>
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm text-white">{truncateAddress(entry.walletAddress)}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={entry.status === "banned" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}>
                                {entry.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-white max-w-xs truncate block">{entry.reason}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground">
                                {entry.suspendedUntil ? format(new Date(entry.suspendedUntil), "MMM d, yyyy") : "-"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(entry.createdAt), "MMM d, yyyy")}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromBlacklist(entry.walletAddress)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                data-testid={`button-unban-${entry.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No blacklisted wallets</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Grant Badge
                </CardTitle>
                <CardDescription>Assign badges to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="badge-wallet" className="text-sm text-muted-foreground">Wallet Address</Label>
                    <Input
                      id="badge-wallet"
                      placeholder="Enter wallet address"
                      value={badgeForm.walletAddress}
                      onChange={(e) => setBadgeForm({ ...badgeForm, walletAddress: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-badge-wallet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="badge-type" className="text-sm text-muted-foreground">Badge Type</Label>
                    <Select value={badgeForm.badgeType} onValueChange={(v: "vip" | "verified" | "early_adopter" | "whale") => setBadgeForm({ ...badgeForm, badgeType: v })}>
                      <SelectTrigger className="mt-1 bg-white/5 border-white/10" data-testid="select-badge-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="early_adopter">Early Adopter</SelectItem>
                        <SelectItem value="whale">Whale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="badge-expires" className="text-sm text-muted-foreground">Expires At (Optional)</Label>
                    <Input
                      id="badge-expires"
                      type="datetime-local"
                      value={badgeForm.expiresAt}
                      onChange={(e) => setBadgeForm({ ...badgeForm, expiresAt: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-badge-expires"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={grantBadge} className="w-full bg-primary text-black hover:bg-primary/90" data-testid="button-grant-badge">
                      <Plus className="h-4 w-4 mr-2" />
                      Grant Badge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Granted Badges ({badges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Wallet</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Badge</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Granted</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Expires</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {badges.map((badge) => (
                          <tr key={badge.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`row-badge-${badge.id}`}>
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm text-white">{truncateAddress(badge.walletAddress)}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getBadgeColor(badge.badgeType)}>
                                {badge.badgeType.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(badge.createdAt), "MMM d, yyyy")}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground">
                                {badge.expiresAt ? format(new Date(badge.expiresAt), "MMM d, yyyy") : "Never"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeBadge(badge.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                data-testid={`button-revoke-badge-${badge.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No badges granted</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-blue-500" />
                  Create Announcement
                </CardTitle>
                <CardDescription>Broadcast announcements to all users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="announcement-title" className="text-sm text-muted-foreground">Title</Label>
                    <Input
                      id="announcement-title"
                      placeholder="Announcement title"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-announcement-title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="announcement-type" className="text-sm text-muted-foreground">Type</Label>
                      <Select value={announcementForm.type} onValueChange={(v: "info" | "warning" | "success" | "error") => setAnnouncementForm({ ...announcementForm, type: v })}>
                        <SelectTrigger className="mt-1 bg-white/5 border-white/10" data-testid="select-announcement-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="announcement-expires" className="text-sm text-muted-foreground">Expires At</Label>
                      <Input
                        id="announcement-expires"
                        type="datetime-local"
                        value={announcementForm.expiresAt}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                        className="mt-1 bg-white/5 border-white/10"
                        data-testid="input-announcement-expires"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="announcement-message" className="text-sm text-muted-foreground">Message</Label>
                  <Textarea
                    id="announcement-message"
                    placeholder="Announcement message"
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    className="mt-1 bg-white/5 border-white/10"
                    rows={3}
                    data-testid="input-announcement-message"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={announcementForm.isPinned}
                      onCheckedChange={(checked) => setAnnouncementForm({ ...announcementForm, isPinned: checked })}
                      data-testid="switch-announcement-pinned"
                    />
                    <Label className="text-sm text-muted-foreground">Pin to top</Label>
                  </div>
                  <Button onClick={createAnnouncement} className="bg-primary text-black hover:bg-primary/90" data-testid="button-create-announcement">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Announcements ({announcements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {announcements.length > 0 ? (
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="p-4 rounded-lg bg-white/5 border border-white/10" data-testid={`card-announcement-${ann.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-white">{ann.title}</h3>
                              <Badge className={getAnnouncementTypeColor(ann.type)}>{ann.type}</Badge>
                              {ann.isPinned && <Badge className="bg-purple-500/20 text-purple-400">Pinned</Badge>}
                              <Badge className={ann.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                                {ann.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{ann.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created: {format(new Date(ann.createdAt), "MMM d, yyyy HH:mm")}
                              {ann.expiresAt && ` • Expires: ${format(new Date(ann.expiresAt), "MMM d, yyyy")}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={ann.isActive}
                              onCheckedChange={(checked) => toggleAnnouncement(ann.id, checked)}
                              data-testid={`switch-announcement-active-${ann.id}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAnnouncement(ann.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              data-testid={`button-delete-announcement-${ann.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No announcements</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="featured-tokens" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Add Featured Token
                </CardTitle>
                <CardDescription>Add tokens to the featured list</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="token-mint" className="text-sm text-muted-foreground">Mint Address</Label>
                    <Input
                      id="token-mint"
                      placeholder="Token mint address"
                      value={tokenForm.mintAddress}
                      onChange={(e) => setTokenForm({ ...tokenForm, mintAddress: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-token-mint"
                    />
                  </div>
                  <div>
                    <Label htmlFor="token-name" className="text-sm text-muted-foreground">Token Name</Label>
                    <Input
                      id="token-name"
                      placeholder="Token name"
                      value={tokenForm.tokenName}
                      onChange={(e) => setTokenForm({ ...tokenForm, tokenName: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-token-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="token-symbol" className="text-sm text-muted-foreground">Symbol</Label>
                    <Input
                      id="token-symbol"
                      placeholder="TOKEN"
                      value={tokenForm.tokenSymbol}
                      onChange={(e) => setTokenForm({ ...tokenForm, tokenSymbol: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-token-symbol"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="token-image" className="text-sm text-muted-foreground">Image URI (Optional)</Label>
                    <Input
                      id="token-image"
                      placeholder="https://..."
                      value={tokenForm.imageUri}
                      onChange={(e) => setTokenForm({ ...tokenForm, imageUri: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-token-image"
                    />
                  </div>
                  <div>
                    <Label htmlFor="token-order" className="text-sm text-muted-foreground">Display Order</Label>
                    <Input
                      id="token-order"
                      type="number"
                      placeholder="0"
                      value={tokenForm.displayOrder}
                      onChange={(e) => setTokenForm({ ...tokenForm, displayOrder: parseInt(e.target.value) || 0 })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-token-order"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tokenForm.isVerified}
                        onCheckedChange={(checked) => setTokenForm({ ...tokenForm, isVerified: checked })}
                        data-testid="switch-token-verified"
                      />
                      <Label className="text-sm text-muted-foreground">Verified</Label>
                    </div>
                    <Button onClick={addFeaturedToken} className="flex-1 bg-primary text-black hover:bg-primary/90" data-testid="button-add-token">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Token
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Featured Tokens ({featuredTokens.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {featuredTokens.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Token</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mint</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Verified</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Order</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Added</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {featuredTokens.map((token) => (
                          <tr key={token.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`row-token-${token.id}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {token.imageUri && (
                                  <img src={token.imageUri} alt={token.tokenName} className="h-8 w-8 rounded-full object-cover" />
                                )}
                                <div>
                                  <p className="font-medium text-white">{token.tokenName}</p>
                                  <p className="text-xs text-primary">${token.tokenSymbol}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm text-white">{truncateAddress(token.mintAddress)}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Switch
                                checked={token.isVerified}
                                onCheckedChange={(checked) => toggleTokenVerified(token.id, checked)}
                                data-testid={`switch-token-verified-${token.id}`}
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className="bg-blue-500/20 text-blue-400">{token.displayOrder}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(token.createdAt), "MMM d, yyyy")}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFeaturedToken(token.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                data-testid={`button-remove-token-${token.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No featured tokens</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate-limits" className="space-y-6">
            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-orange-500" />
                  Set Custom Rate Limit
                </CardTitle>
                <CardDescription>Configure per-wallet rate limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="rate-wallet" className="text-sm text-muted-foreground">Wallet Address</Label>
                    <Input
                      id="rate-wallet"
                      placeholder="Enter wallet address"
                      value={rateLimitForm.walletAddress}
                      onChange={(e) => setRateLimitForm({ ...rateLimitForm, walletAddress: e.target.value })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-rate-wallet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate-requests" className="text-sm text-muted-foreground">Req/Min</Label>
                    <Input
                      id="rate-requests"
                      type="number"
                      value={rateLimitForm.maxRequestsPerMinute}
                      onChange={(e) => setRateLimitForm({ ...rateLimitForm, maxRequestsPerMinute: parseInt(e.target.value) || 60 })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-rate-requests"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate-deploys" className="text-sm text-muted-foreground">Deploys/Day</Label>
                    <Input
                      id="rate-deploys"
                      type="number"
                      value={rateLimitForm.maxDeploysPerDay}
                      onChange={(e) => setRateLimitForm({ ...rateLimitForm, maxDeploysPerDay: parseInt(e.target.value) || 10 })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-rate-deploys"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate-burns" className="text-sm text-muted-foreground">Burns/Day</Label>
                    <Input
                      id="rate-burns"
                      type="number"
                      value={rateLimitForm.maxBurnsPerDay}
                      onChange={(e) => setRateLimitForm({ ...rateLimitForm, maxBurnsPerDay: parseInt(e.target.value) || 10 })}
                      className="mt-1 bg-white/5 border-white/10"
                      data-testid="input-rate-burns"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={setRateLimit} className="bg-primary text-black hover:bg-primary/90" data-testid="button-set-rate-limit">
                    <Plus className="h-4 w-4 mr-2" />
                    Set Rate Limit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  Custom Rate Limits ({rateLimits.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rateLimits.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Wallet</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Req/Min</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Deploys/Day</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Burns/Day</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Updated</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rateLimits.map((limit) => (
                          <tr key={limit.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`row-rate-limit-${limit.id}`}>
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm text-white">{truncateAddress(limit.walletAddress)}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className="bg-blue-500/20 text-blue-400">{limit.maxRequestsPerMinute}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className="bg-purple-500/20 text-purple-400">{limit.maxDeploysPerDay}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className="bg-orange-500/20 text-orange-400">{limit.maxBurnsPerDay}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(limit.updatedAt), "MMM d, yyyy")}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRateLimit(limit.walletAddress)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                data-testid={`button-remove-rate-limit-${limit.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No custom rate limits configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
