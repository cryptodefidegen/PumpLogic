import { ReactNode } from "react";
import { useMaintenanceMode } from "@/hooks/useFeatureFlag";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench, Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const ADMIN_WALLET = "9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8";

interface MaintenanceGuardProps {
  children: ReactNode;
}

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { isMaintenanceMode, isLoading } = useMaintenanceMode();
  const { walletAddress } = useWallet();
  
  const isAdmin = walletAddress === ADMIN_WALLET;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isMaintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-lg bg-black/60 border-yellow-500/30 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-4 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
                  <Wrench className="h-16 w-16 text-yellow-500 relative" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-yellow-500">
                Under Maintenance
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                We're making improvements to PumpLogic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      The platform is currently undergoing scheduled maintenance. 
                      All features are temporarily disabled to ensure a smooth upgrade process.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please check back soon. We'll be back online shortly.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Your funds and data are safe</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <a 
                    href="https://twitter.com/pumplogic" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Follow @pumplogic for updates
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
