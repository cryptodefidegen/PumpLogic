import TelegramBot from "node-telegram-bot-api";
import { storage } from "../storage";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

let bot: TelegramBot | null = null;
let pollingErrorLogged = false;

export function initTelegramBot() {
  if (!BOT_TOKEN) {
    console.log("Telegram bot token not configured - notifications disabled");
    return null;
  }

  try {
    bot = new TelegramBot(BOT_TOKEN, { 
      polling: {
        interval: 2000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });
    console.log("Telegram bot initialized");

    bot.on("polling_error", (error: any) => {
      if (error.code === "ETELEGRAM" && error.message?.includes("409 Conflict")) {
        if (!pollingErrorLogged) {
          console.log("Telegram bot: Another instance is running. Notifications will still work for sending messages.");
          pollingErrorLogged = true;
        }
      } else {
        console.error("Telegram polling error:", error.message);
      }
    });

    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id.toString();
      await bot!.sendMessage(
        chatId,
        `Welcome to PumpLogic Notifications!\n\nYour Chat ID: \`${chatId}\`\n\nCopy this ID and paste it in your PumpLogic dashboard settings to receive notifications.\n\nYou'll get alerts for:\n• Distribution confirmations\n• Fee accumulation reminders\n• Large buyer activity (optional)`,
        { parse_mode: "Markdown" }
      );
    });

    bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id.toString();
      const settings = await storage.getTelegramSettingsByChatId(chatId);
      
      if (!settings) {
        await bot!.sendMessage(
          chatId,
          "Your Chat ID is not linked to any PumpLogic account.\n\nGo to your PumpLogic dashboard and enter this Chat ID in the Telegram settings.",
          { parse_mode: "Markdown" }
        );
        return;
      }

      await bot!.sendMessage(
        chatId,
        `*PumpLogic Notifications Status*\n\n` +
        `Enabled: ${settings.isEnabled ? "Yes" : "No"}\n` +
        `Distribution alerts: ${settings.notifyOnDistribution ? "On" : "Off"}\n` +
        `Fee ready alerts: ${settings.notifyOnFeeReady ? "On" : "Off"}\n` +
        `Large buy alerts: ${settings.notifyOnLargeBuy ? "On" : "Off"}`,
        { parse_mode: "Markdown" }
      );
    });

    bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id.toString();
      await bot!.sendMessage(
        chatId,
        `*PumpLogic Bot Commands*\n\n` +
        `/start - Get your Chat ID for linking\n` +
        `/status - Check your notification settings\n` +
        `/help - Show this help message\n\n` +
        `*Documentation:*\n` +
        `Visit the PumpLogic docs for detailed setup instructions.`,
        { parse_mode: "Markdown" }
      );
    });

    return bot;
  } catch (error) {
    console.error("Failed to initialize Telegram bot:", error);
    return null;
  }
}

export async function sendDistributionNotification(
  chatId: string,
  amount: string,
  breakdown: { marketMaking: number; buyback: number; liquidity: number; revenue: number },
  signature: string
) {
  if (!bot || !chatId) return;

  const message = 
    `*Distribution Complete*\n\n` +
    `Total: ${amount} SOL\n\n` +
    `*Breakdown:*\n` +
    `• Market Making: ${(breakdown.marketMaking * parseFloat(amount)).toFixed(4)} SOL\n` +
    `• Buyback & Burn: ${(breakdown.buyback * parseFloat(amount)).toFixed(4)} SOL\n` +
    `• Liquidity Pool: ${(breakdown.liquidity * parseFloat(amount)).toFixed(4)} SOL\n` +
    `• Creator Revenue: ${(breakdown.revenue * parseFloat(amount)).toFixed(4)} SOL\n\n` +
    `[View on Solscan](https://solscan.io/tx/${signature})`;

  try {
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

export async function sendFeeReadyNotification(chatId: string, balance: string, dashboardUrl: string) {
  if (!bot || !chatId) return;

  const message = 
    `*Fees Ready to Distribute*\n\n` +
    `Your wallet has accumulated ${balance} SOL ready for distribution.\n\n` +
    `[Open Dashboard](${dashboardUrl}) to distribute now.`;

  try {
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

export async function sendLargeBuyNotification(chatId: string, buyer: string, amount: string, tokenCA: string) {
  if (!bot || !chatId) return;

  const message = 
    `*Large Buy Detected*\n\n` +
    `Buyer: \`${buyer.slice(0, 8)}...${buyer.slice(-6)}\`\n` +
    `Amount: ${amount} tokens\n\n` +
    `[View Token](https://solscan.io/token/${tokenCA})`;

  try {
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

export function getBot() {
  return bot;
}
