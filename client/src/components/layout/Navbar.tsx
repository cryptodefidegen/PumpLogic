import { Link, useLocation } from "wouter";
import { Wallet, Menu, X, Loader2, MessageCircle, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/generated_images/pump_logic_logo.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location] = useLocation();
  const { isConnected, walletAddress, connect, disconnect, isPhantomInstalled } = useWallet();
  const { toast } = useToast();

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
        await connect();
        toast({
          title: "Wallet Connected",
          description: "Your Phantom wallet has been connected successfully!",
          className: "bg-primary text-black font-bold"
        });
      } catch (error: any) {
        console.error("Failed to connect wallet:", error);
        
        if (!isPhantomInstalled) {
          toast({
            variant: "destructive",
            title: "Phantom Not Found",
            description: "Please install Phantom wallet from phantom.app",
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
            className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/app" ? "text-primary" : "text-muted-foreground")}
          >
            App
          </Link>
          <Link 
            href="/analytics" 
            className={cn("text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5", location === "/analytics" ? "text-primary" : "text-muted-foreground")}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
          <Link 
            href="/docs" 
            className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/docs" ? "text-primary" : "text-muted-foreground")}
          >
            Docs
          </Link>
          <Link 
            href="/roadmap" 
            className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/roadmap" ? "text-primary" : "text-muted-foreground")}
          >
            Roadmap
          </Link>
          <div className="flex items-center gap-1.5 text-sm font-medium text-blue-400 cursor-default">
            <Target className="h-4 w-4" />
            <span>Sniper</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500/20 border border-blue-500/50 rounded-full">SOON</span>
          </div>
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
              <MessageCircle className="h-4 w-4" />
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
            {isLoading ? "Connecting..." : isConnected ? walletAddress : "Connect Wallet"}
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
            <Link href="/app" className="text-sm font-medium text-white hover:text-primary" onClick={() => setIsOpen(false)}>
              App
            </Link>
            <Link href="/analytics" className="text-sm font-medium text-white hover:text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link href="/docs" className="text-sm font-medium text-white hover:text-primary" onClick={() => setIsOpen(false)}>
              Docs
            </Link>
            <Link href="/roadmap" className="text-sm font-medium text-white hover:text-primary" onClick={() => setIsOpen(false)}>
              Roadmap
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
              <Target className="h-4 w-4" />
              <span>Sniper</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500/20 border border-blue-500/50 rounded-full">COMING SOON</span>
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
                <MessageCircle className="h-4 w-4" />
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
