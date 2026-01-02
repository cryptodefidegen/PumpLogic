import { motion } from "framer-motion";
import { Rocket, Settings, Globe, Check, Clock, Shield, Flame, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
        <Check className="h-3.5 w-3.5" />
        LIVE
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
        <Clock className="h-3.5 w-3.5" />
        IN DEV
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm font-medium">
      <Clock className="h-3.5 w-3.5" />
      PLANNED
    </span>
  );
}

export default function Roadmap() {
  return (
    <div className="min-h-screen text-foreground pb-20">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Pump<span className="text-primary">Logic</span> Roadmap
              </h1>
            </div>
            <p className="text-muted-foreground">
              Our vision for the PumpLogic ecosystem - building the future of DeFi tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`bg-black/40 border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors h-full ${
                phase.status === "live" ? "border-primary/50 shadow-lg shadow-primary/10" : ""
              }`}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        phase.status === "live" ? "bg-primary/20" : "bg-white/5"
                      }`}>
                        <phase.icon className={`h-6 w-6 ${
                          phase.status === "live" ? "text-primary" : "text-white/60"
                        }`} />
                      </div>
                      <span className="text-sm text-white/40 font-mono">Phase {phase.id}</span>
                    </div>
                    <StatusBadge status={phase.status} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {phase.title}
                  </h3>
                  
                  <ul className="space-y-3">
                    {phase.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-base text-white/80">
                        <Check className={`h-5 w-5 shrink-0 ${
                          phase.status === "live" ? "text-primary" : "text-white/30"
                        }`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
