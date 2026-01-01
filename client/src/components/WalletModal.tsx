import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet, ExternalLink } from "lucide-react";

export function WalletModal() {
  const { showWalletModal, setShowWalletModal, availableWallets, connect } = useWallet();

  const handleConnect = async (providerName: string) => {
    try {
      await connect(providerName);
    } catch (error) {
      console.error("Connection failed:", error);
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
          {availableWallets.length > 0 ? (
            availableWallets.map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="w-full h-14 justify-start gap-4 border-white/10 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => handleConnect(wallet.name)}
                data-testid={`button-connect-${wallet.name.toLowerCase()}`}
              >
                <img 
                  src={wallet.icon} 
                  alt={wallet.name} 
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300ff9d'%3E%3Cpath d='M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'/%3E%3C/svg%3E";
                  }}
                />
                <span className="text-white font-medium">{wallet.name}</span>
              </Button>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No wallets detected</p>
              <div className="space-y-2">
                <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-white/10">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Install Phantom
                  </Button>
                </a>
                <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-white/10">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Install Solflare
                  </Button>
                </a>
                <a href="https://www.backpack.app/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-white/10">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Install Backpack
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
