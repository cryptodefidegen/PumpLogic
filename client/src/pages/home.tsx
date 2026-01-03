import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, RefreshCw, Coins, Copy, Target, Rocket, Shield, Flame, BarChart3 } from "lucide-react";
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
            The complete DeFi toolkit <br /> for Solana creators
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Deploy tokens, manage fee routing, monitor risks, burn tokens, and track analytics - all in one powerful platform.
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
              <div className="text-3xl font-bold font-mono text-white">5</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Powerful Tools</div>
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

      {/* Toolkit Section */}
      <section className="py-24 bg-black/50 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-mono text-primary uppercase tracking-widest mb-2">The Toolkit</h2>
            <h3 className="text-3xl md:text-4xl font-bold font-display text-white">Everything you need to succeed</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <FeatureCard 
              icon={<Rocket className="h-8 w-8 text-primary" />}
              title="Token Deployer"
              desc="Launch your Pump.fun token in seconds with custom metadata, banners, and social links."
              link="/deployer"
            />
            <FeatureCard 
              icon={<Coins className="h-8 w-8 text-secondary" />}
              title="Fee Allocator"
              desc="Route token fees into market making, buybacks, liquidity, and creator revenue automatically."
              link="/app"
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-blue-400" />}
              title="Guard"
              desc="Scan tokens for rug-pull risks, monitor whale activity, and track alerts in real-time."
              link="/guard"
            />
            <FeatureCard 
              icon={<Flame className="h-8 w-8 text-orange-400" />}
              title="Token Burner"
              desc="Burn SPL tokens with full transparency. See burn impact and track your burn history."
              link="/burn"
            />
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-yellow-400" />}
              title="Analytics"
              desc="Track your portfolio performance, view transaction history, and monitor token metrics."
              link="/analytics"
            />
            <FeatureCard 
              icon={<TrendingUp className="h-8 w-8 text-purple-400" />}
              title="AI Optimization"
              desc="Get AI-powered recommendations to optimize your fee allocation strategy."
              link="/app"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          
          <h2 className="text-4xl font-bold font-display mb-6">Ready to launch?</h2>
          <p className="text-xl text-muted-foreground mb-8">Connect your wallet and access the complete DeFi toolkit for Solana creators.</p>
          
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
              <span className="text-muted-foreground text-sm">- The Complete DeFi Toolkit for Solana</span>
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
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                <span>Telegram</span>
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-muted-foreground">
            Deploy tokens, automate fee distribution, analyze risks, and burn tokens on Solana. Use at your own risk. DYOR.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, link }: { icon: any, title: string, desc: string, link?: string }) {
  const content = (
    <div className="bg-card/50 border border-white/5 p-6 rounded-xl hover:border-primary/50 transition-colors group cursor-pointer h-full">
      <div className="mb-4 bg-white/5 w-14 h-14 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h4 className="text-xl font-bold font-display mb-2 text-white group-hover:text-primary transition-colors">{title}</h4>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
  
  if (link) {
    return <Link href={link}>{content}</Link>;
  }
  return content;
}
