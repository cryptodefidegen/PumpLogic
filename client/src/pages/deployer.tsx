import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { 
  Rocket, Loader2, AlertTriangle, Wallet, ExternalLink, 
  Info, Upload, Image, Twitter, MessageCircle, Globe,
  Sparkles, Zap, Users, Shield, CheckCircle2, Copy,
  ArrowRight, RefreshCw, Flame, BarChart3, X, History, Clock
} from "lucide-react";
import { Connection, PublicKey, VersionedTransaction, Keypair } from "@solana/web3.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import bs58 from "bs58";

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
  showName: boolean;
}

interface DeploymentTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  initialBuy: number;
  recommended: boolean;
}

interface DeploymentResult {
  success: boolean;
  mintAddress?: string;
  signature?: string;
  error?: string;
}

interface DeploymentRecord {
  id: string;
  walletAddress: string;
  mintAddress: string;
  signature: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDescription?: string;
  imageUri?: string;
  initialBuy?: string;
  createdAt: string;
}

const templates: DeploymentTemplate[] = [
  {
    id: "fair",
    name: "Fair Launch",
    icon: <Users className="h-5 w-5" />,
    description: "No dev allocation, community-first approach",
    initialBuy: 0,
    recommended: false,
  },
  {
    id: "standard",
    name: "Standard",
    icon: <Zap className="h-5 w-5" />,
    description: "Small initial buy for liquidity seeding",
    initialBuy: 0.5,
    recommended: true,
  },
  {
    id: "meme",
    name: "Meme Token",
    icon: <Sparkles className="h-5 w-5" />,
    description: "Larger dev bag for marketing & burns",
    initialBuy: 1,
    recommended: false,
  },
];

const DEPLOYMENT_COST_SOL = 0.02;

