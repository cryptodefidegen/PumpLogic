import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authenticateWallet } from "@/lib/api";
import type { User } from "@shared/schema";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: () => void) => void;
      off: (event: string, callback: () => void) => void;
      publicKey?: { toString: () => string };
      isConnected?: boolean;
    };
  }
}

interface WalletContextType {
  user: User | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  walletAddress: string | null;
  isPhantomInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

  useEffect(() => {
    // Check if Phantom is installed
    const checkPhantom = () => {
      const isInstalled = window.solana?.isPhantom || false;
      setIsPhantomInstalled(isInstalled);
      
      // Check if already connected
      if (isInstalled && window.solana?.isConnected && window.solana?.publicKey) {
        const address = window.solana.publicKey.toString();
        restoreConnection(address);
      } else {
        // Check localStorage for saved session
        const savedWallet = localStorage.getItem("wallet_address");
        const savedUser = localStorage.getItem("user");
        if (savedWallet && savedUser) {
          setWalletAddress(savedWallet);
          setUser(JSON.parse(savedUser));
          setIsConnected(true);
        }
      }
    };

    // Wait for Phantom to inject into window
    if (window.solana?.isPhantom) {
      checkPhantom();
    } else {
      window.addEventListener("load", checkPhantom);
      // Also check after a short delay in case it's slow to inject
      setTimeout(checkPhantom, 500);
    }

    return () => {
      window.removeEventListener("load", checkPhantom);
    };
  }, []);

  const restoreConnection = async (address: string) => {
    try {
      const authenticatedUser = await authenticateWallet(address);
      setWalletAddress(address);
      setUser(authenticatedUser);
      setIsConnected(true);
      localStorage.setItem("wallet_address", address);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error("Failed to restore connection:", error);
    }
  };

  const connect = async () => {
    // Check if Phantom is installed
    if (!window.solana?.isPhantom) {
      // Open Phantom website if not installed
      window.open("https://phantom.app/", "_blank");
      throw new Error("Phantom wallet is not installed. Please install it from phantom.app");
    }

    try {
      // Request connection to Phantom
      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      
      // Authenticate with backend
      const authenticatedUser = await authenticateWallet(address);
      
      setWalletAddress(address);
      setUser(authenticatedUser);
      setIsConnected(true);
      
      // Save to localStorage
      localStorage.setItem("wallet_address", address);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      throw new Error(error.message || "Failed to connect to Phantom wallet");
    }
  };

  const disconnect = async () => {
    try {
      // Disconnect from Phantom if available
      if (window.solana?.isPhantom) {
        await window.solana.disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
    
    setUser(null);
    setWalletAddress(null);
    setIsConnected(false);
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("user");
  };

  // Format wallet address for display (first 4 and last 4 characters)
  const formatAddress = (address: string | null) => {
    if (!address) return null;
    if (address.length <= 10) return address;
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <WalletContext.Provider value={{ 
      user, 
      isConnected, 
      connect, 
      disconnect, 
      walletAddress: formatAddress(walletAddress),
      isPhantomInstalled 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
