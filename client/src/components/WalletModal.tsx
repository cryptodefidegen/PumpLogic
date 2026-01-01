import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet, ExternalLink, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALL_WALLETS = [
  {
    name: "Phantom",
    icon: "https://phantom.app/img/phantom-logo.svg",
    url: "https://phantom.app/"
  },
  {
    name: "Solflare",
    icon: "https://solflare.com/favicon.ico",
    url: "https://solflare.com/"
  },
  {
    name: "Backpack",
    icon: "https://backpack.app/favicon.ico",
    url: "https://www.backpack.app/"
  }
];

export function WalletModal() {
  const { showWalletModal, setShowWalletModal, availableWallets, connect } = useWallet();
  const { toast } = useToast();

  const installedWalletNames = availableWallets.map(w => w.name);

  const handleConnect = async (providerName: string) => {
    try {
      const result = await connect(providerName);
      if (result) {
        toast({
          title: "Wallet Connected",
          description: `Your ${result.walletName} wallet has been connected successfully!`,
          className: "bg-primary text-black font-bold"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
      });
    }
  };

  return (
    <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
      <DialogContent className="bg-black/95 border-white/10 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-center flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {ALL_WALLETS.map((wallet) => {
            const isInstalled = installedWalletNames.includes(wallet.name);
            const installedWallet = availableWallets.find(w => w.name === wallet.name);
            
            if (isInstalled && installedWallet) {
              return (
                <Button
                  key={wallet.name}
                  variant="outline"
                  className="w-full h-14 justify-between gap-4 border-white/10 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => handleConnect(wallet.name)}
                  data-testid={`button-connect-${wallet.name.toLowerCase()}`}
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={installedWallet.icon} 
                      alt={wallet.name} 
                      className="w-8 h-8 rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300ff9d'%3E%3Cpath d='M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'/%3E%3C/svg%3E";
                      }}
                    />
                    <span className="text-white font-medium">{wallet.name}</span>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">Detected</span>
                </Button>
              );
            } else {
              return (
                <a 
                  key={wallet.name}
                  href={wallet.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-between gap-4 border-white/10 hover:border-white/20 opacity-60 hover:opacity-80"
                    data-testid={`button-install-${wallet.name.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground font-medium">{wallet.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Download className="h-3 w-3" />
                      <span>Get</span>
                    </div>
                  </Button>
                </a>
              );
            }
          })}
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          Don't have a wallet? Click "Get" to install one.
        </p>
      </DialogContent>
    </Dialog>
  );
}
