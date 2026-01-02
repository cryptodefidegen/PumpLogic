import { motion } from "framer-motion";
import { Rocket, Settings, Globe, Check, Clock, Shield, Flame, BarChart3 } from "lucide-react";

const phases = [
  {
    id: 1,
    title: "PumpLogic Core",
    status: "live",
    icon: Rocket,
    features: [
      "4-channel fee allocation",
      "AI-powered optimization",
      "Multi-wallet support",
      "Telegram notifications",
      "Allocation presets"
    ]
  },
  {
    id: 2,
    title: "PumpLogic Analytics",
    status: "live",
    icon: BarChart3,
    features: [
      "Live token metrics",
      "DexScreener charts",
      "Distribution tracking",
      "Allocation breakdown",
      "Preview mode"
    ]
  },
  {
    id: 3,
    title: "PumpLogic Guard",
    status: "in_progress",
    icon: Shield,
    features: [
      "Token risk scanner",
      "Rug-pull detection",
      "Liquidity analysis",
      "Authority checks",
      "Tax reports"
    ]
  },
  {
    id: 4,
    title: "Burn & Tools",
    status: "in_progress",
    icon: Flame,
    features: [
      "Token burning",
      "Burn impact calc",
      "Auto-distributions",
      "Revenue splits",
      "Strategy presets"
    ]
  },
  {
    id: 5,
    title: "Staking & Rewards",
    status: "planned",
    icon: Settings,
    features: [
      "Stake $PLOGIC",
      "Tiered access",
      "Fee discounts",
      "Revenue sharing",
      "Governance voting"
    ]
  },
  {
    id: 6,
    title: "Ecosystem",
    status: "planned",
    icon: Globe,
    features: [
      "Portfolio view",
      "Public API & SDK",
      "Mobile app",
      "Partner integrations",
      "White-label"
    ]
  }
];

function StatusBadge({ status }: { status: string }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
        <Check className="h-3 w-3" />
        LIVE
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
        <Clock className="h-3 w-3" />
        IN DEV
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs font-medium">
      <Clock className="h-3 w-3" />
      PLANNED
    </span>
  );
}

export default function Roadmap() {
  return (
    <div className="min-h-screen text-foreground">
      <section className="relative pt-24 pb-8 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Building the Future
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-2">
            Roadmap
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Our vision for the PumpLogic ecosystem
          </p>
        </motion.div>
      </section>

      <section className="pb-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-card border rounded-xl p-6 hover:border-primary/30 transition-colors ${
                phase.status === "live" ? "border-primary/50 shadow-lg shadow-primary/10" : "border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    phase.status === "live" ? "bg-primary/20" : "bg-white/5"
                  }`}>
                    <phase.icon className={`h-5 w-5 ${
                      phase.status === "live" ? "text-primary" : "text-white/60"
                    }`} />
                  </div>
                  <span className="text-sm text-white/40 font-mono">Phase {phase.id}</span>
                </div>
                <StatusBadge status={phase.status} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                {phase.title}
              </h3>
              
              <ul className="space-y-2">
                {phase.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className={`h-4 w-4 shrink-0 ${
                      phase.status === "live" ? "text-primary" : "text-white/30"
                    }`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
