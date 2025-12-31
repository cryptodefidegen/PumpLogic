import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authenticateWallet, checkTokenGate, type TokenGateResult } from "@/lib/api";
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
  tokenGate: TokenGateResult | null;
  isTokenGateLoading: boolean;
  refreshTokenGate: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [fullWalletAddress, setFullWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);
  const [tokenGate, setTokenGate] = useState<TokenGateResult | null>(null);
  const [isTokenGateLoading, setIsTokenGateLoading] = useState(false);

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
          // Also check token gate for restored sessions
          checkGateWithBlocking(savedWallet);
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

  const checkGateWithBlocking = async (address: string) => {
    setIsTokenGateLoading(true);
    try {
      const result = await checkTokenGate(address);
      setTokenGate(result);
      return result;
    } catch (error) {
      console.error("Failed to check token gate:", error);
      // On error, set a blocked state to prevent access
      setTokenGate({
        allowed: false,
        reason: "Failed to verify token holdings. Please try again.",
        tokenBalance: 0,
        tokenPriceUsd: 0,
        valueUsd: 0,
        minRequired: 50,
        isWhitelisted: false,
      });
      return null;
    } finally {
      setIsTokenGateLoading(false);
    }
  };

  const refreshTokenGate = async () => {
    if (fullWalletAddress) {
      await checkGateWithBlocking(fullWalletAddress);
    }
  };

  const restoreConnection = async (address: string) => {
    try {
      const authenticatedUser = await authenticateWallet(address);
      setWalletAddress(address);
      setFullWalletAddress(address);
      setUser(authenticatedUser);
      setIsConnected(true);
      localStorage.setItem("wallet_address", address);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      
      await checkGateWithBlocking(address);
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
      
      // Save to localStorage
      localStorage.setItem("wallet_address", address);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      
      // Check token gate
      await checkGateWithBlocking(address);
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
    setFullWalletAddress(null);
    setIsConnected(false);
    setTokenGate(null);
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
      fullWalletAddress,
      isPhantomInstalled,
      tokenGate,
      isTokenGateLoading,
      refreshTokenGate,
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
