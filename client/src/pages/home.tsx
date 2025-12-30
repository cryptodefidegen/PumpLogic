import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, RefreshCw, Coins, MessageCircle, Copy, Target, Crosshair, Shield, BarChart3, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  
  const copyContractAddress = () => {
    navigator.clipboard.writeText("63k7noZHAPfxnwzq4wGHJG4kksT7enoT2ua3shQ2pump");
    toast({
      title: "Copied!",
      description: "Contract address copied to clipboard",
      className: "bg-primary text-black font-bold"
    });
  };
  
  return (
    <div className="min-h-screen text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 container mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-4xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Built for Solana Creators
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Smart fee routing <br /> for token creators
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Automate your token fee distribution with intelligent allocation across trading, burns, liquidity pools, and creator rewards.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/app">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary text-black hover:bg-primary/90 rounded-full font-bold">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/5 rounded-full">
                View Docs
              </Button>
            </Link>
          </div>

          {/* Contract Address */}
          <div className="flex justify-center pt-6">
            <div className="bg-black/60 border border-primary/30 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-center gap-3">
              <span className="text-primary font-mono text-sm truncate max-w-[180px] sm:max-w-[280px]">
                63k7noZHAPfxnwzq4wGHJG4kksT7enoT2ua3shQ2pump
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/50 text-primary hover:bg-primary hover:text-black shrink-0"
                  onClick={copyContractAddress}
                  data-testid="button-copy-ca-home"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy CA
                </Button>
                <a 
                  href="https://pump.fun/coin/63k7noZHAPfxnwzq4wGHJG4kksT7enoT2ua3shQ2pump" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/50 text-primary hover:bg-primary hover:text-black shrink-0"
                    data-testid="button-buy-pumpfun"
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Buy
                  </Button>
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto border-t border-white/5 mt-12">
            <div>
              <div className="text-3xl font-bold font-mono text-white">4</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Distribution Paths</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white">100%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">On-Chain</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white">AI</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Powered</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white">Instant</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Execution</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black/50 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-mono text-primary uppercase tracking-widest mb-2">The Process</h2>
            <h3 className="text-3xl md:text-4xl font-bold font-display text-white">Four allocation categories</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<TrendingUp className="h-8 w-8 text-primary" />}
              title="Market Making"
              desc="Allocate funds to enhance trading depth and maintain healthy order books."
            />
            <FeatureCard 
              icon={<RefreshCw className="h-8 w-8 text-secondary" />}
              title="Buyback"
              desc="Repurchase tokens from the market to support price and reduce supply."
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-blue-400" />}
              title="Liquidity Pool"
              desc="Strengthen your token's liquidity by contributing to decentralized pools."
            />
            <FeatureCard 
              icon={<Coins className="h-8 w-8 text-yellow-400" />}
              title="Creator Revenue"
              desc="Receive a portion of fees to support ongoing project development."
            />
          </div>
        </div>
      </section>

      {/* Coming Soon - PumpLogic Sniper */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-primary/10 border border-blue-500/30 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            {/* Coming Soon Badge */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 text-sm font-bold animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                </span>
                COMING SOON
              </span>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Icon/Logo */}
              <div className="shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/50 flex items-center justify-center">
                  <Target className="w-12 h-12 md:w-16 md:h-16 text-blue-400" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold font-display mb-3">
                  <span className="text-white">PumpLogic</span>{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Sniper</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-xl">
                  Lightning-fast token launch sniping tool. Get in early on the hottest Pump.fun launches with sub-second execution.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Crosshair className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Sub-second alerts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
                    <span>Auto-snipe presets</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Shield className="h-4 w-4 text-green-400 shrink-0" />
                    <span>Risk controls</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <BarChart3 className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>PnL tracking</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <a href="https://t.me/PumpLogicSol" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Join Waitlist
                    </Button>
                  </a>
                  <Link href="/roadmap">
                    <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 rounded-full px-6">
                      View Roadmap
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-32 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          
          <h2 className="text-4xl font-bold font-display mb-6">Take control of your fees</h2>
          <p className="text-xl text-muted-foreground mb-8">Connect your wallet and start optimizing your token's fee distribution today.</p>
          
          <Link href="/app">
            <Button size="lg" className="h-14 px-8 text-lg bg-primary text-black hover:bg-primary/90 rounded-full font-bold shadow-[0_0_20px_rgba(0,255,157,0.3)]">
              Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-white font-display font-bold">Pump<span className="text-primary">Logic</span></span>
              <span className="text-muted-foreground text-sm">- Smart Fee Routing for Solana</span>
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="https://x.com/i/communities/2004770032832929819" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>X Community</span>
              </a>
              <a 
                href="https://t.me/PumpLogicSol" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Telegram</span>
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-muted-foreground">
            Built for Solana token creators. Use at your own risk. DYOR.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-card/50 border border-white/5 p-6 rounded-xl hover:border-primary/50 transition-colors group">
      <div className="mb-4 bg-white/5 w-14 h-14 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h4 className="text-xl font-bold font-display mb-2 text-white">{title}</h4>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