export default function Deployer() {
  const { toast } = useToast();
  const { isConnected, fullWalletAddress, connectedWallet, availableWallets } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
    showName: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("standard");
  const [initialBuy, setInitialBuy] = useState<string>("0.5");
  const [isDeploying, setIsDeploying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const isPreviewMode = !isConnected;

  // Fetch deployment history when wallet connects
  useEffect(() => {
    const fetchDeploymentHistory = async () => {
      if (!fullWalletAddress) {
        setDeploymentHistory([]);
        return;
      }
      
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`/api/deployments/${fullWalletAddress}`);
        if (response.ok) {
          const data = await response.json();
          setDeploymentHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch deployment history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchDeploymentHistory();
  }, [fullWalletAddress]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleBannerUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a banner smaller than 5MB",
        });
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setInitialBuy(template.initialBuy.toString());
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Missing name", description: "Please enter a token name" });
      return false;
    }
    if (!formData.symbol.trim()) {
      toast({ variant: "destructive", title: "Missing symbol", description: "Please enter a token symbol" });
      return false;
    }
    if (formData.symbol.length > 10) {
      toast({ variant: "destructive", title: "Symbol too long", description: "Symbol must be 10 characters or less" });
      return false;
    }
    if (!formData.description.trim()) {
      toast({ variant: "destructive", title: "Missing description", description: "Please enter a token description" });
      return false;
    }
    if (!imageFile) {
      toast({ variant: "destructive", title: "Missing image", description: "Please upload a token image" });
      return false;
    }
    return true;
  };

  const handleDeployClick = () => {
    if (!validateForm()) return;
    setShowConfirmDialog(true);
  };

  const checkSolBalance = async (): Promise<number> => {
    if (!fullWalletAddress) return 0;
    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");
      const balance = await connection.getBalance(new PublicKey(fullWalletAddress));
      return balance / 1e9;
    } catch {
      return 0;
    }
  };

  const deployToken = async () => {
    if (!fullWalletAddress || !connectedWallet || !imageFile) {
      toast({ variant: "destructive", title: "Error", description: "Wallet not connected or missing image" });
      return;
    }

    const wallet = availableWallets.find(w => w.name === connectedWallet);
    if (!wallet?.provider) {
      toast({ variant: "destructive", title: "Wallet Error", description: "Wallet not connected. Please reconnect your wallet." });
      return;
    }

    const solBalance = await checkSolBalance();
    const requiredBalance = totalCost + 0.01;
    if (solBalance < requiredBalance) {
      toast({ 
        variant: "destructive", 
        title: "Insufficient Balance", 
        description: `You need at least ${requiredBalance.toFixed(3)} SOL. Current balance: ${solBalance.toFixed(3)} SOL` 
      });
      return;
    }

    setIsDeploying(true);
    setShowConfirmDialog(false);

    try {
      const mintKeypair = Keypair.generate();

      const formDataToSend = new FormData();
      formDataToSend.append("file", imageFile);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("symbol", formData.symbol.toUpperCase());
      formDataToSend.append("description", formData.description);
      formDataToSend.append("showName", formData.showName ? "true" : "false");
      if (bannerFile) formDataToSend.append("banner", bannerFile);
      if (formData.twitter) formDataToSend.append("twitter", formData.twitter);
      if (formData.telegram) formDataToSend.append("telegram", formData.telegram);
      if (formData.website) formDataToSend.append("website", formData.website);

      toast({ title: "Uploading metadata...", description: "Uploading token data to IPFS" });

      const ipfsResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: formDataToSend,
      });

      if (!ipfsResponse.ok) {
        const errorText = await ipfsResponse.text();
        throw new Error(`Failed to upload metadata to IPFS: ${errorText}`);
      }

      const ipfsData = await ipfsResponse.json();

      toast({ title: "Creating transaction...", description: "Building deployment transaction" });

      const initialBuyAmount = parseFloat(initialBuy) || 0;
      const createPayload = {
        publicKey: fullWalletAddress,
        action: "create",
        tokenMetadata: {
          name: formData.name,
          symbol: formData.symbol.toUpperCase(),
          uri: ipfsData.metadataUri,
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: "true",
        amount: initialBuyAmount,
        slippage: 10,
        priorityFee: 0.0005,
        pool: "pump",
      };

      const txResponse = await fetch("https://pumpportal.fun/api/trade-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      if (!txResponse.ok) {
        const errorText = await txResponse.text();
        throw new Error(`Failed to create transaction: ${errorText}`);
      }

      const txData = await txResponse.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(txData));

      tx.sign([mintKeypair]);

      toast({ title: "Awaiting signature...", description: "Please approve the transaction in your wallet" });

      const signedTx = await wallet.provider.signTransaction(tx);

      toast({ title: "Sending transaction...", description: "Broadcasting to Solana network" });

      const connection = new Connection(SOLANA_RPC, "confirmed");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      toast({ title: "Confirming...", description: "Waiting for transaction confirmation" });

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      const mintAddress = mintKeypair.publicKey.toBase58();
      
      setDeploymentResult({
        success: true,
        mintAddress,
        signature,
      });
      setShowSuccessDialog(true);

      // Save deployment record to database
      try {
        const response = await fetch("/api/deployments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: fullWalletAddress,
            mintAddress,
            signature,
            tokenName: formData.name,
            tokenSymbol: formData.symbol,
            tokenDescription: formData.description || null,
            imageUri: null,
            initialBuy: initialBuy || "0",
          }),
        });
        
        if (response.ok) {
          const newRecord = await response.json();
          setDeploymentHistory(prev => [newRecord, ...prev]);
        }
      } catch (error) {
        console.error("Failed to save deployment record:", error);
      }

      toast({
        title: "Token Deployed!",
        description: `${formData.symbol.toUpperCase()} has been successfully deployed`,
        className: "bg-primary text-black font-bold",
      });

    } catch (error: any) {
      console.error("Deployment failed:", error);
      setDeploymentResult({
        success: false,
        error: error.message || "Deployment failed",
      });
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: error.message || "Failed to deploy token. Please try again.",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      symbol: "",
      description: "",
      twitter: "",
      telegram: "",
      website: "",
      showName: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setBannerFile(null);
    setBannerPreview(null);
    setSelectedTemplate("standard");
    setInitialBuy("0.5");
    setDeploymentResult(null);
    setShowSuccessDialog(false);
  };

  const totalCost = DEPLOYMENT_COST_SOL + (parseFloat(initialBuy) || 0);

  return (
    <div className="min-h-screen text-foreground pb-20">
      <div className="container mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Pump<span className="text-primary">Logic</span> Deployer
              </h1>
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 text-xs">
                IN DEV
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Launch your Pump.fun token in seconds. Fill in the details, choose a template, and deploy directly to Solana.
            </p>
          </div>
        </motion.div>

        {isPreviewMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3"
          >
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-500 font-medium">Preview Mode</p>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to deploy tokens. You can explore the interface and preview your token.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Details Card */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Token Details
                </CardTitle>
                <CardDescription>
                  Enter your token information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Token Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. PumpLogic"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-black/40 border-white/20"
                      data-testid="input-token-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol" className="text-white">Symbol *</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g. PLOGIC"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                      maxLength={10}
                      className="bg-black/40 border-white/20 uppercase"
                      data-testid="input-token-symbol"
                    />
                    <p className="text-xs text-muted-foreground">{formData.symbol.length}/10 characters</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your token and its purpose..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-black/40 border-white/20 min-h-[100px]"
                    data-testid="input-token-description"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-white">Token Image *</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                      imagePreview ? "border-primary/50 bg-primary/5" : "border-white/20 hover:border-primary/50"
                    )}
                  >
                    {imagePreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Token preview"
                          className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                        />
                        <p className="text-sm text-primary">Click to change image</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload image</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="input-token-image"
                  />
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    Banner Image
                    <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                      bannerPreview ? "border-primary/50 bg-primary/5" : "border-white/20 hover:border-primary/50"
                    )}
                  >
                    {bannerPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={bannerPreview}
                          alt="Banner preview"
                          className="w-full h-24 rounded-lg object-cover border border-primary/50"
                        />
                        <p className="text-sm text-primary">Click to change banner</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Image className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload banner (1500x500 recommended)</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    onChange={handleBannerUpload}
                    className="hidden"
                    data-testid="input-token-banner"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Socials Card */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Social Links
                  <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Twitter className="h-4 w-4" /> Twitter
                    </Label>
                    <Input
                      placeholder="https://x.com/..."
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className="bg-black/40 border-white/20"
                      data-testid="input-twitter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> Telegram
                    </Label>
                    <Input
                      placeholder="https://t.me/..."
                      value={formData.telegram}
                      onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                      className="bg-black/40 border-white/20"
                      data-testid="input-telegram"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Website
                    </Label>
                    <Input
                      placeholder="https://..."
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-black/40 border-white/20"
                      data-testid="input-website"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates Card */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Launch Template
                </CardTitle>
                <CardDescription>
                  Choose a deployment strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={cn(
                        "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-black/20 hover:border-white/30"
                      )}
                      data-testid={`template-${template.id}`}
                    >
                      {template.recommended && (
                        <Badge className="absolute -top-2 -right-2 bg-primary text-black text-[10px]">
                          Recommended
                        </Badge>
                      )}
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                        selectedTemplate === template.id ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
                      )}>
                        {template.icon}
                      </div>
                      <h4 className="text-white font-medium mb-1">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                      <p className="text-sm text-primary font-mono">
                        {template.initialBuy === 0 ? "No dev buy" : `${template.initialBuy} SOL initial`}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <Label className="text-white">Custom Initial Buy (SOL)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={initialBuy}
                      onChange={(e) => setInitialBuy(e.target.value)}
                      className="bg-black/40 border-white/20 font-mono"
                      data-testid="input-initial-buy"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="border-white/20">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            This is the amount of SOL you'll spend to buy your own token immediately after creation.
                            Set to 0 for a fair launch with no dev allocation.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview & Cost */}
          <div className="space-y-6">
            {/* Token Preview Card */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  Token Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-primary/10 to-black/40 rounded-lg p-6 border border-primary/20">
                  <div className="flex items-center gap-4 mb-4">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Token"
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-white/20">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {formData.name || "Token Name"}
                      </h3>
                      <p className="text-primary font-mono">
                        ${formData.symbol || "SYMBOL"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {formData.description || "Your token description will appear here..."}
                  </p>
                  {(formData.twitter || formData.telegram || formData.website) && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                      {formData.twitter && <Twitter className="h-4 w-4 text-muted-foreground" />}
                      {formData.telegram && <MessageCircle className="h-4 w-4 text-muted-foreground" />}
                      {formData.website && <Globe className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Deployment Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-white font-mono">~{DEPLOYMENT_COST_SOL} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Initial Buy</span>
                  <span className="text-white font-mono">{parseFloat(initialBuy) || 0} SOL</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-primary font-bold font-mono">~{totalCost.toFixed(3)} SOL</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deploy Button */}
            <Button
              onClick={handleDeployClick}
              disabled={isPreviewMode || isDeploying}
              className="w-full h-14 text-lg bg-primary text-black hover:bg-primary/90 font-bold"
              data-testid="button-deploy"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Deploying...
                </>
              ) : isPreviewMode ? (
                <>
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet to Deploy
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Deploy Token
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Deploying to Pump.fun on Solana Mainnet
            </p>
          </div>
        </div>

        {/* Powered by */}
        <div className="flex items-center justify-center gap-2 pt-12 pb-4">
          <span className="text-xs text-muted-foreground">Powered by</span>
          <a 
            href="https://pump.fun" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Rocket className="h-3.5 w-3.5" />
            Pump.fun
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Deployment History */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Your Deployment History
                </CardTitle>
                <CardDescription>
                  Tokens you've deployed with PumpLogic
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : deploymentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Rocket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No tokens deployed yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your deployed tokens will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deploymentHistory.map((deployment) => (
                      <div
                        key={deployment.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-white/10 hover:border-primary/30 transition-colors"
                        data-testid={`deployment-record-${deployment.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Rocket className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{deployment.tokenName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="text-primary font-mono">${deployment.tokenSymbol}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(deployment.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  onClick={() => copyToClipboard(deployment.mintAddress, "Contract address")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy contract address</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <a
                            href={`https://pump.fun/${deployment.mintAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
                          >
                            <Rocket className="h-4 w-4" />
                          </a>
                          <a
                            href={`https://solscan.io/tx/${deployment.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-black/95 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Confirm Deployment
            </DialogTitle>
            <DialogDescription>
              Please review your token details before deploying
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
              {imagePreview && (
                <img src={imagePreview} alt="Token" className="w-12 h-12 rounded-full object-cover" />
              )}
              <div>
                <p className="text-white font-bold">{formData.name}</p>
                <p className="text-primary font-mono">${formData.symbol}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Initial Buy</span>
                <span className="text-white font-mono">{parseFloat(initialBuy) || 0} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="text-primary font-mono font-bold">~{totalCost.toFixed(3)} SOL</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-500">
                  This action is irreversible. Make sure all details are correct before proceeding.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="border-white/20">
              Cancel
            </Button>
            <Button onClick={deployToken} className="bg-primary text-black hover:bg-primary/90">
              <Rocket className="mr-2 h-4 w-4" />
              Deploy Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-black/95 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Token Deployed Successfully!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              {imagePreview && (
                <img src={imagePreview} alt="Token" className="w-12 h-12 rounded-full object-cover" />
              )}
              <div>
                <p className="text-white font-bold">{formData.name}</p>
                <p className="text-primary font-mono">${formData.symbol}</p>
              </div>
            </div>

            {deploymentResult?.mintAddress && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Contract Address</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-black/40 border border-white/10 text-xs text-primary font-mono truncate">
                    {deploymentResult.mintAddress}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-white/20 shrink-0"
                    onClick={() => copyToClipboard(deploymentResult.mintAddress!, "Contract address")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://pump.fun/${deploymentResult?.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
              >
                <Rocket className="h-4 w-4" />
                <span className="text-sm">Pump.fun</span>
              </a>
              <a
                href={`https://solscan.io/tx/${deploymentResult?.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Solscan</span>
              </a>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-muted-foreground mb-3">Continue with PumpLogic tools:</p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`/guard?token=${deploymentResult?.mintAddress}`}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-black/40 border border-white/10 hover:border-primary/50 transition-colors"
                >
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-xs text-white">Guard</span>
                </a>
                <a
                  href={`/burn?token=${deploymentResult?.mintAddress}`}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-black/40 border border-white/10 hover:border-primary/50 transition-colors"
                >
                  <Flame className="h-5 w-5 text-primary" />
                  <span className="text-xs text-white">Burn</span>
                </a>
                <a
                  href="/app"
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-black/40 border border-white/10 hover:border-primary/50 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-xs text-white">Allocator</span>
                </a>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={resetForm} variant="outline" className="border-white/20">
              <RefreshCw className="mr-2 h-4 w-4" />
              Deploy Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
