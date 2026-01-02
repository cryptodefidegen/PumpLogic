import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ApiProvider = "voidscreener" | "dexscreener";

interface ApiProviderContextType {
  provider: ApiProvider;
  setProvider: (provider: ApiProvider) => void;
  toggleProvider: () => void;
}

const ApiProviderContext = createContext<ApiProviderContextType | undefined>(undefined);

const STORAGE_KEY = "pumplogic_api_provider";

export function ApiProviderProvider({ children }: { children: ReactNode }) {
  const [provider, setProviderState] = useState<ApiProvider>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dexscreener" || stored === "voidscreener") {
        return stored;
      }
    }
    return "voidscreener";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, provider);
  }, [provider]);

  const setProvider = (newProvider: ApiProvider) => {
    setProviderState(newProvider);
  };

  const toggleProvider = () => {
    setProviderState((prev) => (prev === "voidscreener" ? "dexscreener" : "voidscreener"));
  };

  return (
    <ApiProviderContext.Provider value={{ provider, setProvider, toggleProvider }}>
      {children}
    </ApiProviderContext.Provider>
  );
}

export function useApiProvider() {
  const context = useContext(ApiProviderContext);
  if (context === undefined) {
    throw new Error("useApiProvider must be used within an ApiProviderProvider");
  }
  return context;
}
