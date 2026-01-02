import { motion } from "framer-motion";
import { Rocket, Settings, Globe, Check, Clock, Shield, Flame, BarChart3, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const phases = [
  {
    id: 1,
    title: "PumpLogic Core",
    status: "live",
    icon: Rocket,
    eta: "Q4 2024",
    progress: 100,
    description: "Fee distribution platform for Solana token creators",
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
    eta: "Q4 2024",
    progress: 100,
    description: "Real-time metrics and performance tracking",
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
    status: "live",
    icon: Shield,
    eta: "Q4 2024",
    progress: 100,
    description: "Security toolkit for rug-pull detection",
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
    status: "live",
    icon: Flame,
    eta: "Q4 2024",
    progress: 100,
    description: "Token management and DeFi utilities",
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
    eta: "Q2 2025",
    progress: 0,
    description: "Stake $PLOGIC for premium access",
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
    eta: "Q3 2025",
    progress: 0,
    description: "Complete DeFi toolkit platform",
    features: [
      "Portfolio view",
      "Public API & SDK",
      "Mobile app",
      "Partner integrations",
      "White-label"
    ]
  }
];

const livePhases = phases.filter(p => p.status === "live");
const inProgressPhases = phases.filter(p => p.status === "in_progress");
const plannedPhases = phases.filter(p => p.status === "planned");

function StatusBadge({ status }: { status: string }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/50">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        LIVE
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/50">
        <Clock className="h-3 w-3 animate-pulse" />
        IN DEV
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold border border-white/20">
      <Clock className="h-3 w-3" />
      PLANNED
    </span>
  );
}

function PhaseCard({ phase, index }: { phase: typeof phases[0], index: number }) {
  const statusColors = {
    live: "border-primary/50 shadow-lg shadow-primary/20",
    in_progress: "border-blue-500/30 shadow-lg shadow-blue-500/10",
    planned: "border-white/10"
  };

  const progressColors = {
    live: "bg-primary",
    in_progress: "bg-blue-500",
    planned: "bg-white/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Card className={`bg-black/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 h-full ${statusColors[phase.status as keyof typeof statusColors]}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                phase.status === "live" 
                  ? "bg-primary/20 group-hover:bg-primary/30 group-hover:shadow-lg group-hover:shadow-primary/30" 
                  : phase.status === "in_progress"
                  ? "bg-blue-500/20 group-hover:bg-blue-500/30"
                  : "bg-white/5 group-hover:bg-white/10"
              }`}>
                <phase.icon className={`h-5 w-5 ${
                  phase.status === "live" ? "text-primary" : phase.status === "in_progress" ? "text-blue-400" : "text-white/60"
                }`} />
              </div>
            </div>
            <StatusBadge status={phase.status} />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-1">
            {phase.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            {phase.description}
          </p>

          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-mono font-bold ${
                phase.status === "live" ? "text-primary" : phase.status === "in_progress" ? "text-blue-400" : "text-white/60"
              }`}>{phase.progress}%</span>
            </div>
            <Progress 
              value={phase.progress} 
              className="h-1.5 bg-white/10"
            />
          </div>

          <div className="flex items-center justify-between text-xs mb-4">
            <span className="text-muted-foreground">Target</span>
            <span className="font-mono text-white/80 bg-white/5 px-2 py-0.5 rounded">{phase.eta}</span>
          </div>
          
          <ul className="space-y-2">
            {phase.features.slice(0, 4).map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                <Check className={`h-4 w-4 shrink-0 ${
                  phase.status === "live" ? "text-primary" : phase.status === "in_progress" ? "text-blue-400" : "text-white/30"
                }`} />
                <span>{feature}</span>
              </li>
            ))}
            {phase.features.length > 4 && (
              <li className="text-xs text-muted-foreground pl-6">
                +{phase.features.length - 4} more features
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SectionHeader({ title, icon: Icon, count, color }: { title: string, icon: any, count: number, color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <span className="text-sm text-muted-foreground font-mono">({count})</span>
    </div>
  );
}

export default function Roadmap() {
  const totalProgress = Math.round(phases.reduce((acc, p) => acc + p.progress, 0) / phases.length);

  return (
    <div className="min-h-screen text-foreground pb-20">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
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

          <div className="flex flex-wrap gap-3">
            <div className="bg-black/40 border border-primary/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-white/80">{livePhases.length} Live</span>
            </div>
            <div className="bg-black/40 border border-blue-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/80">{inProgressPhases.length} In Dev</span>
            </div>
            <div className="bg-black/40 border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-white/60" />
              <span className="text-sm text-white/80">{totalProgress}% Complete</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {livePhases.length > 0 && (
            <section>
              <SectionHeader title="Live" icon={Check} count={livePhases.length} color="bg-primary/20 text-primary" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {livePhases.map((phase, index) => (
                  <PhaseCard key={phase.id} phase={phase} index={index} />
                ))}
              </div>
            </section>
          )}

          {inProgressPhases.length > 0 && (
            <section>
              <SectionHeader title="In Development" icon={Clock} count={inProgressPhases.length} color="bg-blue-500/20 text-blue-400" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressPhases.map((phase, index) => (
                  <PhaseCard key={phase.id} phase={phase} index={index} />
                ))}
              </div>
            </section>
          )}

          {plannedPhases.length > 0 && (
            <section>
              <SectionHeader title="Planned" icon={Globe} count={plannedPhases.length} color="bg-white/10 text-white/60" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plannedPhases.map((phase, index) => (
                  <PhaseCard key={phase.id} phase={phase} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
