import { Link, useLocation } from "wouter";
import { Wallet, Menu, X, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [isConnected, setIsConnected] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 font-display text-xl font-bold tracking-tighter">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-black">
              <Rocket className="h-5 w-5 fill-current" />
            </div>
            <span className="text-white">Launch<span className="text-primary">Logic</span></span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/">
            <a className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/" ? "text-primary" : "text-muted-foreground")}>
              Home
            </a>
          </Link>
          <Link href="/app">
            <a className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/app" ? "text-primary" : "text-muted-foreground")}>
              App
            </a>
          </Link>
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Docs
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant={isConnected ? "outline" : "default"} 
            className={cn("font-mono text-xs", isConnected ? "border-primary text-primary hover:bg-primary/10" : "bg-primary text-black hover:bg-primary/90")}
            onClick={() => setIsConnected(!isConnected)}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isConnected ? "86Zn...pump" : "Connect Wallet"}
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
            <Link href="/">
              <a className="text-sm font-medium text-white hover:text-primary" onClick={() => setIsOpen(false)}>Home</a>
            </Link>
            <Link href="/app">
              <a className="text-sm font-medium text-white hover:text-primary" onClick={() => setIsOpen(false)}>App</a>
            </Link>
            <Button className="w-full bg-primary text-black" onClick={() => { setIsConnected(!isConnected); setIsOpen(false); }}>
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
