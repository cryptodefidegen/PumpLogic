import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, RefreshCw, Coins, CheckCircle2, Rocket } from "lucide-react";
import gridBg from "@assets/generated_images/neon_green_cyberpunk_abstract_grid_background.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 container mx-auto px-4 text-center">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background"></div>
          <img src={gridBg} alt="Grid Background" className="w-full h-full object-cover object-top" />
        </div>
        
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
            First of its kind on Solana
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Programmable liquidity <br /> for Pump.fun tokens
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The only AI-powered fee engine that automatically routes creator fees into market making, buybacks, liquidity, and revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/app">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary text-black hover:bg-primary/90 rounded-full font-bold">
                Launch App <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/5 rounded-full">
              Join Telegram
            </Button>
          </div>
          
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto border-t border-white/5 mt-12">
            <div>
              <div className="text-3xl font-bold font-mono text-white">4</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Fee Channels</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white">24/7</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Automation</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white">AI</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Optimized</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white">$12M+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Volume Processed</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black/50 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-mono text-primary uppercase tracking-widest mb-2">How it works</h2>
            <h3 className="text-3xl md:text-4xl font-bold font-display text-white">Four strategic channels</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<TrendingUp className="h-8 w-8 text-primary" />}
              title="Market Making"
              desc="RSI-timed trades create depth and stabilize price action automatically."
            />
            <FeatureCard 
              icon={<RefreshCw className="h-8 w-8 text-secondary" />}
              title="Buyback & Burn"
              desc="Automatic buybacks with permanent burns. Deflationary by design."
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-blue-400" />}
              title="Liquidity Pool"
              desc="Auto-add to LP with permanent locks. Deeper liquidity over time."
            />
            <FeatureCard 
              icon={<Coins className="h-8 w-8 text-yellow-400" />}
              title="Creator Revenue"
              desc="Direct revenue stream to fund development and growth."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          
          <h2 className="text-4xl font-bold font-display mb-6">Ready to launch?</h2>
          <p className="text-xl text-muted-foreground mb-8">Fair launch. No presale. No team allocation. Just technology.</p>
          
          <Link href="/app">
            <Button size="lg" className="h-14 px-8 text-lg bg-primary text-black hover:bg-primary/90 rounded-full font-bold shadow-[0_0_20px_rgba(0,255,157,0.3)]">
              Start Now <Rocket className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
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
