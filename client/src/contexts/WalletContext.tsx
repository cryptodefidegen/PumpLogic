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
      signTransaction: (tx: any) => Promise<any>;
      signAndSendTransaction: (tx: any) => Promise<{ signature: string }>;
    };
  }
}

interface WalletContextType {
  user: User | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  walletAddress: string | null;
  fullWalletAddress: string | null;
  isPhantomInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [fullWalletAddress, setFullWalletAddress] = useState<string | null>(null);
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
          setFullWalletAddress(savedWallet);
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
      setFullWalletAddress(address);
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
      setFullWalletAddress(address);
      setUser(authenticatedUser);
      setIsConnected(true);
      
      // Save to localStorage for persistence
      localStorage.setItem("wallet_address", address);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      
      // Listen for disconnect events
      window.solana.on("disconnect", () => {
        disconnect();
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    if (window.solana) {
      window.solana.disconnect();
    }
    setUser(null);
    setWalletAddress(null);
    setFullWalletAddress(null);
    setIsConnected(false);
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("user");
  };

  return (
    <WalletContext.Provider value={{
      user,
      isConnected,
      connect,
      disconnect,
      walletAddress,
      fullWalletAddress,
      isPhantomInstalled,
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
