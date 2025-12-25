import { Link, useLocation } from "wouter";
import { Wallet, Menu, X, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

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
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-black">
            <ArrowUpDown className="h-5 w-5" />
          </div>
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
            href="/docs" 
            className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/docs" ? "text-primary" : "text-muted-foreground")}
          >
            Docs
          </Link>
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
            <Link href="/docs" className="text-sm font-medium text-white hover:text-primary" onClick={() => setIsOpen(false)}>
              Docs
            </Link>
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
