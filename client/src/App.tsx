import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/contexts/WalletContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Docs from "@/pages/docs";
import TelegramDocs from "@/pages/telegram-docs";
import Roadmap from "@/pages/roadmap";
import Analytics from "@/pages/analytics";
import Guard from "@/pages/guard";
import { Navbar } from "@/components/layout/Navbar";
import { WalletModal } from "@/components/WalletModal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/app" component={Dashboard} />
      <Route path="/docs" component={Docs} />
      <Route path="/docs/telegram" component={TelegramDocs} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/guard" component={Guard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
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
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
