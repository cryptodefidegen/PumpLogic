import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, MessageCircle, Shield, Zap, Settings, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TelegramDocs() {
  return (
    <div className="min-h-screen text-foreground pb-20">
      <div className="container mx-auto px-4 pt-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 text-white">Telegram Bot</h1>
          <p className="text-xl text-muted-foreground">Get real-time notifications for your PumpLogic distributions</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                The PumpLogic Telegram Bot keeps you informed about your fee distributions in real-time. 
                Receive instant notifications when distributions complete, fees accumulate, or large purchases occur.
              </p>
              <p>
                The bot uses a secure notification-only model. It never has access to your private keys or wallet - 
                all it does is send you messages about your PumpLogic activity.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <Step 
                  number={1}
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="Find the Bot"
                  description="Open Telegram and search for @PumpLogicBot, or click the link to open the bot directly."
                />
                <Step 
                  number={2}
                  icon={<Zap className="h-5 w-5" />}
                  title="Start the Bot"
                  description="Send /start to the bot. It will respond with your unique Chat ID - a number like 123456789."
                />
                <Step 
                  number={3}
                  icon={<Settings className="h-5 w-5" />}
                  title="Open Dashboard Settings"
                  description="Go to your PumpLogic Dashboard and click the 'Notifications' button in the top bar next to 'Configure Wallets'."
                />
                <Step 
                  number={4}
                  icon={<CheckCircle className="h-5 w-5" />}
                  title="Enter Your Chat ID"
                  description="Paste your Chat ID from the Telegram bot, enable notifications, and select which alerts you want to receive."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Notification Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationType 
                icon={<CheckCircle className="h-6 w-6 text-primary" />}
                title="Distribution Confirmations"
                color="bg-primary/20"
                description="Receive a message every time a distribution is completed successfully. Includes the total amount distributed, breakdown by channel, and transaction signature for on-chain verification."
              />
              <Separator className="bg-white/5" />
              <NotificationType 
                icon={<Zap className="h-6 w-6 text-secondary" />}
                title="Fee Ready Alerts"
                color="bg-secondary/20"
                description="Get notified when your fee wallet has accumulated enough SOL for a meaningful distribution. Configure your threshold in the dashboard to control when these alerts trigger."
              />
              <Separator className="bg-white/5" />
              <NotificationType 
                icon={<MessageCircle className="h-6 w-6 text-blue-400" />}
                title="Large Buy Alerts"
                color="bg-blue-400/20"
                description="Receive alerts when a large purchase of your token occurs. This helps you stay informed about significant market activity that may generate fees."
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                Bot Commands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="grid gap-4">
                  <Command 
                    command="/start"
                    description="Initialize the bot and get your unique Chat ID. Use this ID in the PumpLogic dashboard to link your Telegram account."
                  />
                  <Command 
                    command="/status"
                    description="Check your current notification settings. Shows whether notifications are enabled and which alert types are active."
                  />
                  <Command 
                    command="/help"
                    description="Display available commands and links to documentation."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                The PumpLogic Telegram Bot follows a <span className="text-white font-medium">notification-only</span> security model. 
                Here's what that means for you:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><span className="text-white font-medium">No Private Keys:</span> The bot never requests, stores, or has access to your private keys. Your wallet security is never at risk.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><span className="text-white font-medium">No Automated Transactions:</span> The bot cannot execute transactions on your behalf. All distributions still require your manual approval via Phantom wallet.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><span className="text-white font-medium">Chat ID Only:</span> The only data stored is your Telegram Chat ID (a number), which allows the bot to send you messages.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><span className="text-white font-medium">Opt-In:</span> Notifications are completely optional. You can disable them at any time from the dashboard.</span>
                </li>
              </ul>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
                <p className="text-sm text-primary">
                  <strong>Why This Matters:</strong> Unlike some DeFi automation bots that require private key access, 
                  PumpLogic's approach ensures you maintain full custody of your funds at all times. 
                  The bot is purely informational.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-display">Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <TroubleshootItem 
                  question="I'm not receiving notifications"
                  answer="Make sure you've enabled notifications in the dashboard settings and entered the correct Chat ID. Also check that you haven't muted the bot in Telegram."
                />
                <TroubleshootItem 
                  question="Where do I find my Chat ID?"
                  answer="Send /start to @PumpLogicBot in Telegram. The bot will reply with your unique Chat ID."
                />
                <TroubleshootItem 
                  question="Can I change notification settings?"
                  answer="Yes! Go to your Dashboard and click the 'Notifications' button. You can enable/disable specific notification types or turn off notifications entirely."
                />
                <TroubleshootItem 
                  question="Is the bot safe to use?"
                  answer="Yes. The bot only sends notifications - it never has access to your private keys, cannot execute transactions, and cannot access your funds."
                />
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <Link href="/app">
              <Button className="bg-primary text-black hover:bg-primary/90" data-testid="button-goto-dashboard">
                Go to Dashboard
              </Button>
            </Link>
          </div>
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

function NotificationType({ icon, title, color, description }: { icon: React.ReactNode; title: string; color: string; description: string }) {
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

function Command({ command, description }: { command: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <code className="bg-primary/20 text-primary px-3 py-1 rounded font-mono text-sm shrink-0">{command}</code>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function TroubleshootItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
      <h4 className="text-white font-medium mb-2">{question}</h4>
      <p className="text-muted-foreground text-sm">{answer}</p>
    </div>
  );
}
