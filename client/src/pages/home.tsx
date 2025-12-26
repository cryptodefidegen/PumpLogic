import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, RefreshCw, Coins, CheckCircle2 } from "lucide-react";

export default function Home() {
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
              title="Buyback & Burn"
              desc="Reduce circulating supply through strategic token repurchases and burns."
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
