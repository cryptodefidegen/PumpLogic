import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authenticateWallet } from "@/lib/api";
import type { User } from "@shared/schema";

interface WalletProvider {
  name: string;
  icon: string;
  provider: any;
}

declare global {
  interface Window {
    solana?: any;
    phantom?: { solana?: any };
    solflare?: any;
    backpack?: any;
    coinbaseSolana?: any;
  }
}

interface WalletContextType {
  user: User | null;
  isConnected: boolean;
  connect: (providerName?: string) => Promise<{ address: string; walletName: string } | null>;
  disconnect: () => void;
  walletAddress: string | null;
  fullWalletAddress: string | null;
  availableWallets: WalletProvider[];
  connectedWallet: string | null;
  showWalletModal: boolean;
  setShowWalletModal: (show: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function getAvailableWallets(): WalletProvider[] {
  const wallets: WalletProvider[] = [];

  if (window.phantom?.solana?.isPhantom || window.solana?.isPhantom) {
    wallets.push({
      name: "Phantom",
      icon: "https://phantom.app/img/phantom-icon-purple.svg",
      provider: window.phantom?.solana || window.solana,
    });
  }

  if (window.solflare?.isSolflare) {
    wallets.push({
      name: "Solflare",
      icon: "https://solflare.com/favicon.ico",
      provider: window.solflare,
    });
  }

  if (window.backpack) {
    wallets.push({
      name: "Backpack",
      icon: "https://www.backpack.app/favicon.ico",
      provider: window.backpack,
    });
  }

  return wallets;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [fullWalletAddress, setFullWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    const detectWallets = () => {
      const wallets = getAvailableWallets();
      setAvailableWallets(wallets);

      const savedWallet = localStorage.getItem("wallet_address");
      const savedUser = localStorage.getItem("user");
      const savedProvider = localStorage.getItem("wallet_provider");

      if (savedWallet && savedUser && savedProvider) {
        const providerExists = wallets.some(w => w.name === savedProvider);
        
        if (providerExists) {
          setWalletAddress(savedWallet);
          setFullWalletAddress(savedWallet);
          setUser(JSON.parse(savedUser));
          setIsConnected(true);
          setConnectedWallet(savedProvider);
        } else {
          localStorage.removeItem("wallet_address");
          localStorage.removeItem("user");
          localStorage.removeItem("wallet_provider");
        }
      }
    };

    if (document.readyState === "complete") {
      detectWallets();
    } else {
      window.addEventListener("load", detectWallets);
    }
    
    setTimeout(detectWallets, 500);
    setTimeout(detectWallets, 1500);

    return () => {
      window.removeEventListener("load", detectWallets);
    };
  }, []);

  const connect = async (providerName?: string): Promise<{ address: string; walletName: string } | null> => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);

    if (wallets.length === 0) {
      window.open("https://phantom.app/", "_blank");
      throw new Error("No Solana wallet detected. Please install Phantom, Solflare, or Backpack.");
    }

    if (!providerName && wallets.length > 1) {
      setShowWalletModal(true);
      return null;
    }

    const wallet = providerName 
      ? wallets.find(w => w.name === providerName) 
      : wallets[0];

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    try {
      const response = await wallet.provider.connect();
      const address = response.publicKey.toString();
      
      const authenticatedUser = await authenticateWallet(address);
      
      setWalletAddress(address);
      setFullWalletAddress(address);
      setUser(authenticatedUser);
      setIsConnected(true);
      setConnectedWallet(wallet.name);
      setShowWalletModal(false);
      
      localStorage.setItem("wallet_address", address);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      localStorage.setItem("wallet_provider", wallet.name);

      wallet.provider.on?.("disconnect", () => {
        disconnect();
      });

      return { address, walletName: wallet.name };
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    const wallet = availableWallets.find(w => w.name === connectedWallet);
    if (wallet?.provider?.disconnect) {
      wallet.provider.disconnect();
    }
    
    setUser(null);
    setWalletAddress(null);
    setFullWalletAddress(null);
    setIsConnected(false);
    setConnectedWallet(null);
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("user");
    localStorage.removeItem("wallet_provider");
  };

  return (
    <WalletContext.Provider value={{
      user,
      isConnected,
      connect,
      disconnect,
      walletAddress,
      fullWalletAddress,
      availableWallets,
      connectedWallet,
      showWalletModal,
      setShowWalletModal,
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
