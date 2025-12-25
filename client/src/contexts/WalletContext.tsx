import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authenticateWallet } from "@/lib/api";
import type { User } from "@shared/schema";

interface WalletContextType {
  user: User | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  walletAddress: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if wallet was previously connected
    const savedWallet = localStorage.getItem("wallet_address");
    const savedUser = localStorage.getItem("user");
    
    if (savedWallet && savedUser) {
      setWalletAddress(savedWallet);
      setUser(JSON.parse(savedUser));
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    try {
      // Simulate wallet connection - in production, this would use @solana/wallet-adapter
      // For now, generate a random wallet address for demo
      const simulatedWallet = `${Math.random().toString(36).substring(2, 10)}...pump`;
      
      // Authenticate with backend
      const authenticatedUser = await authenticateWallet(simulatedWallet);
      
      setWalletAddress(simulatedWallet);
      setUser(authenticatedUser);
      setIsConnected(true);
      
      // Save to localStorage
      localStorage.setItem("wallet_address", simulatedWallet);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setUser(null);
    setWalletAddress(null);
    setIsConnected(false);
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("user");
  };

  return (
    <WalletContext.Provider value={{ user, isConnected, connect, disconnect, walletAddress }}>
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
