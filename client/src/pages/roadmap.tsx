import { motion } from "framer-motion";
import { Rocket, Settings, Target, Globe, Check, Clock, Shield, Flame, BarChart3 } from "lucide-react";

const phases = [
  {
    id: 1,
    title: "PumpLogic Core",
    status: "live",
    icon: Rocket,
    description: "The foundation - fee distribution platform for Solana token creators",
    features: [
      "4-channel fee allocation (Market Making, Buyback, Liquidity, Revenue)",
      "AI-powered optimization with RSI & volatility analysis",
      "Multi-wallet support (Phantom, Solflare, Backpack)",
      "Multi-token management with per-token settings",
      "Telegram notifications & price alerts",
      "Customizable sound effects",
      "Allocation presets & quick save",
      "Distribution preview before transactions",
      "Transaction history export (CSV)"
    ]
  },
  {
    id: 2,
    title: "PumpLogic Analytics",
    status: "live",
    icon: BarChart3,
    description: "Real-time analytics and performance tracking for your tokens",
    features: [
      "Analytics dashboard with live token metrics",
      "Price charts powered by DexScreener",
      "Distribution volume tracking (7-day view)",
      "Allocation breakdown visualization",
      "Fee collection summary & breakdown",
      "24h transaction monitoring (buys/sells)",
      "Preview mode for exploring without wallet"
    ]
  },
  {
    id: 3,
    title: "PumpLogic Guard",
    status: "in_progress",
    icon: Shield,
    description: "Security toolkit for token analysis and rug-pull detection",
    features: [
      "Token scanner with risk scoring (0-100)",
      "Rug-pull pattern detection",
      "Liquidity lock status verification",
      "Holder concentration analysis",
      "Mint & freeze authority checks",
      "Watchlist with real-time alerts",
      "Tax report generation with CSV export"
    ]
  },
  {
    id: 4,
    title: "PumpLogic Burn & Tools",
    status: "in_progress",
    icon: Flame,
    description: "Token management and advanced DeFi utilities",
    features: [
      "Token burn feature (Beta - whitelisted)",
      "Burn impact calculator with USD value",
      "Token metadata display (supply, authorities)",
      "Burn history tracking with Solscan links",
      "Scheduled auto-distributions (coming soon)",
      "Revenue splits for collaborators (coming soon)",
      "Strategy presets marketplace (coming soon)"
    ]
  },
  {
    id: 5,
    title: "PumpLogic Staking & Rewards",
    status: "planned",
    icon: Settings,
    description: "Stake $PLOGIC tokens to unlock premium features and earn rewards",
    features: [
      "Stake $PLOGIC for platform benefits",
      "Tiered access based on stake amount",
      "Fee discounts for stakers",
      "Revenue sharing from platform fees",
      "Governance voting rights",
      "Early access to new features"
    ]
  },
  {
    id: 6,
    title: "Ecosystem Expansion",
    status: "planned",
    icon: Globe,
    description: "Unified platform for the complete DeFi toolkit",
    features: [
      "Cross-app portfolio view",
      "Unified notification system",
      "Public API & SDK for developers",
      "Mobile companion app (iOS/Android)",
      "Partner integrations & white-label",
      "Governance token utility"
    ]
  }
];

function StatusBadge({ status }: { status: string }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
        <Check className="h-3 w-3" />
        LIVE
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-medium">
        <Clock className="h-3 w-3" />
        UPCOMING
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
        <Clock className="h-3 w-3" />
        DEV IN PROGRESS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium">
      <Clock className="h-3 w-3" />
      PLANNED
    </span>
  );
}

export default function Roadmap() {
  return (
    <div className="min-h-screen text-foreground">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Building the Future
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-4">
            Roadmap
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our vision for the PumpLogic ecosystem - from fee distribution to a complete DeFi toolkit for Solana creators and traders.
          </p>
        </motion.div>
      </section>

      {/* Roadmap Timeline */}
      <section className="pb-24 container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-white/10 transform md:-translate-x-1/2" />
          
          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative flex items-start gap-8 mb-12 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background transform -translate-x-1/2 z-10" />
              
              {/* Content card */}
              <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                <div className={`bg-card border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-colors ${
                  phase.status === "live" ? "border-primary/50 shadow-lg shadow-primary/10" : ""
                }`}>
                  <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                    <div className={`p-2 rounded-lg ${
                      phase.status === "live" ? "bg-primary/20" : "bg-white/5"
                    }`}>
                      <phase.icon className={`h-5 w-5 ${
                        phase.status === "live" ? "text-primary" : "text-white/60"
                      }`} />
                    </div>
                    <StatusBadge status={phase.status} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    Phase {phase.id}: {phase.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4">
                    {phase.description}
                  </p>
                  
                  <ul className={`space-y-2 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                    {phase.features.map((feature, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm text-white/80 ${
                        index % 2 === 0 ? "md:flex-row-reverse" : ""
                      }`}>
                        <Check className={`h-4 w-4 mt-0.5 shrink-0 ${
                          phase.status === "live" ? "text-primary" : "text-white/30"
                        }`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Empty space for alternating layout */}
              <div className="hidden md:block md:w-1/2" />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
