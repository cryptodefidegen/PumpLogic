import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, RefreshCw, Zap, Coins, Wallet, Settings, Activity, Brain, Eye, BookmarkPlus, BarChart3, Download } from "lucide-react";

export default function Docs() {
  return (
    <div className="min-h-screen text-foreground pb-20">
      <div className="container mx-auto px-4 pt-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 text-white">Documentation</h1>
          <p className="text-xl text-muted-foreground">Learn how PumpLogic automates your token fee distribution</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display">Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                PumpLogic is a fee distribution platform for Solana token creators. It allows you to automatically 
                split incoming fees across four strategic categories, helping you manage token economics without 
                manual intervention.
              </p>
              <p>
                Connect your Phantom wallet, configure your allocation percentages, set up destination wallets, 
                and let the system handle the rest.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <Step 
                  number={1}
                  icon={<Wallet className="h-5 w-5" />}
                  title="Connect Your Wallet"
                  description="Link your Phantom wallet to authenticate and access the dashboard. Your wallet address serves as your account identifier."
                />
                <Step 
                  number={2}
                  icon={<Settings className="h-5 w-5" />}
                  title="Configure Allocations"
                  description="Set percentage splits for each of the four distribution categories. The total must equal 100%. Adjust anytime based on your strategy."
                />
                <Step 
                  number={3}
                  icon={<Activity className="h-5 w-5" />}
                  title="Set Destination Wallets"
                  description="Provide Solana wallet addresses for each category. These are where your distributed funds will be sent."
                />
                <Step 
                  number={4}
                  icon={<Brain className="h-5 w-5" />}
                  title="Distribute or Automate"
                  description="Manually trigger distributions or enable automation. The AI optimizer can suggest allocation adjustments based on network conditions."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display">Distribution Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CategoryDetailed 
                icon={<TrendingUp className="h-6 w-6 text-primary" />}
                title="Market Making"
                color="bg-primary/20"
                summary="Funds allocated here support trading activity and order book depth."
                concept="Market making involves placing both buy and sell orders at various price levels to provide liquidity. When traders want to buy or sell your token, market makers ensure there's always someone on the other side of the trade. This reduces price volatility and slippage (the difference between expected and actual trade price)."
                howItWorks="PumpLogic sends your allocated percentage to your designated Market Making wallet. You then use those funds to place orders on exchanges, either manually or through trading bots. The goal is to maintain tight spreads and sufficient depth so traders can execute orders efficiently."
                benefits={["Reduces price slippage for traders", "Improves trading experience and volume", "Stabilizes token price movements", "Attracts more traders to your token"]}
              />
              <Separator className="bg-white/5" />
              <CategoryDetailed 
                icon={<RefreshCw className="h-6 w-6 text-secondary" />}
                title="Buyback & Burn"
                color="bg-secondary/20"
                summary="Tokens are repurchased from the market and permanently removed from circulation."
                concept="Buyback and burn is a deflationary mechanism. The allocated funds are used to purchase your token from the open market, and those tokens are then sent to a burn address (a wallet with no private key), permanently removing them from circulation. This reduces total supply over time."
                howItWorks="PumpLogic sends funds to your Buyback wallet. You use those funds to buy your token on DEXs, then send the purchased tokens to a burn address. Some projects automate this with smart contracts that execute burns on a schedule."
                benefits={["Reduces circulating supply", "Creates deflationary pressure on token", "Can increase token value over time", "Shows commitment to token holders"]}
              />
              <Separator className="bg-white/5" />
              <CategoryDetailed 
                icon={<Zap className="h-6 w-6 text-blue-400" />}
                title="Liquidity Pool"
                color="bg-blue-400/20"
                summary="Contributions to decentralized liquidity pools strengthen your token's tradability."
                concept="Liquidity pools are smart contracts that hold pairs of tokens (e.g., your token + SOL) on decentralized exchanges like Raydium or Orca. When you add liquidity, you're depositing both tokens to enable trading. In return, you earn a portion of trading fees from swaps."
                howItWorks="PumpLogic sends funds to your Liquidity wallet. You then add those funds (along with an equivalent value of your token) to a liquidity pool. This deepens the pool, allowing larger trades with less price impact and earning you LP fees."
                benefits={["Enables trading on DEXs", "Earns passive income from swap fees", "Deeper liquidity attracts more traders", "Improves overall token accessibility"]}
              />
              <Separator className="bg-white/5" />
              <CategoryDetailed 
                icon={<Coins className="h-6 w-6 text-yellow-400" />}
                title="Creator Revenue"
                color="bg-yellow-400/20"
                summary="Direct earnings sent to your designated wallet for operational use."
                concept="Creator revenue is the portion of fees you keep for yourself or your team. This is your income from the token project, used to fund ongoing development, marketing, team salaries, partnerships, or any other business expenses."
                howItWorks="PumpLogic sends the allocated percentage directly to your Revenue wallet. These funds are yours to use however you see fit - no additional steps required. This ensures consistent income flow from your token's trading activity."
                benefits={["Fund ongoing development", "Pay team members and contributors", "Cover marketing and growth costs", "Sustain long-term project operations"]}
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display">AI Optimizer</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                The built-in AI optimizer analyzes current Solana network conditions including transaction throughput, 
                congestion levels, and market volatility to suggest optimal allocation percentages.
              </p>
              <p>
                When you run the optimizer, it evaluates these factors and adjusts your allocations accordingly. 
                For example, during high volatility it may increase buyback allocations, while during stable periods 
                it might favor liquidity contributions.
              </p>
              <p>
                You always have final control - the optimizer makes suggestions that you can accept or modify.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Every distribution is recorded with its transaction signature, amount, and breakdown by category. 
                You can view your complete history in the dashboard and verify any transaction on-chain using Solana explorers.
              </p>
              <p>
                Transaction types include manual distributions, automated distributions, and optimizer runs 
                (which record allocation changes).
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display">Dashboard Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Category 
                icon={<Eye className="h-6 w-6 text-primary" />}
                title="Distribution Preview"
                color="bg-primary/20"
                description="Before signing any transaction, use the Preview button to see exactly how your SOL will be split across channels. This shows the precise amount going to each destination wallet, so you can verify the breakdown before committing."
              />
              <Separator className="bg-white/5" />
              <Category 
                icon={<BookmarkPlus className="h-6 w-6 text-secondary" />}
                title="Quick Presets"
                color="bg-secondary/20"
                description="Save your favorite allocation configurations as presets for quick access. Whether you have a 'Bull Market' strategy or a 'Conservative' approach, presets let you switch between configurations instantly without manually adjusting each slider."
              />
              <Separator className="bg-white/5" />
              <Category 
                icon={<BarChart3 className="h-6 w-6 text-blue-400" />}
                title="Channel Performance"
                color="bg-blue-400/20"
                description="Track your cumulative distribution history with the Channel Performance dashboard. See total SOL distributed to each category over time, helping you understand your overall fee routing patterns and make informed strategy adjustments."
              />
              <Separator className="bg-white/5" />
              <Category 
                icon={<Download className="h-6 w-6 text-yellow-400" />}
                title="Export History"
                color="bg-yellow-400/20"
                description="Download your complete transaction history as a CSV file for record-keeping, tax purposes, or analysis. The export includes timestamps, transaction types, amounts, and on-chain signatures for full transparency."
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display">Security</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                PumpLogic never has access to your private keys. All transactions are signed locally in your 
                Phantom wallet before being submitted to the Solana network.
              </p>
              <p>
                Your wallet address is used for authentication and to create transactions, but signing authority 
                remains entirely with you. You approve every distribution before it executes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Step({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
        {number}
      </div>
      <div>
        <h4 className="text-white font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function Category({ icon, title, color, description }: { icon: React.ReactNode; title: string; color: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h4 className="text-white font-semibold text-lg">{title}</h4>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function CategoryDetailed({ icon, title, color, summary, concept, howItWorks, benefits }: { 
  icon: React.ReactNode; 
  title: string; 
  color: string; 
  summary: string;
  concept: string;
  howItWorks: string;
  benefits: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h4 className="text-white font-semibold text-lg">{title}</h4>
          <p className="text-muted-foreground mt-1">{summary}</p>
        </div>
      </div>
      <div className="ml-16 space-y-3">
        <div>
          <h5 className="text-white/80 font-medium text-sm mb-1">The Concept</h5>
          <p className="text-muted-foreground text-sm">{concept}</p>
        </div>
        <div>
          <h5 className="text-white/80 font-medium text-sm mb-1">How It Works</h5>
          <p className="text-muted-foreground text-sm">{howItWorks}</p>
        </div>
        <div>
          <h5 className="text-white/80 font-medium text-sm mb-1">Benefits</h5>
          <ul className="text-muted-foreground text-sm space-y-1">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
