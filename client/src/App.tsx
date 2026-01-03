import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/contexts/WalletContext";
import { ApiProviderProvider } from "@/contexts/ApiProviderContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Docs from "@/pages/docs";
import TelegramDocs from "@/pages/telegram-docs";
import Roadmap from "@/pages/roadmap";
import Analytics from "@/pages/analytics";
import Guard from "@/pages/guard";
import { lazy, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";

const Burn = lazy(() => import("@/pages/burn"));
const Deployer = lazy(() => import("@/pages/deployer"));
const Admin = lazy(() => import("@/pages/admin"));
import { WalletModal } from "@/components/WalletModal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/app">
        {() => (
          <MaintenanceGuard featureKey="dashboard">
            <Dashboard />
          </MaintenanceGuard>
        )}
      </Route>
      <Route path="/docs" component={Docs} />
      <Route path="/docs/telegram" component={TelegramDocs} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/analytics">
        {() => (
          <MaintenanceGuard featureKey="analytics">
            <Analytics />
          </MaintenanceGuard>
        )}
      </Route>
      <Route path="/guard">
        {() => (
          <MaintenanceGuard featureKey="guard">
            <Guard />
          </MaintenanceGuard>
        )}
      </Route>
      <Route path="/burn">
        {() => (
          <MaintenanceGuard featureKey="burn">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-primary">Loading...</div></div>}>
              <Burn />
            </Suspense>
          </MaintenanceGuard>
        )}
      </Route>
      <Route path="/deployer">
        {() => (
          <MaintenanceGuard featureKey="deployer">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-primary">Loading...</div></div>}>
              <Deployer />
            </Suspense>
          </MaintenanceGuard>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-primary">Loading...</div></div>}>
            <Admin />
          </Suspense>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <ApiProviderProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
              <Toaster />
              <WalletModal />
            </div>
          </TooltipProvider>
        </ApiProviderProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
