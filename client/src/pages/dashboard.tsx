import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Wallet, Activity, Zap, Save, RotateCw, AlertTriangle, ArrowRight, Settings, ExternalLink, Loader2, Download, BookmarkPlus, Trash2, BarChart3, Eye, Bell, Volume2, Coins, Link2, Plus, Check, TrendingUp, TrendingDown, Target, Copy, Sliders } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { SoundSettingsDialog } from "@/components/SoundSettings";
import { playSound } from "@/lib/sounds";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllocation, 
  saveAllocation, 
  getTransactions, 
  getAutomationConfig, 
  updateAutomationConfig, 
  runOptimizer,
  getWalletBalance,
  getDestinationWallets,
  saveDestinationWallets,
  createDistribution,
  recordTransaction,
  getPresets,
  createPreset,
  deletePreset,
  getTelegramSettings,
  saveTelegramSettings,
  getLinkedWallets,
  addLinkedWallet,
  removeLinkedWallet,
  setActiveWallet,
  getPriceAlerts,
  createPriceAlert,
  updatePriceAlert,
  deletePriceAlert,
  getMultiTokenSettings,
  getActiveToken,
  createMultiToken,
  updateMultiToken,
  deleteMultiToken,
  setActiveToken
} from "@/lib/api";
import { Transaction } from "@solana/web3.js";
import type { AllocationPreset, LinkedWallet, PriceAlert, MultiTokenSettings } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isConnected, connect, tokenGate } = useWallet();
  const queryClient = useQueryClient();
  
  const [allocations, setAllocations] = useState({
    marketMaking: 25,
    buyback: 25,
    liquidity: 25,
    revenue: 25
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [distributionAmount, setDistributionAmount] = useState("");
  const [isDistributing, setIsDistributing] = useState(false);
  const [showWalletConfig, setShowWalletConfig] = useState(false);
  const [destWallets, setDestWallets] = useState({
    marketMakingWallet: "",
    buybackWallet: "",
    liquidityWallet: "",
    revenueWallet: ""
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewBreakdown, setPreviewBreakdown] = useState<{
    marketMaking: number;
    buyback: number;
    liquidity: number;
    revenue: number;
  } | null>(null);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showTelegramSettings, setShowTelegramSettings] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [notifyDistribution, setNotifyDistribution] = useState(true);
  const [notifyFeeReady, setNotifyFeeReady] = useState(true);
  const [notifyLargeBuy, setNotifyLargeBuy] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenSymbol, setNewTokenSymbol] = useState("");
  const [newContractAddress, setNewContractAddress] = useState("");
  const [newFeeCollectionWallet, setNewFeeCollectionWallet] = useState("");
  const [newFeePercentage, setNewFeePercentage] = useState(1);
  const [editingToken, setEditingToken] = useState<MultiTokenSettings | null>(null);
  const [showEditTokenDialog, setShowEditTokenDialog] = useState(false);
  const [showLinkedWallets, setShowLinkedWallets] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [newWalletLabel, setNewWalletLabel] = useState("");
  const [showPriceAlerts, setShowPriceAlerts] = useState(false);
  const [newAlertTokenSymbol, setNewAlertTokenSymbol] = useState("");
  const [newAlertTokenAddress, setNewAlertTokenAddress] = useState("");
  const [newAlertTargetPrice, setNewAlertTargetPrice] = useState("");
  const [newAlertDirection, setNewAlertDirection] = useState<"above" | "below">("above");

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

  // Fetch wallet balance (using the real connected wallet)
  const { data: balanceData } = useQuery({
    queryKey: ['balance', user?.walletAddress],
    queryFn: () => getWalletBalance(user!.walletAddress),
    enabled: !!user && user.walletAddress.length > 20,
    refetchInterval: 30000,
  });

  // Fetch destination wallets
  const { data: destinationData } = useQuery({
    queryKey: ['destinationWallets', user?.id],
    queryFn: () => getDestinationWallets(user!.id),
    enabled: !!user,
  });

  // Fetch presets
  const { data: presets = [] } = useQuery({
    queryKey: ['presets', user?.id],
    queryFn: () => getPresets(user!.id),
    enabled: !!user,
  });

  // Fetch all transactions for channel performance (no limit)
  const { data: allTransactions = [] } = useQuery({
    queryKey: ['allTransactions', user?.id],
    queryFn: () => getTransactions(user!.id, 1000),
    enabled: !!user,
  });

  // Fetch telegram settings
  const { data: telegramData } = useQuery({
    queryKey: ['telegramSettings', user?.id],
    queryFn: () => getTelegramSettings(user!.id),
    enabled: !!user,
  });

  // Fetch multi-token settings
  const { data: multiTokens = [] } = useQuery({
    queryKey: ['multiTokenSettings', user?.id],
    queryFn: () => getMultiTokenSettings(user!.id),
    enabled: !!user,
  });

  // Fetch active token
  const { data: activeToken } = useQuery({
    queryKey: ['activeToken', user?.id],
    queryFn: () => getActiveToken(user!.id),
    enabled: !!user,
  });

  // Fetch linked wallets
  const { data: linkedWallets = [] } = useQuery({
    queryKey: ['linkedWallets', user?.id],
    queryFn: () => getLinkedWallets(user!.id),
    enabled: !!user,
  });

  // Fetch price alerts
  const { data: priceAlerts = [] } = useQuery({
    queryKey: ['priceAlerts', user?.id],
    queryFn: () => getPriceAlerts(user!.id),
    enabled: !!user,
  });

  // Calculate channel performance from transactions
  const channelPerformance = useMemo(() => {
    const performance = {
      marketMaking: 0,
      buyback: 0,
      liquidity: 0,
      revenue: 0,
      total: 0
    };
    
    allTransactions.forEach((tx: any) => {
      const amount = parseFloat(tx.amount?.replace(' SOL', '') || '0');
      if (isNaN(amount)) return;
      
      if (tx.type === 'MARKET_MAKING') performance.marketMaking += amount;
      else if (tx.type === 'BUYBACK') performance.buyback += amount;
      else if (tx.type === 'LIQUIDITY') performance.liquidity += amount;
      else if (tx.type === 'REVENUE') performance.revenue += amount;
    });
    
    performance.total = performance.marketMaking + performance.buyback + performance.liquidity + performance.revenue;
    return performance;
  }, [allTransactions]);

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

  // Update destination wallets state when data loads
  useEffect(() => {
    if (destinationData) {
      setDestWallets({
        marketMakingWallet: destinationData.marketMakingWallet || "",
        buybackWallet: destinationData.buybackWallet || "",
        liquidityWallet: destinationData.liquidityWallet || "",
        revenueWallet: destinationData.revenueWallet || "",
      });
    }
  }, [destinationData]);

  // Update telegram settings state when data loads
  useEffect(() => {
    if (telegramData) {
      setTelegramChatId(telegramData.chatId || "");
      setTelegramEnabled(telegramData.isEnabled ?? false);
      setNotifyDistribution(telegramData.notifyOnDistribution ?? true);
      setNotifyFeeReady(telegramData.notifyOnFeeReady ?? true);
      setNotifyLargeBuy(telegramData.notifyOnLargeBuy ?? false);
    }
  }, [telegramData]);


  // Save allocation mutation
  const saveMutation = useMutation({
    mutationFn: () => saveAllocation(user!.id, allocations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocation', user?.id] });
      playSound('success');
      toast({
        title: "Allocations Saved",
        description: "Your fee routing strategy has been updated.",
        className: "bg-primary text-black font-bold"
      });
    },
    onError: (error: any) => {
      playSound('error');
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
      queryClient.invalidateQueries({ queryKey: ['automation', user?.id] });
      playSound('notification');
      toast({
        title: "Analysis Complete",
        description: "AI has optimized allocations based on current network conditions.",
        className: "bg-black border-primary text-white"
      });
    },
  });

  // Save destination wallets mutation
  const saveDestWalletsMutation = useMutation({
    mutationFn: () => saveDestinationWallets(user!.id, {
      marketMakingWallet: destWallets.marketMakingWallet || null,
      buybackWallet: destWallets.buybackWallet || null,
      liquidityWallet: destWallets.liquidityWallet || null,
      revenueWallet: destWallets.revenueWallet || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinationWallets', user?.id] });
      setShowWalletConfig(false);
      playSound('success');
      toast({
        title: "Wallets Saved",
        description: "Your destination wallets have been configured.",
        className: "bg-primary text-black font-bold"
      });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to save destination wallets",
      });
    },
  });

  // Preset mutations
  const createPresetMutation = useMutation({
    mutationFn: () => createPreset(user!.id, presetName, allocations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets', user?.id] });
      setShowSavePreset(false);
      setPresetName("");
      toast({
        title: "Preset Saved",
        description: `"${presetName}" has been saved.`,
        className: "bg-primary text-black font-bold"
      });
    },
  });

  const deletePresetMutation = useMutation({
    mutationFn: (id: string) => deletePreset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets', user?.id] });
      toast({ title: "Preset Deleted" });
    },
  });

  // Linked wallet mutations
  const addLinkedWalletMutation = useMutation({
    mutationFn: () => addLinkedWallet(user!.id, newWalletAddress, newWalletLabel || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedWallets', user?.id] });
      setNewWalletAddress("");
      setNewWalletLabel("");
      playSound('success');
      toast({
        title: "Wallet Added",
        description: "The wallet has been linked to your account.",
        className: "bg-primary text-black font-bold"
      });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Add Wallet",
        description: error.message || "Could not add the wallet",
      });
    },
  });

  const removeLinkedWalletMutation = useMutation({
    mutationFn: (id: string) => removeLinkedWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedWallets', user?.id] });
      toast({ title: "Wallet Removed" });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Remove Wallet",
        description: error.message || "Could not remove the wallet",
      });
    },
  });

  const setActiveWalletMutation = useMutation({
    mutationFn: (walletId: string) => setActiveWallet(user!.id, walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedWallets', user?.id] });
      playSound('success');
      toast({
        title: "Active Wallet Changed",
        description: "Your active wallet has been updated.",
        className: "bg-primary text-black font-bold"
      });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Set Active Wallet",
        description: error.message || "Could not set the active wallet",
      });
    },
  });

  // Price alert mutations
  const createPriceAlertMutation = useMutation({
    mutationFn: () => createPriceAlert(user!.id, {
      tokenSymbol: newAlertTokenSymbol,
      tokenAddress: newAlertTokenAddress,
      targetPrice: newAlertTargetPrice,
      direction: newAlertDirection,
      isActive: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceAlerts', user?.id] });
      setNewAlertTokenSymbol("");
      setNewAlertTokenAddress("");
      setNewAlertTargetPrice("");
      setNewAlertDirection("above");
      playSound('success');
      toast({
        title: "Price Alert Created",
        description: "You'll be notified when the price condition is met.",
        className: "bg-primary text-black font-bold"
      });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Create Alert",
        description: error.message || "Could not create price alert",
      });
    },
  });

  const updatePriceAlertMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PriceAlert> }) => 
      updatePriceAlert(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceAlerts', user?.id] });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Update Alert",
        description: error.message || "Could not update price alert",
      });
    },
  });

  const deletePriceAlertMutation = useMutation({
    mutationFn: (id: string) => deletePriceAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceAlerts', user?.id] });
      toast({ title: "Price Alert Deleted" });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Delete Alert",
        description: error.message || "Could not delete price alert",
      });
    },
  });

  // Multi-Token mutations
  const createMultiTokenMutation = useMutation({
    mutationFn: () => createMultiToken(user!.id, {
      tokenName: newTokenName,
      tokenSymbol: newTokenSymbol,
      contractAddress: newContractAddress,
      feeCollectionWallet: newFeeCollectionWallet || null,
      feePercentage: newFeePercentage,
      isActive: multiTokens.length === 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multiTokenSettings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['activeToken', user?.id] });
      setNewTokenName("");
      setNewTokenSymbol("");
      setNewContractAddress("");
      setNewFeeCollectionWallet("");
      setNewFeePercentage(1);
      playSound('success');
      toast({
        title: "Token Added",
        description: "Your token has been added to the list.",
        className: "bg-primary text-black font-bold"
      });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Add Token",
        description: error.message || "Could not add token",
      });
    },
  });

  const updateMultiTokenMutation = useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: Partial<MultiTokenSettings> }) => 
      updateMultiToken(id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multiTokenSettings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['activeToken', user?.id] });
      setShowEditTokenDialog(false);
      setEditingToken(null);
      playSound('success');
      toast({
        title: "Token Updated",
        description: "Token settings have been updated.",
        className: "bg-primary text-black font-bold"
      });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Update Token",
        description: error.message || "Could not update token",
      });
    },
  });

  const deleteMultiTokenMutation = useMutation({
    mutationFn: (id: string) => deleteMultiToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multiTokenSettings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['activeToken', user?.id] });
      toast({ title: "Token Deleted" });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Delete Token",
        description: error.message || "Could not delete token",
      });
    },
  });

  const setActiveTokenMutation = useMutation({
    mutationFn: (tokenId: string) => setActiveToken(user!.id, tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['multiTokenSettings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['activeToken', user?.id] });
      playSound('success');
      toast({
        title: "Active Token Changed",
        description: "Your active token has been updated.",
        className: "bg-primary text-black font-bold"
      });
    },
    onError: (error: any) => {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Failed to Set Active Token",
        description: error.message || "Could not set active token",
      });
    },
  });

  const total = Object.values(allocations).reduce((a, b) => a + b, 0);
  const isValid = total === 100;

  const handleSliderChange = (key: keyof typeof allocations, value: number[]) => {
    setAllocations(prev => ({ ...prev, [key]: value[0] }));
  };

  const loadPreset = (preset: AllocationPreset) => {
    setAllocations({
      marketMaking: preset.marketMaking,
      buyback: preset.buyback,
      liquidity: preset.liquidity,
      revenue: preset.revenue,
    });
    toast({
      title: "Preset Loaded",
      description: `"${preset.name}" allocation loaded.`,
    });
  };

  const exportTransactionsCSV = () => {
    const headers = ["Time", "Type", "Details", "Amount", "Signature"];
    const rows = allTransactions.map((tx: any) => [
      new Date(tx.createdAt).toISOString(),
      tx.type,
      tx.detail,
      tx.amount,
      tx.signature || ""
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map((cell: string) => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pumplogic-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Exported ${allTransactions.length} transactions.`,
    });
  };

  const showDistributionPreview = () => {
    const amount = parseFloat(distributionAmount);
    if (!amount || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to preview."
      });
      return;
    }
    
    setPreviewBreakdown({
      marketMaking: (allocations.marketMaking / 100) * amount,
      buyback: (allocations.buyback / 100) * amount,
      liquidity: (allocations.liquidity / 100) * amount,
      revenue: (allocations.revenue / 100) * amount,
    });
    setShowPreview(true);
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
    try {
      await optimizerMutation.mutateAsync();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAutomationToggle = (checked: boolean) => {
    automationMutation.mutate(checked);
  };

  const handleDistribute = async () => {
    const amount = parseFloat(distributionAmount);
    if (!amount || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to distribute."
      });
      return;
    }

    // Check at least one channel has both allocation > 0 and a wallet configured
    const hasValidChannel = 
      (allocations.marketMaking > 0 && destinationData?.marketMakingWallet) ||
      (allocations.buyback > 0 && destinationData?.buybackWallet) ||
      (allocations.liquidity > 0 && destinationData?.liquidityWallet) ||
      (allocations.revenue > 0 && destinationData?.revenueWallet);

    if (!hasValidChannel) {
      toast({
        variant: "destructive",
        title: "Configure Wallets First",
        description: "Configure at least one destination wallet for a channel with allocation > 0%."
      });
      setShowWalletConfig(true);
      return;
    }

    if (!window.solana) {
      toast({
        variant: "destructive",
        title: "Phantom Required",
        description: "Please install Phantom wallet to execute transactions."
      });
      return;
    }

    setIsDistributing(true);
    try {
      // Create distribution transaction
      const { transaction, breakdown } = await createDistribution(
        user!.id,
        user!.walletAddress,
        amount
      );

      // Deserialize and sign with Phantom
      const txBuffer = Uint8Array.from(atob(transaction), c => c.charCodeAt(0));
      const tx = Transaction.from(txBuffer);
      const { signature } = await window.solana.signAndSendTransaction(tx);

      // Record transaction
      await recordTransaction(user!.id, signature, amount, breakdown);

      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['balance', user?.walletAddress] });

      playSound('distribute');
      toast({
        title: "Distribution Complete",
        description: `Successfully distributed ${amount} SOL across all channels.`,
        className: "bg-primary text-black font-bold"
      });

      setDistributionAmount("");
    } catch (error: any) {
      playSound('error');
      toast({
        variant: "destructive",
        title: "Distribution Failed",
        description: error.message || "Failed to execute distribution."
      });
    } finally {
      setIsDistributing(false);
    }
  };

  // Preview mode - show dashboard but with warning
  const isPreviewMode = !isConnected || !user;

  return (
    <div className="min-h-screen text-foreground pb-20">
      <div className="container mx-auto px-4 pt-8">
        
        {/* Preview Mode Warning Banner */}
        {isPreviewMode && (
          <div className="bg-primary/10 border-2 border-primary/50 rounded-lg p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-3 items-start">
              <Wallet className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-primary block mb-1">PREVIEW MODE</strong>
                <span className="text-white/80">You're viewing the dashboard in preview mode. Connect your Phantom wallet to save settings and execute transactions.</span>
              </div>
            </div>
            <Button onClick={connect} className="bg-primary text-black hover:bg-primary/90 shrink-0" data-testid="button-connect-dashboard">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
        )}

        {/* Token Gate Warning - show when connected but doesn't meet requirements */}
        {!isPreviewMode && tokenGate && !tokenGate.allowed && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="text-red-400 block mb-1">TOKEN REQUIREMENT NOT MET</strong>
                <span className="text-white/80">
                  Full dashboard features require holding at least <span className="text-primary font-bold">${tokenGate.minRequired}</span> worth of $PLOGIC tokens. 
                  Your current holdings: <span className="font-bold">${tokenGate.valueUsd.toFixed(2)}</span>
                </span>
              </div>
            </div>
            <a 
              href="https://pump.fun/coin/63k7noZHAPfxnwzq4wGHJG4kksT7enoT2ua3shQ2pump" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="sm" className="bg-primary text-black hover:bg-primary/90 shrink-0">
                <ExternalLink className="h-4 w-4 mr-1" />
                Buy $PLOGIC
              </Button>
            </a>
          </div>
        )}

        {/* Connection Warning - only show when connected */}
        {!isPreviewMode && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200/80">
              <strong className="text-yellow-500 block mb-1">IMPORTANT SECURITY NOTICE</strong>
              Transactions are signed by your Phantom wallet. Your private key <span className="text-white font-bold">NEVER</span> leaves your wallet. Only use a dedicated fee wallet. DYOR.
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sliders className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Pump<span className="text-primary">Logic</span> Allocator
              </h1>
            </div>
            <p className="text-muted-foreground">Manage your programmable liquidity engine</p>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowWalletConfig(true)}
              disabled={isPreviewMode}
              className="border-white/10 text-xs"
            >
              <Settings className="h-4 w-4 mr-1" />
              Wallets
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowLinkedWallets(true)}
              disabled={isPreviewMode}
              className="border-white/10 text-xs"
              data-testid="button-linked-wallets"
            >
              <Link2 className="h-4 w-4 mr-1" />
              Linked
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTelegramSettings(true)}
              disabled={isPreviewMode}
              className="border-white/10 text-xs"
              data-testid="button-telegram-settings"
            >
              <Bell className="h-4 w-4 mr-1" />
              Alerts
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSoundSettings(true)}
              className="border-white/10 text-xs"
              data-testid="button-sound-settings"
            >
              <Volume2 className="h-4 w-4 mr-1" />
              Sounds
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPriceAlerts(true)}
              disabled={isPreviewMode}
              className="border-white/10 text-xs"
              data-testid="button-price-alerts"
            >
              <Target className="h-4 w-4 mr-1" />
              Price Alerts
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTokenSettings(true)}
              disabled={isPreviewMode}
              className="border-white/10 text-xs"
              data-testid="button-token-settings"
            >
              <Coins className="h-4 w-4 mr-1" />
              Token
            </Button>
            {isPreviewMode ? (
              <div className="px-3 py-1 rounded-full text-xs font-mono border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                PREVIEW
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full text-xs font-mono border bg-green-500/10 text-green-500 border-green-500/20">
                CONNECTED
              </div>
            )}
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
                  label="Buyback" 
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
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSavePreset(true)}
                      disabled={!isValid || isPreviewMode}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                      data-testid="button-save-preset"
                    >
                      <BookmarkPlus className="mr-1 h-3 w-3" /> Save Preset
                    </Button>
                  </div>
                  <Button onClick={handleSave} disabled={!isValid || saveMutation.isPending || isPreviewMode} className="bg-primary text-black hover:bg-primary/90" data-testid="button-save-allocations">
                    <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save Allocations"}
                  </Button>
                </div>

                {/* Quick Presets */}
                {presets.length > 0 && (
                  <div className="pt-4">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Quick Presets</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {presets.map((preset: AllocationPreset) => (
                        <div key={preset.id} className="flex items-center gap-1 bg-black/40 rounded-lg px-3 py-1.5 border border-white/10 group">
                          <button
                            onClick={() => loadPreset(preset)}
                            className="text-sm text-white/80 hover:text-primary transition-colors"
                            data-testid={`button-load-preset-${preset.id}`}
                          >
                            {preset.name}
                          </button>
                          <button
                            onClick={() => deletePresetMutation.mutate(preset.id)}
                            className="text-white/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                            data-testid={`button-delete-preset-${preset.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Optimizer */}
            <Card className="bg-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-white">Smart Optimizer</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-primary/50 text-primary">AI POWERED</Badge>
                </div>
                <CardDescription>AI analyzes Solana network conditions and optimizes your allocations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-black/40 rounded-lg p-3 font-mono text-xs text-primary/80 h-24 overflow-hidden relative">
                    {analyzing ? (
                      <div className="flex flex-col gap-1 animate-pulse">
                        <div>&gt; Analyzing network TPS...</div>
                        <div>&gt; Checking volatility index...</div>
                        <div>&gt; Calculating optimal buyback pressure...</div>
                        <div>&gt; optimizing...</div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="text-muted-foreground">&gt; System ready.</div>
                        <div className="text-muted-foreground">&gt; Network: Solana Mainnet</div>
                        <div className="text-green-500/50">&gt; Waiting for command...</div>
                      </div>
                    )}
                  </div>
                  <Button 
                    size="lg" 
                    onClick={runAnalysis} 
                    disabled={analyzing || optimizerMutation.isPending || isPreviewMode}
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
                <CardDescription>Distribute fees manually from your wallet using Phantom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="0.0" 
                      value={distributionAmount}
                      onChange={(e) => setDistributionAmount(e.target.value)}
                      className="bg-black/40 border-white/10 text-lg font-mono pl-4 pr-12 h-12" 
                      data-testid="input-distribution-amount" 
                    />
                    <div className="absolute right-4 top-3 text-muted-foreground font-mono text-sm">SOL</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="h-12 flex-1 md:flex-none px-4 border-white/20 text-white hover:bg-white/10" 
                      onClick={showDistributionPreview}
                      data-testid="button-preview"
                    >
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    <Button 
                      className="h-12 flex-1 md:flex-none px-4 md:px-6 bg-secondary text-white hover:bg-secondary/90 font-bold" 
                      onClick={handleDistribute}
                      disabled={isDistributing || isPreviewMode}
                      data-testid="button-distribute"
                    >
                      {isDistributing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing...
                        </>
                      ) : (
                        <>
                          Distribute <ArrowRight className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {balanceData && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Available balance: <span className="text-primary font-mono">{balanceData.balance.toFixed(4)} SOL</span>
                  </p>
                )}
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
                    disabled={automationMutation.isPending || isPreviewMode}
                    data-testid="switch-automation"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <StatBox label="RSI (14)" value={automationData?.rsi || "—"} />
                  <StatBox label="Volatility" value={automationData?.volatility || "—"} />
                </div>
              </CardContent>
            </Card>

            {/* Wallet Stats */}
            <Card className="bg-card border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-widest">Wallet Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatRow label="Address" value={user ? `${user.walletAddress.substring(0, 8)}...${user.walletAddress.substring(user.walletAddress.length - 4)}` : "Not connected"} />
                <StatRow label="Balance" value={balanceData ? `${balanceData.balance.toFixed(4)} SOL` : isPreviewMode ? "—" : "Loading..."} />
                <StatRow label="Transactions" value={transactions.length.toString()} />
                {user && (
                  <a 
                    href={`https://solscan.io/account/${user.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    View on Solscan <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card className="bg-card border-white/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-widest">Channel Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Market Making</span>
                  <span className="text-sm font-mono text-primary">{channelPerformance.marketMaking.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Buyback</span>
                  <span className="text-sm font-mono text-secondary">{channelPerformance.buyback.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Liquidity Pool</span>
                  <span className="text-sm font-mono text-blue-400">{channelPerformance.liquidity.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Creator Revenue</span>
                  <span className="text-sm font-mono text-yellow-400">{channelPerformance.revenue.toFixed(4)} SOL</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white font-medium">Total Distributed</span>
                  <span className="text-sm font-mono text-white font-bold">{channelPerformance.total.toFixed(4)} SOL</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Activity Log */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-display text-white">Activity Log</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportTransactionsCSV}
              disabled={allTransactions.length === 0}
              className="border-white/20 text-white hover:bg-white/10"
              data-testid="button-export-csv"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
             <div className="p-4 border-b border-white/5 text-xs text-muted-foreground hidden md:grid grid-cols-12 gap-4 uppercase tracking-widest font-mono">
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
                      signature={tx.signature}
                    />
                  ))
                )}
             </div>
          </div>
        </div>

      </div>

      {/* Wallet Configuration Dialog */}
      <Dialog open={showWalletConfig} onOpenChange={setShowWalletConfig}>
        <DialogContent className="bg-card border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Destination Wallets</DialogTitle>
            <DialogDescription>
              Set up the wallet addresses where fees will be distributed for each channel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white text-sm">Market Making Wallet</Label>
              <Input 
                placeholder="Enter Solana wallet address"
                value={destWallets.marketMakingWallet}
                onChange={(e) => setDestWallets(prev => ({ ...prev, marketMakingWallet: e.target.value }))}
                className="bg-black/40 border-white/10 mt-1"
              />
            </div>
            <div>
              <Label className="text-white text-sm">Buyback Wallet</Label>
              <Input 
                placeholder="Enter Solana wallet address"
                value={destWallets.buybackWallet}
                onChange={(e) => setDestWallets(prev => ({ ...prev, buybackWallet: e.target.value }))}
                className="bg-black/40 border-white/10 mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Need to burn tokens? Use{" "}
                <a 
                  href="https://sol-incinerator.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline"
                >
                  Sol Incinerator
                </a>
              </p>
            </div>
            <div>
              <Label className="text-white text-sm">Liquidity Pool Wallet</Label>
              <Input 
                placeholder="Enter Solana wallet address"
                value={destWallets.liquidityWallet}
                onChange={(e) => setDestWallets(prev => ({ ...prev, liquidityWallet: e.target.value }))}
                className="bg-black/40 border-white/10 mt-1"
              />
            </div>
            <div>
              <Label className="text-white text-sm">Creator Revenue Wallet</Label>
              <Input 
                placeholder="Enter Solana wallet address"
                value={destWallets.revenueWallet}
                onChange={(e) => setDestWallets(prev => ({ ...prev, revenueWallet: e.target.value }))}
                className="bg-black/40 border-white/10 mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWalletConfig(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => saveDestWalletsMutation.mutate()}
              disabled={saveDestWalletsMutation.isPending}
              className="bg-primary text-black"
            >
              {saveDestWalletsMutation.isPending ? "Saving..." : "Save Wallets"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Preset Dialog */}
      <Dialog open={showSavePreset} onOpenChange={setShowSavePreset}>
        <DialogContent className="bg-card border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Allocation Preset</DialogTitle>
            <DialogDescription>
              Save your current allocation settings for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-white text-sm">Preset Name</Label>
            <Input 
              placeholder="e.g., Bull Market Strategy"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="bg-black/40 border-white/10 mt-2"
              data-testid="input-preset-name"
            />
            <div className="mt-4 p-3 bg-black/20 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Making</span>
                <span className="text-primary font-mono">{allocations.marketMaking}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyback</span>
                <span className="text-secondary font-mono">{allocations.buyback}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Liquidity Pool</span>
                <span className="text-blue-400 font-mono">{allocations.liquidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creator Revenue</span>
                <span className="text-yellow-400 font-mono">{allocations.revenue}%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSavePreset(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createPresetMutation.mutate()}
              disabled={!presetName.trim() || createPresetMutation.isPending}
              className="bg-primary text-black"
              data-testid="button-confirm-save-preset"
            >
              {createPresetMutation.isPending ? "Saving..." : "Save Preset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Distribution Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Distribution Preview
            </DialogTitle>
            <DialogDescription>
              Review how your {distributionAmount} SOL will be distributed across channels.
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
                  <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                    <span className="text-white">Buyback</span>
                    <span className="text-secondary font-mono font-bold">{previewBreakdown.buyback.toFixed(6)} SOL</span>
                  </div>
                )}
                {previewBreakdown.liquidity > 0 && (
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-white">Liquidity Pool</span>
                    <span className="text-blue-400 font-mono font-bold">{previewBreakdown.liquidity.toFixed(6)} SOL</span>
                  </div>
                )}
                {previewBreakdown.revenue > 0 && (
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <span className="text-white">Creator Revenue</span>
                    <span className="text-yellow-400 font-mono font-bold">{previewBreakdown.revenue.toFixed(6)} SOL</span>
                  </div>
                )}
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total</span>
                <span className="text-white font-mono font-bold text-lg">{distributionAmount} SOL</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Channels without configured destination wallets will be skipped.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowPreview(false);
                handleDistribute();
              }}
              disabled={isDistributing}
              className="bg-secondary text-white"
              data-testid="button-confirm-distribute"
            >
              Proceed to Distribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Telegram Notifications Dialog */}
      <Dialog open={showTelegramSettings} onOpenChange={setShowTelegramSettings}>
        <DialogContent className="bg-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Telegram Notifications
            </DialogTitle>
            <DialogDescription>
              Get notified about distributions and fee activity via Telegram. No private keys required.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-black/20 rounded-lg p-4 border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">Setup Instructions</h4>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Open Telegram and search for <span className="text-primary font-mono">@PumpLogicBot</span></li>
                <li>Send <span className="text-primary font-mono">/start</span> to the bot</li>
                <li>Copy your Chat ID from the bot's response</li>
                <li>Paste it below and enable notifications</li>
              </ol>
            </div>
            
            <div>
              <Label className="text-white text-sm">Telegram Chat ID</Label>
              <Input 
                placeholder="e.g., 123456789"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="bg-black/40 border-white/10 mt-1 font-mono"
                data-testid="input-telegram-chat-id"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white text-sm">Enable Notifications</Label>
                <p className="text-xs text-muted-foreground">Turn on to receive Telegram alerts</p>
              </div>
              <Switch 
                checked={telegramEnabled}
                onCheckedChange={setTelegramEnabled}
                data-testid="switch-telegram-enabled"
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Notification Types</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-sm">Distribution Confirmations</Label>
                  <p className="text-xs text-muted-foreground">When a distribution is completed</p>
                </div>
                <Switch 
                  checked={notifyDistribution}
                  onCheckedChange={setNotifyDistribution}
                  disabled={!telegramEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-sm">Fee Ready Alerts</Label>
                  <p className="text-xs text-muted-foreground">When fees are ready to distribute</p>
                </div>
                <Switch 
                  checked={notifyFeeReady}
                  onCheckedChange={setNotifyFeeReady}
                  disabled={!telegramEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-sm">Large Buy Alerts</Label>
                  <p className="text-xs text-muted-foreground">When a large purchase is detected</p>
                </div>
                <Switch 
                  checked={notifyLargeBuy}
                  onCheckedChange={setNotifyLargeBuy}
                  disabled={!telegramEnabled}
                />
              </div>
            </div>

            {telegramChatId.trim() && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/telegram-settings/test', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ chatId: telegramChatId }),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);
                    toast({
                      title: "Test Sent",
                      description: "Check your Telegram for the test message!",
                      className: "bg-primary text-black font-bold"
                    });
                  } catch (error: any) {
                    toast({
                      variant: "destructive",
                      title: "Test Failed",
                      description: error.message || "Failed to send test notification",
                    });
                  }
                }}
                className="w-full border-primary/50 text-primary hover:bg-primary/10"
                data-testid="button-test-telegram"
              >
                <Bell className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTelegramSettings(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  await saveTelegramSettings(user!.id, {
                    chatId: telegramChatId || null,
                    isEnabled: telegramEnabled,
                    notifyOnDistribution: notifyDistribution,
                    notifyOnFeeReady: notifyFeeReady,
                    notifyOnLargeBuy: notifyLargeBuy,
                  });
                  queryClient.invalidateQueries({ queryKey: ['telegramSettings', user?.id] });
                  toast({
                    title: "Settings Saved",
                    description: "Your notification preferences have been updated.",
                    className: "bg-primary text-black font-bold"
                  });
                  setShowTelegramSettings(false);
                } catch (error: any) {
                  toast({
                    variant: "destructive",
                    title: "Save Failed",
                    description: error.message || "Failed to save settings",
                  });
                }
              }}
              disabled={!telegramChatId.trim()}
              className="bg-primary text-black"
              data-testid="button-save-telegram-settings"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SoundSettingsDialog open={showSoundSettings} onOpenChange={setShowSoundSettings} />

      {/* Multi-Token Management Dialog */}
      <Dialog open={showTokenSettings} onOpenChange={setShowTokenSettings}>
        <DialogContent className="bg-card border-white/10 text-white w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Multi-Token Management
            </DialogTitle>
            <DialogDescription>
              Manage multiple tokens and configure their fee distribution settings
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Add New Token Form */}
            <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-4">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Add New Token
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-white text-xs">Token Name *</Label>
                  <Input 
                    placeholder="e.g., MyToken"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="bg-black/40 border-white/10 text-sm"
                    data-testid="input-new-token-name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-white text-xs">Token Symbol *</Label>
                  <Input 
                    placeholder="e.g., MTK"
                    value={newTokenSymbol}
                    onChange={(e) => setNewTokenSymbol(e.target.value)}
                    className="bg-black/40 border-white/10 text-sm"
                    data-testid="input-new-token-symbol"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-white text-xs">Contract Address *</Label>
                <Input 
                  placeholder="Enter your token's Solana mint address"
                  value={newContractAddress}
                  onChange={(e) => setNewContractAddress(e.target.value)}
                  className="bg-black/40 border-white/10 font-mono text-xs"
                  data-testid="input-new-contract-address"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-white text-xs">Fee Collection Wallet</Label>
                  <Input 
                    placeholder="Optional"
                    value={newFeeCollectionWallet}
                    onChange={(e) => setNewFeeCollectionWallet(e.target.value)}
                    className="bg-black/40 border-white/10 font-mono text-xs"
                    data-testid="input-new-fee-wallet"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-white text-xs">Fee Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[newFeePercentage]} 
                      max={10} 
                      min={1}
                      step={1} 
                      onValueChange={(v) => setNewFeePercentage(v[0])}
                      className="flex-1"
                    />
                    <span className="font-mono text-white w-8 text-right text-sm">{newFeePercentage}%</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => createMultiTokenMutation.mutate()}
                disabled={!newTokenName.trim() || !newTokenSymbol.trim() || !newContractAddress.trim() || createMultiTokenMutation.isPending}
                className="w-full bg-primary text-black hover:bg-primary/90"
                data-testid="button-add-token"
              >
                {createMultiTokenMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Token
                  </>
                )}
              </Button>
            </div>

            <Separator className="bg-white/10" />

            {/* Token List */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Tokens</h4>
              {multiTokens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-white/10 rounded-lg">
                  No tokens configured yet. Add one above to get started.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {multiTokens.map((token: MultiTokenSettings) => (
                    <div 
                      key={token.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        token.isActive 
                          ? "bg-primary/10 border-primary/50" 
                          : "bg-black/20 border-white/10 hover:border-white/20"
                      )}
                      data-testid={`token-item-${token.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {token.isActive && (
                              <Badge className="bg-primary text-black text-[10px] px-1.5 py-0">
                                <Check className="h-3 w-3 mr-0.5" />
                                Active
                              </Badge>
                            )}
                            <span className="text-white font-medium">
                              {token.tokenName}
                            </span>
                            <span className="text-primary font-mono text-sm">
                              ${token.tokenSymbol}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-muted-foreground mt-1">
                            {token.contractAddress.substring(0, 12)}...{token.contractAddress.substring(token.contractAddress.length - 8)}
                          </div>
                          {token.feeCollectionWallet && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Fee Wallet: {token.feeCollectionWallet.substring(0, 8)}...
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            Fee: {token.feePercentage}%
                          </div>
                          
                          {/* Show allocation for active token */}
                          {token.isActive && (
                            <div className="mt-3 p-2 bg-black/30 rounded border border-primary/20">
                              <div className="text-xs text-primary font-medium mb-2">Allocation Breakdown</div>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="text-primary font-mono font-bold">{token.marketMaking}%</div>
                                  <div className="text-muted-foreground">Market</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-secondary font-mono font-bold">{token.buyback}%</div>
                                  <div className="text-muted-foreground">Buyback</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-blue-400 font-mono font-bold">{token.liquidity}%</div>
                                  <div className="text-muted-foreground">Liquidity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-yellow-400 font-mono font-bold">{token.revenue}%</div>
                                  <div className="text-muted-foreground">Revenue</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!token.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveTokenMutation.mutate(token.id)}
                              disabled={setActiveTokenMutation.isPending}
                              className="text-primary hover:bg-primary/10 h-8 px-2 text-xs"
                              data-testid={`button-set-active-token-${token.id}`}
                            >
                              Set Active
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingToken(token);
                              setShowEditTokenDialog(true);
                            }}
                            className="text-white/70 hover:bg-white/10 h-8 w-8 p-0"
                            data-testid={`button-edit-token-${token.id}`}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete token "${token.tokenName}"?`)) {
                                deleteMultiTokenMutation.mutate(token.id);
                              }
                            }}
                            disabled={deleteMultiTokenMutation.isPending}
                            className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            data-testid={`button-delete-token-${token.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTokenSettings(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Token Dialog */}
      <Dialog open={showEditTokenDialog} onOpenChange={(open) => {
        setShowEditTokenDialog(open);
        if (!open) setEditingToken(null);
      }}>
        <DialogContent className="bg-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Edit Token
            </DialogTitle>
            <DialogDescription>
              Update token settings for {editingToken?.tokenName}
            </DialogDescription>
          </DialogHeader>
          {editingToken && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-white text-xs">Token Name</Label>
                  <Input 
                    value={editingToken.tokenName}
                    onChange={(e) => setEditingToken({...editingToken, tokenName: e.target.value})}
                    className="bg-black/40 border-white/10 text-sm"
                    data-testid="input-edit-token-name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-white text-xs">Token Symbol</Label>
                  <Input 
                    value={editingToken.tokenSymbol}
                    onChange={(e) => setEditingToken({...editingToken, tokenSymbol: e.target.value})}
                    className="bg-black/40 border-white/10 text-sm"
                    data-testid="input-edit-token-symbol"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-white text-xs">Contract Address</Label>
                <Input 
                  value={editingToken.contractAddress}
                  onChange={(e) => setEditingToken({...editingToken, contractAddress: e.target.value})}
                  className="bg-black/40 border-white/10 font-mono text-xs"
                  data-testid="input-edit-contract-address"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white text-xs">Fee Collection Wallet</Label>
                <Input 
                  value={editingToken.feeCollectionWallet || ""}
                  onChange={(e) => setEditingToken({...editingToken, feeCollectionWallet: e.target.value || null})}
                  className="bg-black/40 border-white/10 font-mono text-xs"
                  placeholder="Optional"
                  data-testid="input-edit-fee-wallet"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white text-xs">Fee Percentage</Label>
                <div className="flex items-center gap-2">
                  <Slider 
                    value={[editingToken.feePercentage ?? 1]} 
                    max={10} 
                    min={1}
                    step={1} 
                    onValueChange={(v) => setEditingToken({...editingToken, feePercentage: v[0]})}
                    className="flex-1"
                  />
                  <span className="font-mono text-white w-8 text-right text-sm">{editingToken.feePercentage ?? 1}%</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditTokenDialog(false);
              setEditingToken(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingToken) {
                  updateMultiTokenMutation.mutate({
                    id: editingToken.id,
                    settings: {
                      tokenName: editingToken.tokenName,
                      tokenSymbol: editingToken.tokenSymbol,
                      contractAddress: editingToken.contractAddress,
                      feeCollectionWallet: editingToken.feeCollectionWallet,
                      feePercentage: editingToken.feePercentage,
                    }
                  });
                }
              }}
              disabled={updateMultiTokenMutation.isPending}
              className="bg-primary text-black"
              data-testid="button-save-edit-token"
            >
              {updateMultiTokenMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Linked Wallets Dialog */}
      <Dialog open={showLinkedWallets} onOpenChange={setShowLinkedWallets}>
        <DialogContent className="bg-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Linked Wallets
            </DialogTitle>
            <DialogDescription>
              Manage multiple wallets for your account. Set one as active for transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Add New Wallet Form */}
            <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-3">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Add New Wallet
              </h4>
              <div className="space-y-2">
                <Input 
                  placeholder="Wallet address"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  className="bg-black/40 border-white/10 font-mono text-xs"
                  data-testid="input-new-wallet-address"
                />
                <Input 
                  placeholder="Label (optional, e.g., 'Trading Wallet')"
                  value={newWalletLabel}
                  onChange={(e) => setNewWalletLabel(e.target.value)}
                  className="bg-black/40 border-white/10"
                  data-testid="input-new-wallet-label"
                />
                <Button
                  onClick={() => addLinkedWalletMutation.mutate()}
                  disabled={!newWalletAddress.trim() || addLinkedWalletMutation.isPending}
                  className="w-full bg-primary text-black hover:bg-primary/90"
                  data-testid="button-add-wallet"
                >
                  {addLinkedWalletMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Wallet
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Linked Wallets List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Wallets</h4>
              {linkedWallets.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No linked wallets yet. Add one above.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {linkedWallets.map((wallet: LinkedWallet) => (
                    <div 
                      key={wallet.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        wallet.isActive 
                          ? "bg-primary/10 border-primary/50" 
                          : "bg-black/20 border-white/10 hover:border-white/20"
                      )}
                      data-testid={`wallet-item-${wallet.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {wallet.isActive && (
                            <Badge className="bg-primary text-black text-[10px] px-1.5 py-0">
                              <Check className="h-3 w-3 mr-0.5" />
                              Active
                            </Badge>
                          )}
                          <span className="text-white text-sm font-medium truncate">
                            {wallet.label || "Unnamed Wallet"}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-1">
                          {wallet.walletAddress.substring(0, 8)}...{wallet.walletAddress.substring(wallet.walletAddress.length - 6)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!wallet.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveWalletMutation.mutate(wallet.id)}
                            disabled={setActiveWalletMutation.isPending}
                            className="text-primary hover:bg-primary/10 h-8 px-2"
                            data-testid={`button-set-active-${wallet.id}`}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLinkedWalletMutation.mutate(wallet.id)}
                          disabled={removeLinkedWalletMutation.isPending}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          data-testid={`button-remove-wallet-${wallet.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              The active wallet is used for fee distributions and transactions.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkedWallets(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price Alerts Dialog */}
      <Dialog open={showPriceAlerts} onOpenChange={setShowPriceAlerts}>
        <DialogContent className="bg-card border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Price Alerts
            </DialogTitle>
            <DialogDescription>
              Get notified when token prices reach your target levels.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Create New Alert Form */}
            <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-3">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Create New Alert
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Token Symbol</Label>
                  <Input 
                    placeholder="e.g., SOL"
                    value={newAlertTokenSymbol}
                    onChange={(e) => setNewAlertTokenSymbol(e.target.value.toUpperCase())}
                    className="bg-black/40 border-white/10"
                    data-testid="input-alert-token-symbol"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Target Price (USD)</Label>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={newAlertTargetPrice}
                    onChange={(e) => setNewAlertTargetPrice(e.target.value)}
                    className="bg-black/40 border-white/10 font-mono"
                    data-testid="input-alert-target-price"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Token Contract Address</Label>
                <Input 
                  placeholder="Enter Solana token address"
                  value={newAlertTokenAddress}
                  onChange={(e) => setNewAlertTokenAddress(e.target.value)}
                  className="bg-black/40 border-white/10 font-mono text-xs"
                  data-testid="input-alert-token-address"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Alert Direction</Label>
                <Select value={newAlertDirection} onValueChange={(v) => setNewAlertDirection(v as "above" | "below")}>
                  <SelectTrigger className="bg-black/40 border-white/10" data-testid="select-alert-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="above">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Above - Alert when price goes up
                      </span>
                    </SelectItem>
                    <SelectItem value="below">
                      <span className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Below - Alert when price goes down
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => createPriceAlertMutation.mutate()}
                disabled={!newAlertTokenSymbol.trim() || !newAlertTokenAddress.trim() || !newAlertTargetPrice || createPriceAlertMutation.isPending}
                className="w-full bg-primary text-black hover:bg-primary/90"
                data-testid="button-create-alert"
              >
                {createPriceAlertMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Alert
                  </>
                )}
              </Button>
            </div>

            <Separator className="bg-white/10" />

            {/* Price Alerts List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Alerts</h4>
              {priceAlerts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No price alerts yet. Create one above.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {priceAlerts.map((alert: PriceAlert) => (
                    <div 
                      key={alert.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        alert.isTriggered 
                          ? "bg-yellow-500/10 border-yellow-500/30" 
                          : alert.isActive 
                            ? "bg-black/20 border-white/10" 
                            : "bg-black/10 border-white/5 opacity-60"
                      )}
                      data-testid={`price-alert-item-${alert.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{alert.tokenSymbol}</span>
                          {alert.direction === "above" ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-mono text-primary text-sm">${alert.targetPrice}</span>
                          {alert.isTriggered ? (
                            <Badge className="bg-yellow-500 text-black text-[10px] px-1.5 py-0">
                              Triggered
                            </Badge>
                          ) : alert.isActive ? (
                            <Badge className="bg-primary/20 text-primary border border-primary/50 text-[10px] px-1.5 py-0">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-zinc-700 text-zinc-400 text-[10px] px-1.5 py-0">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-1">
                          {alert.tokenAddress.substring(0, 8)}...{alert.tokenAddress.substring(alert.tokenAddress.length - 6)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Switch
                          checked={alert.isActive}
                          onCheckedChange={(checked) => 
                            updatePriceAlertMutation.mutate({ id: alert.id, updates: { isActive: checked } })
                          }
                          disabled={updatePriceAlertMutation.isPending || alert.isTriggered}
                          data-testid={`switch-alert-${alert.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePriceAlertMutation.mutate(alert.id)}
                          disabled={deletePriceAlertMutation.isPending}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          data-testid={`button-delete-alert-${alert.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Price alerts will notify you via Telegram when configured.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceAlerts(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function LogItem({ time, type, detail, amount, signature }: { time: string, type: string, detail: string, amount: string, signature?: string | null }) {
  const getColor = (t: string) => {
    switch(t) {
      case 'OPTIMIZE': return 'text-primary';
      case 'DISTRIBUTE': return 'text-secondary';
      case 'BUYBACK': return 'text-blue-400';
      case 'MARKET_MAKING': return 'text-primary';
      case 'LIQUIDITY': return 'text-blue-400';
      case 'REVENUE': return 'text-yellow-400';
      case 'DEPOSIT': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <>
      {/* Desktop layout */}
      <div className="p-4 hidden md:grid grid-cols-12 gap-4 text-sm hover:bg-white/5 transition-colors">
        <div className="col-span-2 text-muted-foreground font-mono text-xs">{time}</div>
        <div className={cn("col-span-2 font-bold text-xs uppercase", getColor(type))}>{type}</div>
        <div className="col-span-6 text-white flex items-center gap-2">
          {detail}
          {signature && (
            <a 
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="col-span-2 text-right font-mono text-white">{amount}</div>
      </div>
      {/* Mobile layout */}
      <div className="p-4 md:hidden hover:bg-white/5 transition-colors space-y-2">
        <div className="flex items-center justify-between">
          <span className={cn("font-bold text-xs uppercase", getColor(type))}>{type}</span>
          <span className="font-mono text-white text-sm">{amount}</span>
        </div>
        <div className="text-white text-sm flex items-center gap-2">
          {detail}
          {signature && (
            <a 
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="text-muted-foreground font-mono text-xs">{time}</div>
      </div>
    </>
  );
}
