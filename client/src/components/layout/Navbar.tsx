import { Link, useLocation } from "wouter";
import { Wallet, Menu, X, Loader2, Target, BarChart3, Shield, Sliders, Flame, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/generated_images/pump_logic_logo.png";

const GUARD_WHITELIST = ["9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8"];
const BURN_WHITELIST = ["9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8"];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location] = useLocation();
  const { isConnected, walletAddress, user, connect, disconnect, availableWallets, connectedWallet, setShowWalletModal } = useWallet();
  const { toast } = useToast();
  
  const isGuardWhitelisted = user?.walletAddress && GUARD_WHITELIST.includes(user.walletAddress);
  const isBurnWhitelisted = user?.walletAddress && BURN_WHITELIST.includes(user.walletAddress);

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
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/" ? "text-primary" : "text-muted-foreground")}
          >
            Home
          </Link>
          <Link 
            href="/app" 
            className={cn("text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/app" ? "text-primary" : "text-muted-foreground")}
          >
            <Sliders className="h-4 w-4" />
            Allocator
          </Link>
          <Link 
            href="/analytics" 
            className={cn("text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/analytics" ? "text-primary" : "text-muted-foreground")}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          {isGuardWhitelisted ? (
            <Link 
              href="/guard" 
              className={cn("text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/guard" ? "text-primary" : "text-muted-foreground")}
            >
              <Shield className="h-4 w-4" />
              Guard
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 border border-primary/50 rounded-full text-primary">BETA</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
              <Shield className="h-4 w-4" />
              Guard
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/10 border border-white/20 rounded-full">SOON</span>
            </div>
          )}
          {isBurnWhitelisted ? (
            <Link 
              href="/burn" 
              className={cn("text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/burn" ? "text-primary" : "text-muted-foreground")}
            >
              <Flame className="h-4 w-4 text-primary" />
              Burn
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 border border-primary/50 rounded-full text-primary">BETA</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
              <Flame className="h-4 w-4 text-primary" />
              Burn
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/10 border border-white/20 rounded-full">SOON</span>
            </div>
          )}
          <Link 
            href="/roadmap" 
            className={cn("text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/roadmap" ? "text-primary" : "text-muted-foreground")}
          >
            <Target className="h-4 w-4" />
            Roadmap
          </Link>
          <Link 
            href="/docs" 
            className={cn("text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/docs" ? "text-primary" : "text-muted-foreground")}
          >
            <FileText className="h-4 w-4" />
            Docs
          </Link>
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
            <Link href="/" className="text-sm font-medium text-white hover:text-primary" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/app" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <Sliders className="h-4 w-4" />
              Allocator
            </Link>
            <Link href="/analytics" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            {isGuardWhitelisted ? (
              <Link href="/guard" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Shield className="h-4 w-4" />
                Guard
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 border border-primary/50 rounded-full text-primary">BETA</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/50">
                <Shield className="h-4 w-4" />
                Guard
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/10 border border-white/20 rounded-full">SOON</span>
              </div>
            )}
            {isBurnWhitelisted ? (
              <Link href="/burn" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Flame className="h-4 w-4 text-primary" />
                Burn
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 border border-primary/50 rounded-full text-primary">BETA</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/50">
                <Flame className="h-4 w-4 text-primary" />
                Burn
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/10 border border-white/20 rounded-full">SOON</span>
              </div>
            )}
            <Link href="/roadmap" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <Target className="h-4 w-4" />
              Roadmap
            </Link>
            <Link href="/docs" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <FileText className="h-4 w-4" />
              Docs
            </Link>
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
