import { storage } from "../storage";
import { sendPriceAlertNotification } from "./telegram";

const POLL_INTERVAL = 60000; // Check every 60 seconds
let intervalId: NodeJS.Timeout | null = null;

async function getTokenPrice(tokenAddress: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.jup.ag/price/v2?ids=${tokenAddress}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const priceData = data.data?.[tokenAddress];
    
    if (priceData && priceData.price) {
      return parseFloat(priceData.price);
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch price for ${tokenAddress}:`, error);
    return null;
  }
}

async function checkPriceAlerts() {
  try {
    const activeAlerts = await storage.getActivePriceAlerts();
    
    if (activeAlerts.length === 0) {
      return;
    }

    for (const alert of activeAlerts) {
      const currentPrice = await getTokenPrice(alert.tokenAddress);
      
      if (currentPrice === null) {
        continue;
      }

      const targetPrice = parseFloat(alert.targetPrice);
      let shouldTrigger = false;

      if (alert.direction === "above" && currentPrice >= targetPrice) {
        shouldTrigger = true;
      } else if (alert.direction === "below" && currentPrice <= targetPrice) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        await storage.triggerPriceAlert(alert.id);

        const user = await storage.getUser(alert.userId);
        if (user) {
          const telegramSettings = await storage.getTelegramSettings(alert.userId);
          
          if (telegramSettings?.isEnabled && telegramSettings.chatId) {
            await sendPriceAlertNotification(
              telegramSettings.chatId,
              alert.tokenSymbol,
              alert.tokenAddress,
              alert.targetPrice,
              alert.direction,
              currentPrice.toFixed(6)
            );
          }
        }

        console.log(
          `Price alert triggered for ${alert.tokenSymbol}: ` +
          `target $${alert.targetPrice} (${alert.direction}), current $${currentPrice.toFixed(6)}`
        );
      }
    }
  } catch (error) {
    console.error("Error checking price alerts:", error);
  }
}

export function startPriceAlertMonitor() {
  if (intervalId) {
    console.log("Price alert monitor already running");
    return;
  }

  console.log("Starting price alert monitor...");
  checkPriceAlerts();
  intervalId = setInterval(checkPriceAlerts, POLL_INTERVAL);
}

export function stopPriceAlertMonitor() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Price alert monitor stopped");
  }
}
