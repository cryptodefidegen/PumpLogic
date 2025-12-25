import { Link, useLocation } from "wouter";
import { Wallet, Menu, X, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { isConnected, walletAddress, connect, disconnect } = useWallet();

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tighter">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-black">
            <Rocket className="h-5 w-5 fill-current" />
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
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Docs
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant={isConnected ? "outline" : "default"} 
            className={cn("font-mono text-xs", isConnected ? "border-primary text-primary hover:bg-primary/10" : "bg-primary text-black hover:bg-primary/90")}
            onClick={handleWalletClick}
            data-testid="button-connect-wallet"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isConnected ? walletAddress : "Connect Wallet"}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={toggleMenu}>
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
            <Button className="w-full bg-primary text-black" onClick={() => { handleWalletClick(); setIsOpen(false); }}>
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
