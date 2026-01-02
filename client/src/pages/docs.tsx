import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, RefreshCw, Zap, Coins, Wallet, Settings, Activity, Brain, Eye, BookmarkPlus, BarChart3, Download, Bell, Shield, ChevronRight, Link, Target, Layers, Flame, Monitor, FileText, Rocket, HelpCircle } from "lucide-react";

const quickLinks = [
  { icon: Rocket, title: "Getting Started", value: "overview", color: "bg-primary/20 text-primary" },
  { icon: Settings, title: "How It Works", value: "how-it-works", color: "bg-blue-500/20 text-blue-400" },
  { icon: BarChart3, title: "Categories", value: "categories", color: "bg-purple-500/20 text-purple-400" },
  { icon: Brain, title: "AI Optimizer", value: "ai-optimizer", color: "bg-amber-500/20 text-amber-400" },
];

export default function Docs() {
  return (
    <div className="min-h-screen text-foreground pb-20">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Pump<span className="text-primary">Logic</span> Documentation
              </h1>
            </div>
            <p className="text-muted-foreground">
              Learn how PumpLogic automates your token fee distribution
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <a
                key={link.value}
                href={`#${link.value}`}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 hover:border-primary/30 transition-colors"
              >
                <link.icon className={`h-4 w-4 ${link.color.split(' ')[1]}`} />
                <span className="text-sm text-white/80">{link.title}</span>
              </a>
            ))}
          </div>
        </div>

        <Accordion type="multiple" className="space-y-4" defaultValue={["overview"]}>
          <AccordionItem value="overview" id="overview" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-primary" />
                Overview
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 pb-6">
              <p>
                PumpLogic is a fee distribution platform for Solana token creators. It allows you to automatically 
                split incoming fees across four strategic categories, helping you manage token economics without 
                manual intervention.
              </p>
              <p>
                Connect your Phantom wallet, configure your allocation percentages, set up destination wallets, 
                and let the system handle the rest.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-it-works" id="how-it-works" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                How It Works
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="categories" id="categories" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                Distribution Categories
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <CategoryDetailed 
                icon={<TrendingUp className="h-6 w-6 text-primary" />}
                title="Market Making"
                color="bg-primary/20"
                summary="Funds allocated here support trading activity and order book depth."
                concept="Market making involves placing both buy and sell orders at various price levels to provide liquidity. When traders want to buy or sell your token, market makers ensure there's always someone on the other side of the trade. This reduces price volatility and slippage."
                howItWorks="PumpLogic sends your allocated percentage to your designated Market Making wallet. You then use those funds to place orders on exchanges, either manually or through trading bots."
                benefits={["Reduces price slippage for traders", "Improves trading experience and volume", "Stabilizes token price movements", "Attracts more traders to your token"]}
              />
              <Separator className="bg-white/5" />
              <CategoryDetailed 
                icon={<RefreshCw className="h-6 w-6 text-secondary" />}
                title="Buyback"
                color="bg-secondary/20"
                summary="Tokens are repurchased from the market to support price stability."
                concept="Buyback is a mechanism to support your token's price. The allocated funds are used to purchase your token from the open market, which creates buying pressure and reduces available supply."
                howItWorks="PumpLogic sends funds to your Buyback wallet. You use those funds to buy your token on DEXs. If you want to burn the purchased tokens, use a third-party service like Sol Incinerator."
                benefits={["Creates buying pressure on token", "Reduces available supply", "Supports token price stability", "Shows commitment to token holders"]}
              />
              <Separator className="bg-white/5" />
              <CategoryDetailed 
                icon={<Zap className="h-6 w-6 text-blue-400" />}
                title="Liquidity Pool"
                color="bg-blue-400/20"
                summary="Contributions to decentralized liquidity pools strengthen your token's tradability."
                concept="Liquidity pools are smart contracts that hold pairs of tokens on decentralized exchanges like Raydium or Orca. When you add liquidity, you're depositing both tokens to enable trading."
                howItWorks="PumpLogic sends funds to your Liquidity wallet. You then add those funds (along with an equivalent value of your token) to a liquidity pool."
                benefits={["Enables trading on DEXs", "Earns passive income from swap fees", "Deeper liquidity attracts more traders", "Improves overall token accessibility"]}
              />
              <Separator className="bg-white/5" />
              <CategoryDetailed 
                icon={<Coins className="h-6 w-6 text-yellow-400" />}
                title="Creator Revenue"
                color="bg-yellow-400/20"
                summary="Direct earnings sent to your designated wallet for operational use."
                concept="Creator revenue is the portion of fees you keep for yourself or your team. This is your income from the token project."
                howItWorks="PumpLogic sends the allocated percentage directly to your Revenue wallet. These funds are yours to use however you see fit."
                benefits={["Fund ongoing development", "Pay team members and contributors", "Cover marketing and growth costs", "Sustain long-term project operations"]}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ai-optimizer" id="ai-optimizer" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                AI Optimizer
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 pb-6">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="dashboard-tools" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                Dashboard Tools
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              <Category 
                icon={<Eye className="h-6 w-6 text-primary" />}
                title="Distribution Preview"
                color="bg-primary/20"
                description="Before signing any transaction, use the Preview button to see exactly how your SOL will be split across channels."
              />
              <Separator className="bg-white/5" />
              <Category 
                icon={<BookmarkPlus className="h-6 w-6 text-secondary" />}
                title="Quick Presets"
                color="bg-secondary/20"
                description="Save your favorite allocation configurations as presets for quick access. Switch between strategies instantly."
              />
              <Separator className="bg-white/5" />
              <Category 
                icon={<BarChart3 className="h-6 w-6 text-blue-400" />}
                title="Channel Performance"
                color="bg-blue-400/20"
                description="Track your cumulative distribution history. See total SOL distributed to each category over time."
              />
              <Separator className="bg-white/5" />
              <Category 
                icon={<Download className="h-6 w-6 text-yellow-400" />}
                title="Export History"
                color="bg-yellow-400/20"
                description="Download your complete transaction history as a CSV file for record-keeping or tax purposes."
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="analytics" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics Dashboard
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                The Analytics dashboard provides real-time insights into your token's performance and your fee distribution activity. 
                Track key metrics, monitor market activity, and analyze your distribution history all in one place.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">Token Metrics</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Coins className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Live Price & Market Cap</p>
                      <p className="text-xs">Real-time token price with 24h change percentage and fully diluted market cap</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">24h Volume & Transactions</p>
                      <p className="text-xs">Trading volume and buy/sell transaction counts from the last 24 hours</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Liquidity Depth</p>
                      <p className="text-xs">Pool liquidity for migrated tokens, or "Bonding Curve" status for pump.fun tokens</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Charts & Visualization</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Price Chart</p>
                      <p className="text-xs">Live candlestick chart powered by DexScreener showing price history</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Distribution Volume</p>
                      <p className="text-xs">7-day bar chart showing your daily fee distribution volume</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Allocation Breakdown</p>
                      <p className="text-xs">Pie chart visualizing your current allocation settings across all four channels</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">How to Use</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                    <p className="text-sm">Connect your wallet and navigate to <span className="text-primary font-semibold">Analytics</span> in the navbar</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                    <p className="text-sm">Select a token from the dropdown (defaults to $PLOGIC)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
                    <p className="text-sm">View live metrics, charts, and your fee distribution breakdown</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">4</div>
                    <p className="text-sm">Click <span className="text-primary font-semibold">Refresh</span> to update data or wait for auto-refresh (every 30 seconds)</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Data is sourced from DexScreener API for accurate pump.fun and Raydium token metrics.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guard" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                PumpLogic Guard
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 border border-primary/50 rounded-full text-primary">BETA</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                PumpLogic Guard is your security toolkit for Solana token analysis. It provides real-time risk assessment, 
                rug-pull pattern detection, and tax reporting tools to help you make informed decisions and stay safe in DeFi.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">Token Scanner</h4>
                <div className="space-y-3">
                  <p className="text-sm">
                    Enter any Solana token address to get a comprehensive security analysis. The scanner checks for common 
                    rug-pull indicators and provides a risk score from 0-100.
                  </p>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Liquidity Lock Status</p>
                      <p className="text-xs">Checks if liquidity is locked and for how long</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Holder Concentration</p>
                      <p className="text-xs">Analyzes top holder distribution for whale risk</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Authority Status</p>
                      <p className="text-xs">Verifies if mint and freeze authorities are disabled</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Risk Alerts</h4>
                <p className="text-sm mb-3">
                  Add tokens to your watchlist to receive real-time alerts for suspicious activity:
                </p>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-2">
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs">Large holder movements to exchange wallets</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs">Liquidity removal or unlock events</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs">Authority changes or minting activity</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs">Contract upgrades or suspicious transactions</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Tax Reports</h4>
                <p className="text-sm mb-3">
                  Generate tax-ready reports for your Solana transactions. Features include:
                </p>
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Date Range Selection</h5>
                    <p className="text-xs">Choose custom date ranges for quarterly or annual tax filing.</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">CSV Export</h5>
                    <p className="text-xs">Download formatted transaction data compatible with tax software.</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">P&L Summary</h5>
                    <p className="text-xs">View total gains, losses, and net profit/loss at a glance.</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                PumpLogic Guard is currently in beta and available to whitelisted users only. Features are read-only 
                and do not execute any blockchain transactions.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="burn" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-500" />
                PumpLogic Burn
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 border border-primary/50 rounded-full text-primary">BETA</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                PumpLogic Burn allows you to permanently remove SPL tokens from circulation by sending them to a burn address. 
                This is an irreversible action that reduces the total supply of a token.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">How to Burn Tokens</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold">1</div>
                    <p className="text-sm">Navigate to <span className="text-primary font-semibold">Burn</span> in the navbar</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold">2</div>
                    <p className="text-sm">Enter the token contract address and click <span className="text-primary font-semibold">Analyze</span></p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold">3</div>
                    <p className="text-sm">Review token metadata: name, symbol, price, FDV, supply, and authority status</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold">4</div>
                    <p className="text-sm">Enter the amount to burn (or click MAX for your entire balance)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold">5</div>
                    <p className="text-sm">Click <span className="text-orange-500 font-semibold">Burn Tokens</span> and review the confirmation dialog</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold">6</div>
                    <p className="text-sm">Approve the transaction in your wallet to complete the burn</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Token Information Displayed</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Coins className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Token Metadata</p>
                      <p className="text-xs">Name, symbol, image, current price, and fully diluted valuation (FDV)</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                      <Flame className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Supply Information</p>
                      <p className="text-xs">Total supply, decimals, and burn impact (% of supply being burned)</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Authority Status</p>
                      <p className="text-xs">Mint authority and freeze authority status (revoked = safer)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <h4 className="text-orange-500 font-semibold mb-2">Warning: Irreversible Action</h4>
                <p className="text-xs">
                  Burning tokens is permanent and cannot be undone. The tokens are sent to a burn address 
                  and removed from circulation forever. Always double-check the amount before confirming.
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                PumpLogic Burn is currently in beta and available to whitelisted users only.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="preview-mode" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-primary" />
                Preview Mode
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                Preview Mode allows you to explore PumpLogic's features before connecting your wallet. 
                You can browse all pages and see how the interface works, but actions that require 
                wallet interaction are disabled.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">What You Can Do in Preview Mode</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Explore the Interface</p>
                      <p className="text-xs">Browse all pages, view sample data, and understand how features work</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">View Charts & Analytics</p>
                      <p className="text-xs">See sample allocation charts, distribution breakdowns, and UI layouts</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Test Guard Scanner</p>
                      <p className="text-xs">Analyze tokens for rug-pull risks without connecting your wallet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Connecting to Exit Preview Mode</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                    <p className="text-sm">Click the <span className="text-primary font-semibold">Connect Wallet</span> button in the preview banner</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                    <p className="text-sm">Select your preferred wallet (Phantom, Solflare, or Backpack)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
                    <p className="text-sm">Approve the connection in your wallet extension</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">4</div>
                    <p className="text-sm">The preview banner disappears and all features become available</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="text-primary font-semibold mb-2">Tip: No Risk Exploration</h4>
                <p className="text-xs">
                  Preview Mode is perfect for learning the platform before committing any funds. 
                  Take your time to understand each feature - no transactions can be made until 
                  you connect your wallet.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="telegram" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                Telegram Notifications
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                The PumpLogic Telegram Bot keeps you informed about your fee distributions in real-time. 
                Receive instant notifications when distributions complete, fees accumulate, or large purchases occur.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">Setup Guide</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                    <p className="text-sm">Open Telegram and search for <span className="text-primary font-mono">@PumpLogicBot</span></p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                    <p className="text-sm">Send <span className="text-primary font-mono">/start</span> to get your unique Chat ID</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
                    <p className="text-sm">In your Dashboard, click "Notifications" and paste your Chat ID</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">4</div>
                    <p className="text-sm">Enable notifications and choose your alert preferences</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Distribution Confirmations</p>
                      <p className="text-xs">Get notified when a distribution completes with amount breakdown</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                      <Coins className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Fee Ready Alerts</p>
                      <p className="text-xs">Receive alerts when your wallet has accumulated fees</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Large Buy Alerts</p>
                      <p className="text-xs">Get notified when significant token purchases occur</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Bot Commands</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-2">
                  <div className="flex gap-3 items-start">
                    <code className="bg-primary/20 text-primary px-2 py-0.5 rounded font-mono text-xs shrink-0">/start</code>
                    <p className="text-xs">Get your unique Chat ID for linking</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <code className="bg-primary/20 text-primary px-2 py-0.5 rounded font-mono text-xs shrink-0">/status</code>
                    <p className="text-xs">Check your current notification settings</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <code className="bg-primary/20 text-primary px-2 py-0.5 rounded font-mono text-xs shrink-0">/help</code>
                    <p className="text-xs">Display available commands</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="token-settings" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Coins className="h-5 w-5 text-primary" />
                Token Settings
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                The Token Settings feature allows you to configure your token information in PumpLogic. 
                This helps track your token's fees and enables blockchain monitoring.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">Configuration Fields</h4>
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Token Name & Symbol</h5>
                    <p className="text-xs">Your token's display name and ticker symbol for dashboard display.</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Token Contract Address</h5>
                    <p className="text-xs">The mint address of your token on Solana. Find this on Pump.fun or Solscan.</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Fee Collection Wallet</h5>
                    <p className="text-xs">The wallet where trading fees accumulate. Used for balance monitoring.</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Fee Percentage</h5>
                    <p className="text-xs">The trading fee percentage set on your token (1-10%).</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="blockchain-monitoring" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                Blockchain Monitoring
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                PumpLogic includes real-time blockchain monitoring that automatically watches your token 
                for trading activity. The system polls Solana every 30 seconds to detect significant events.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">What Gets Monitored</h4>
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Large Token Purchases</h5>
                    <p className="text-xs">
                      When someone buys 10,000+ tokens in a single transaction, you'll receive a Telegram 
                      notification with the buyer's address and purchase amount.
                    </p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Fee Wallet Balance</h5>
                    <p className="text-xs">
                      If you configure a fee collection wallet, the system monitors its balance and notifies 
                      you when fees accumulate above 0.01 SOL.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Per-User Token Support</h4>
                <ul className="text-xs space-y-2 list-disc list-inside">
                  <li>Your Token Settings are private to your account</li>
                  <li>Monitoring runs separately for each user's token</li>
                  <li>Telegram notifications go only to your configured Chat ID</li>
                  <li>Other users' tokens don't affect your monitoring</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">How to Enable</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-2">
                  <div className="flex gap-3">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">Open Token Settings from your Dashboard</p>
                  </div>
                  <div className="flex gap-3">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">Enter your token's contract address</p>
                  </div>
                  <div className="flex gap-3">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">Save settings - monitoring starts automatically</p>
                  </div>
                  <div className="flex gap-3">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">Enable Telegram notifications to receive alerts</p>
                  </div>
                </div>
              </div>

            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="multi-wallet" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Link className="h-5 w-5 text-primary" />
                Multi-Wallet Support
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                Link multiple Solana wallets to your PumpLogic account. This feature is useful if you manage 
                tokens from different wallets or want to keep your fee collection wallets separate.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">How to Use</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                    <p className="text-sm">Click "Linked" in the dashboard header to open the wallet manager</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                    <p className="text-sm">Enter a wallet address and optional label to identify it</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
                    <p className="text-sm">Click "Add Wallet" to save it to your account</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">4</div>
                    <p className="text-sm">Use "Set Active" to switch between wallets for different operations</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Features</h4>
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Wallet Labels</h5>
                    <p className="text-xs">Add custom labels like "Fee Wallet" or "Trading Bot" to easily identify each wallet.</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Active Wallet</h5>
                    <p className="text-xs">The active wallet is highlighted with a green indicator and used for context-specific operations.</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Quick Management</h5>
                    <p className="text-xs">Add or remove wallets at any time. Changes are saved instantly to your account.</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price-alerts" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                Price Alerts
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                Set up price alerts to get notified when any Solana token reaches your target price. 
                Alerts are checked every 60 seconds and can trigger Telegram notifications.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">Creating an Alert</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                    <p className="text-sm">Click "Alerts" in the dashboard header</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                    <p className="text-sm">Enter the token symbol (e.g., "BONK") and contract address</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
                    <p className="text-sm">Set your target price in USD</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">4</div>
                    <p className="text-sm">Choose direction: "Above" (price goes up) or "Below" (price goes down)</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Alert Status</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Active</p>
                      <p className="text-xs">Alert is being monitored - checking price every 60 seconds</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center shrink-0">
                      <Bell className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Triggered</p>
                      <p className="text-xs">Price target was reached - you were notified via Telegram</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-white/50" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Inactive</p>
                      <p className="text-xs">Alert is paused - use the toggle to reactivate</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="text-primary font-semibold mb-2">Telegram Required</h4>
                <p className="text-xs">
                  To receive price alert notifications, make sure you have Telegram notifications enabled 
                  in your dashboard settings with a valid Chat ID configured.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="multi-token" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-primary" />
                Multi-Token Settings
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-6 pb-6">
              <p>
                Manage multiple tokens from a single dashboard. Each token can have its own allocation 
                percentages, fee settings, and destination wallets.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">Adding a Token</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                    <p className="text-sm">Click "Token" in the dashboard header to open token management</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                    <p className="text-sm">Enter the token name, symbol, and contract address</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
                    <p className="text-sm">Optionally set the fee collection wallet and fee percentage</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">4</div>
                    <p className="text-sm">Click "Add Token" - the first token becomes active automatically</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Token Features</h4>
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Per-Token Allocations</h5>
                    <p className="text-xs">Each token stores its own allocation percentages for Market Making, Buyback, Liquidity, and Revenue.</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Active Token</h5>
                    <p className="text-xs">The active token (highlighted in green) is used for fee distribution. Switch active tokens with one click.</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <h5 className="text-white text-sm font-medium mb-2">Edit & Delete</h5>
                    <p className="text-xs">Update token settings anytime or remove tokens you no longer manage.</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                <h4 className="text-secondary font-semibold mb-2">Pro Tip</h4>
                <p className="text-xs">
                  Use different allocation strategies for different tokens based on their stage. 
                  New tokens might need more liquidity, while established tokens can focus on buybacks.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security" className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg px-6 hover:border-primary/30 transition-colors">
            <AccordionTrigger className="text-white text-xl font-display hover:no-underline py-6">
              <span className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                Security
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 pb-6">
              <p>
                PumpLogic never has access to your private keys. All transactions are signed locally in your 
                Phantom wallet before being submitted to the Solana network.
              </p>
              <p>
                Your wallet address is used for authentication and to create transactions, but signing authority 
                remains entirely with you. You approve every distribution before it executes.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <ul className="text-xs space-y-1">
                  <li>The bot never has access to your private keys</li>
                  <li>All transactions require manual Phantom wallet approval</li>
                  <li>Only your Telegram Chat ID is stored - no other personal data</li>
                  <li>Notifications are completely optional</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
