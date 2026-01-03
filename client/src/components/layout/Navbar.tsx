import { Link, useLocation } from "wouter";
import { Wallet, Menu, X, Loader2, Target, BarChart3, Shield, Sliders, Flame, FileText, ToggleLeft, ToggleRight, Rocket, Home, ChevronDown, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { useApiProvider } from "@/contexts/ApiProviderContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@assets/generated_images/pump_logic_logo.png";

const ADMIN_WHITELIST = ["9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8"];
const API_TOGGLE_WHITELIST = ["9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8"];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location] = useLocation();
  const { isConnected, walletAddress, user, connect, disconnect, availableWallets, connectedWallet, setShowWalletModal, solBalance } = useWallet();
  const { toast } = useToast();
  const { provider, toggleProvider } = useApiProvider();
  
  const canToggleApi = user?.walletAddress && API_TOGGLE_WHITELIST.includes(user.walletAddress);
  const isAdmin = user?.walletAddress && ADMIN_WHITELIST.includes(user.walletAddress);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } else {
      setIsLoading(true);
      try {
        const result = await connect();
        if (result === null) {
          setIsLoading(false);
          return;
        }
        toast({
          title: "Wallet Connected",
          description: `Your ${result.walletName} wallet has been connected successfully!`,
          className: "bg-primary text-black font-bold"
        });
      } catch (error: any) {
        console.error("Failed to connect wallet:", error);
        
        if (availableWallets.length === 0) {
          toast({
            variant: "destructive",
            title: "No Wallet Found",
            description: "Please install Phantom, Solflare, or Backpack wallet",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Connection Failed",
            description: error.message || "Failed to connect wallet. Please try again.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tighter">
          <img src={logoImage} alt="PumpLogic" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-white">Pump<span className="text-primary">Logic</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={cn("text-base font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/" ? "text-primary" : "text-muted-foreground")}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          
          {/* Products Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "text-base font-medium transition-colors hover:text-primary flex items-center gap-1.5 outline-none",
              ["/deployer", "/app", "/analytics", "/guard", "/burn"].includes(location) ? "text-primary" : "text-muted-foreground"
            )}>
              <Package className="h-4 w-4" />
              Products
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-black/95 border-white/10 backdrop-blur-xl">
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-primary">
                <Link href="/deployer" className="flex items-center gap-2 w-full">
                  <Rocket className="h-4 w-4" />
                  Deployer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-primary">
                <Link href="/app" className="flex items-center gap-2 w-full">
                  <Sliders className="h-4 w-4" />
                  Allocator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-primary">
                <Link href="/analytics" className="flex items-center gap-2 w-full">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-primary">
                <Link href="/guard" className="flex items-center gap-2 w-full">
                  <Shield className="h-4 w-4" />
                  Guard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-primary">
                <Link href="/burn" className="flex items-center gap-2 w-full">
                  <Flame className="h-4 w-4" />
                  Burn
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link 
            href="/roadmap" 
            className={cn("text-base font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/roadmap" ? "text-primary" : "text-muted-foreground")}
          >
            <Target className="h-4 w-4" />
            Roadmap
          </Link>
          <Link 
            href="/docs" 
            className={cn("text-base font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/docs" ? "text-primary" : "text-muted-foreground")}
          >
            <FileText className="h-4 w-4" />
            Docs
          </Link>
          {isAdmin && (
            <Link 
              href="/admin" 
              className={cn("text-base font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/admin" ? "text-primary" : "text-muted-foreground")}
              data-testid="link-admin"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          )}
          <div className="flex items-center gap-3 ml-2 border-l border-white/10 pl-4">
            <a 
              href="https://x.com/i/communities/2004770032832929819" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              title="X Community"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a 
              href="https://t.me/PumpLogicSol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Telegram"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {canToggleApi && (
            <button
              onClick={() => {
                toggleProvider();
                toast({
                  title: "API Provider Changed",
                  description: `Switched to ${provider === 'voidscreener' ? 'DexScreener' : 'VoidScreener'}`,
                  className: "bg-primary text-black font-bold"
                });
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-black/40 hover:bg-white/10 transition-colors text-xs font-medium"
              title={`Current: ${provider === 'voidscreener' ? 'VoidScreener' : 'DexScreener'} - Click to switch`}
              data-testid="button-api-toggle"
            >
              {provider === 'voidscreener' ? (
                <ToggleRight className="h-4 w-4 text-primary" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-blue-400" />
              )}
              <span className={provider === 'voidscreener' ? 'text-primary' : 'text-blue-400'}>
                {provider === 'voidscreener' ? 'Void' : 'Dex'}
              </span>
            </button>
          )}
          {isConnected && solBalance !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-black/40 text-xs font-mono" data-testid="text-sol-balance">
              <span className="text-primary font-bold">{solBalance.toFixed(4)}</span>
              <span className="text-muted-foreground">SOL</span>
            </div>
          )}
          <Button 
            variant={isConnected ? "outline" : "default"} 
            className={cn("font-mono text-xs", isConnected ? "border-primary text-primary hover:bg-primary/10" : "bg-primary text-black hover:bg-primary/90")}
            onClick={handleWalletClick}
            disabled={isLoading}
            data-testid="button-connect-wallet"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Connecting..." : isConnected && walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={toggleMenu} data-testid="button-mobile-menu">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-b border-white/5 bg-black/95 backdrop-blur-xl">
          <div className="container px-4 py-4 flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <Home className="h-4 w-4" />
              Home
            </Link>
            
            {/* Products Section */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                <Package className="h-3 w-3" />
                Products
              </div>
              <div className="flex flex-col gap-3 pl-2">
                <Link href="/deployer" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Rocket className="h-4 w-4" />
                  Deployer
                </Link>
                <Link href="/app" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Sliders className="h-4 w-4" />
                  Allocator
                </Link>
                <Link href="/analytics" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
                <Link href="/guard" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Shield className="h-4 w-4" />
                  Guard
                </Link>
                <Link href="/burn" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Flame className="h-4 w-4" />
                  Burn
                </Link>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
              <Link href="/roadmap" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Target className="h-4 w-4" />
                Roadmap
              </Link>
              <Link href="/docs" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <FileText className="h-4 w-4" />
                Docs
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-white/10">
              <a 
                href="https://x.com/i/communities/2004770032832929819" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span className="text-sm">X Community</span>
              </a>
              <a 
                href="https://t.me/PumpLogicSol" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                <span className="text-sm">Telegram</span>
              </a>
            </div>
            {isConnected && solBalance !== null && (
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-white/20 bg-black/40 text-sm font-mono">
                <span className="text-primary font-bold">{solBalance.toFixed(4)}</span>
                <span className="text-muted-foreground">SOL</span>
              </div>
            )}
            <Button 
              className="w-full bg-primary text-black" 
              onClick={() => { handleWalletClick(); setIsOpen(false); }}
              disabled={isLoading}
              data-testid="button-mobile-connect"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnected ? "Disconnect" : "Connect Wallet"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
