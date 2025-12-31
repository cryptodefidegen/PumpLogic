import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const PUMPLOGIC_TOKEN = "63k7noZHAPfxnwzq4wGHJG4kksT7enoT2ua3shQ2pump";

export function TokenGateOverlay() {
  const { tokenGate, isTokenGateLoading, refreshTokenGate } = useWallet();

  if (!tokenGate || tokenGate.allowed) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-950 border border-red-500/30 rounded-2xl p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Token Gate Required</h2>
        <p className="text-muted-foreground mb-6">
          You need to hold at least <span className="text-primary font-bold">${tokenGate.minRequired}</span> worth of $PUMPLOGIC tokens to access the dashboard.
        </p>

        <div className="bg-black/50 rounded-xl p-4 mb-6 border border-white/5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Your Balance</div>
              <div className="text-white font-mono font-bold">
                {formatNumber(tokenGate.tokenBalance)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Token Price</div>
              <div className="text-white font-mono font-bold">
                ${tokenGate.tokenPriceUsd.toFixed(8)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Your Value</div>
              <div className={`font-mono font-bold ${tokenGate.valueUsd >= tokenGate.minRequired ? 'text-primary' : 'text-red-400'}`}>
                ${tokenGate.valueUsd.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Required</div>
              <div className="text-primary font-mono font-bold">
                ${tokenGate.minRequired}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`https://pump.fun/coin/${PUMPLOGIC_TOKEN}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-primary text-black hover:bg-primary/90 font-bold">
              <ExternalLink className="w-4 h-4 mr-2" />
              Buy $PUMPLOGIC on Pump.fun
            </Button>
          </a>

          <Button
            variant="outline"
            className="w-full border-white/20 hover:bg-white/5"
            onClick={refreshTokenGate}
            disabled={isTokenGateLoading}
          >
            {isTokenGateLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            I've bought tokens - Check again
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          This protects the platform and ensures committed users. Token gate checks are performed in real-time using Jupiter price feeds.
        </p>
      </motion.div>
    </motion.div>
  );
}
