import puppeteer, { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';

const APP_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(process.cwd(), 'public');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'guide-screenshots');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function ensureDirectories() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function captureScreenshots(page: Page) {
  const screenshots: Record<string, string> = {};

  // Home page
  console.log('Capturing home page...');
  await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'home.png'), fullPage: false });
  screenshots['home'] = 'home.png';

  // Dashboard page - simulate wallet connection by setting localStorage
  console.log('Capturing dashboard...');
  await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);
  
  // Take dashboard screenshot
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'dashboard.png'), fullPage: false });
  screenshots['dashboard'] = 'dashboard.png';

  // Scroll to allocation sliders
  console.log('Capturing allocation sliders...');
  await page.evaluate(() => {
    const element = document.querySelector('[data-testid="slider-market-making"]');
    if (element) element.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await delay(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'allocations.png'), fullPage: false });
  screenshots['allocations'] = 'allocations.png';

  // Scroll to optimizer section and capture
  console.log('Capturing optimizer section...');
  try {
    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="button-run-optimizer"]');
      if (element) element.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ai-optimizer.png'), fullPage: false });
    screenshots['ai-optimizer'] = 'ai-optimizer.png';
  } catch (e) {
    console.log('Could not capture optimizer section');
  }

  // Capture telegram settings dialog
  console.log('Capturing telegram settings dialog...');
  try {
    await page.click('[data-testid="button-telegram-settings"]');
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'notifications.png'), fullPage: false });
    screenshots['notifications'] = 'notifications.png';
    await page.keyboard.press('Escape');
    await delay(500);
  } catch (e) {
    console.log('Could not capture telegram settings dialog');
  }

  // Capture token settings
  console.log('Capturing token settings...');
  try {
    await page.click('[data-testid="button-token-settings"]');
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'token-settings.png'), fullPage: false });
    screenshots['token-settings'] = 'token-settings.png';
    await page.keyboard.press('Escape');
    await delay(500);
  } catch (e) {
    console.log('Could not capture token settings dialog');
  }

  // Scroll to manual distribution
  console.log('Capturing manual distribution...');
  await page.evaluate(() => {
    const element = document.querySelector('[data-testid="input-distribution-amount"]');
    if (element) element.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await delay(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'distribution.png'), fullPage: false });
  screenshots['distribution'] = 'distribution.png';

  // Scroll to activity log
  console.log('Capturing activity log...');
  await page.evaluate(() => {
    const element = document.querySelector('[data-testid="section-activity-log"]');
    if (element) element.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await delay(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'activity-log.png'), fullPage: false });
  screenshots['activity-log'] = 'activity-log.png';

  // Docs page
  console.log('Capturing docs page...');
  await page.goto(`${APP_URL}/docs`, { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'docs.png'), fullPage: false });
  screenshots['docs'] = 'docs.png';

  return screenshots;
}

function generateHTML(screenshots: Record<string, string>) {
  const logoPath = path.join(process.cwd(), 'attached_assets', 'generated_images', 'pump_logic_logo.png');
  let logoBase64 = '';
  if (fs.existsSync(logoPath)) {
    const logoData = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
  }

  const screenshotImages: Record<string, string> = {};
  for (const [key, filename] of Object.entries(screenshots)) {
    const imgPath = path.join(SCREENSHOTS_DIR, filename);
    if (fs.existsSync(imgPath)) {
      const imgData = fs.readFileSync(imgPath);
      screenshotImages[key] = `data:image/png;base64,${imgData.toString('base64')}`;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PumpLogic User Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0a0a0a;
      color: #ffffff;
      line-height: 1.6;
      width: 210mm;
    }
    
    .page {
      page-break-after: always;
      padding: 50px;
      min-height: 297mm;
      width: 210mm;
      background: #0a0a0a;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: linear-gradient(180deg, #0a0a0a 0%, #0f1419 50%, #1a1a2e 100%);
    }
    
    .logo {
      width: 120px;
      height: 120px;
      margin-bottom: 30px;
    }
    
    h1 {
      font-size: 42px;
      font-weight: 700;
      color: #00ff9d;
      margin-bottom: 15px;
    }
    
    .subtitle {
      font-size: 22px;
      color: #888;
      margin-bottom: 30px;
    }
    
    .tagline {
      font-size: 16px;
      color: #00ff9d;
      border: 1px solid #00ff9d;
      padding: 12px 25px;
      border-radius: 8px;
    }
    
    h2 {
      font-size: 28px;
      color: #00ff9d;
      margin-bottom: 18px;
      padding-bottom: 8px;
      border-bottom: 2px solid #00ff9d33;
    }
    
    h3 {
      font-size: 20px;
      color: #ffffff;
      margin: 20px 0 12px 0;
    }
    
    p {
      font-size: 14px;
      color: #cccccc;
      margin-bottom: 12px;
    }
    
    .step {
      background: #1a1a2e;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 10px 0;
      border-left: 4px solid #00ff9d;
      display: flex;
      align-items: center;
    }
    
    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      min-width: 28px;
      background: #00ff9d;
      color: #0a0a0a;
      border-radius: 50%;
      font-weight: 700;
      font-size: 14px;
      margin-right: 12px;
    }
    
    .step-content {
      font-size: 14px;
      color: #ffffff;
    }
    
    .screenshot {
      width: 100%;
      max-width: 500px;
      border-radius: 8px;
      border: 2px solid #333;
      margin: 15px auto;
      display: block;
      box-shadow: 0 8px 30px rgba(0, 255, 157, 0.1);
    }
    
    .tip {
      background: linear-gradient(135deg, #00ff9d15 0%, #00ff9d05 100%);
      border: 1px solid #00ff9d33;
      border-radius: 8px;
      padding: 16px;
      margin: 15px 0;
    }
    
    .tip-title {
      color: #00ff9d;
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }
    
    .feature-card {
      background: #1a1a2e;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #333;
    }
    
    .feature-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .feature-title {
      color: #00ff9d;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .footer {
      text-align: center;
      padding: 40px;
      border-top: 1px solid #333;
      margin-top: 40px;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 20px;
    }
    
    .footer-link {
      color: #00ff9d;
      text-decoration: none;
    }
    
    ul {
      margin: 15px 0 15px 30px;
    }
    
    li {
      color: #cccccc;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover">
    ${logoBase64 ? `<img src="${logoBase64}" alt="PumpLogic Logo" class="logo">` : ''}
    <h1>PumpLogic</h1>
    <p class="subtitle">User Guide</p>
    <p class="tagline">Programmable Liquidity for Solana Tokens</p>
    <p style="margin-top: 60px; color: #666;">Version 1.0 | December 2025</p>
  </div>

  <!-- Getting Started -->
  <div class="page">
    <h2>🚀 Getting Started</h2>
    <p>Welcome to PumpLogic! This guide will walk you through setting up and using all features of the platform.</p>
    
    <h3>What is PumpLogic?</h3>
    <p>PumpLogic is a DeFi platform that enables Solana token creators to automatically route fees into:</p>
    <ul>
      <li><strong>Market Making</strong> - Improve trading depth and volume</li>
      <li><strong>Buyback</strong> - Support token price with strategic purchases</li>
      <li><strong>Liquidity Pool</strong> - Build deeper DEX liquidity</li>
      <li><strong>Creator Revenue</strong> - Your earnings as the creator</li>
    </ul>
    
    <h3>Connect Your Wallet</h3>
    <div class="step">
      <span class="step-number">1</span>
      <span class="step-content">Visit pumplogic.live</span>
    </div>
    <div class="step">
      <span class="step-number">2</span>
      <span class="step-content">Click "Connect Wallet" in the top right</span>
    </div>
    <div class="step">
      <span class="step-number">3</span>
      <span class="step-content">Approve the Phantom wallet connection</span>
    </div>
    <div class="step">
      <span class="step-number">4</span>
      <span class="step-content">You're in! Your dashboard is now live.</span>
    </div>

    ${screenshotImages['home'] ? `<img src="${screenshotImages['home']}" alt="Home Page" class="screenshot">` : ''}
  </div>

  <!-- Dashboard Overview -->
  <div class="page">
    <h2>📊 Dashboard Overview</h2>
    <p>The dashboard is your command center for managing fee distributions.</p>
    
    ${screenshotImages['dashboard'] ? `<img src="${screenshotImages['dashboard']}" alt="Dashboard" class="screenshot">` : ''}
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-title">Allocation Sliders</div>
        <p>Set percentages for each distribution category</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">Quick Actions</div>
        <p>Access wallets, alerts, token settings, and presets</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">Manual Distribution</div>
        <p>Send fees to configured wallets with one click</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">Activity Log</div>
        <p>Track all transactions with Solscan links</p>
      </div>
    </div>
  </div>

  <!-- Fee Allocations -->
  <div class="page">
    <h2>⚙️ Setting Up Fee Allocations</h2>
    <p>Configure how your fees are distributed across the four categories.</p>
    
    <div class="step">
      <span class="step-number">1</span>
      <span class="step-content">Use the sliders to set each category's percentage</span>
    </div>
    <div class="step">
      <span class="step-number">2</span>
      <span class="step-content">Ensure the total adds up to 100%</span>
    </div>
    <div class="step">
      <span class="step-number">3</span>
      <span class="step-content">Click "Save Allocations" to confirm</span>
    </div>
    
    ${screenshotImages['allocations'] ? `<img src="${screenshotImages['allocations']}" alt="Allocations" class="screenshot">` : ''}
    
    <div class="tip">
      <div class="tip-title">💡 Pro Tip</div>
      <p>Use the "Save Preset" button to save your favorite configurations for quick access later!</p>
    </div>
  </div>

  <!-- Destination Wallets -->
  <div class="page">
    <h2>🏦 Configuring Destination Wallets</h2>
    <p>Set up where your fees should be sent for each category.</p>
    
    <div class="step">
      <span class="step-number">1</span>
      <span class="step-content">Click "Wallets" in the dashboard</span>
    </div>
    <div class="step">
      <span class="step-number">2</span>
      <span class="step-content">Enter a Solana wallet address for each category</span>
    </div>
    <div class="step">
      <span class="step-number">3</span>
      <span class="step-content">Click "Save Wallets" to confirm</span>
    </div>
    
    ${screenshotImages['wallets'] ? `<img src="${screenshotImages['wallets']}" alt="Wallet Configuration" class="screenshot">` : ''}
    
    <div class="tip">
      <div class="tip-title">💡 Best Practice</div>
      <p>Use separate wallets for each category for easier tracking. Your revenue wallet can be your personal wallet!</p>
    </div>
  </div>

  <!-- Manual Distribution -->
  <div class="page">
    <h2>💸 Manual Distribution</h2>
    <p>Distribute accumulated fees to your configured wallets.</p>
    
    <div class="step">
      <span class="step-number">1</span>
      <span class="step-content">Enter the SOL amount in "Manual Distribution"</span>
    </div>
    <div class="step">
      <span class="step-number">2</span>
      <span class="step-content">Click "Preview" to see the breakdown</span>
    </div>
    <div class="step">
      <span class="step-number">3</span>
      <span class="step-content">Review where each portion goes</span>
    </div>
    <div class="step">
      <span class="step-number">4</span>
      <span class="step-content">Click "Distribute Now" and sign in Phantom</span>
    </div>
    
    ${screenshotImages['distribution'] ? `<img src="${screenshotImages['distribution']}" alt="Manual Distribution" class="screenshot">` : ''}
    
    <p>Your fees are split and sent to all destination wallets in one transaction!</p>
  </div>

  <!-- AI Optimizer -->
  <div class="page">
    <h2>🤖 Using the AI Optimizer</h2>
    <p>Let AI analyze market conditions and suggest optimal allocations.</p>
    
    <div class="step">
      <span class="step-number">1</span>
      <span class="step-content">Find "Smart Optimizer" on your dashboard</span>
    </div>
    <div class="step">
      <span class="step-number">2</span>
      <span class="step-content">Click "Run AI"</span>
    </div>
    <div class="step">
      <span class="step-number">3</span>
      <span class="step-content">Wait for the analysis (checks network TPS, volatility, etc.)</span>
    </div>
    <div class="step">
      <span class="step-number">4</span>
      <span class="step-content">Review the suggested allocations</span>
    </div>
    <div class="step">
      <span class="step-number">5</span>
      <span class="step-content">Apply with one click!</span>
    </div>
    
    ${screenshotImages['ai-optimizer'] ? `<img src="${screenshotImages['ai-optimizer']}" alt="AI Optimizer" class="screenshot">` : ''}
  </div>

  <!-- Telegram Alerts -->
  <div class="page">
    <h2>🔔 Setting Up Telegram Alerts</h2>
    <p>Get real-time notifications for whale purchases and fee accumulation.</p>
    
    <h3>Connect Telegram</h3>
    <div class="step">
      <span class="step-number">1</span>
      <span class="step-content">Open Telegram and find @PumpLogicBot</span>
    </div>
    <div class="step">
      <span class="step-number">2</span>
      <span class="step-content">Send /start to get your Chat ID</span>
    </div>
    <div class="step">
      <span class="step-number">3</span>
      <span class="step-content">Click "Alerts" on your dashboard</span>
    </div>
    <div class="step">
      <span class="step-number">4</span>
      <span class="step-content">Paste your Chat ID and choose notification types</span>
    </div>
    
    ${screenshotImages['notifications'] ? `<img src="${screenshotImages['notifications']}" alt="Notification Settings" class="screenshot">` : ''}
    
    <h3>What You'll Get Notified About</h3>
    <ul>
      <li><strong>Whale Alerts</strong> - Large purchases (10,000+ tokens)</li>
      <li><strong>Fee Ready Alerts</strong> - When your fee wallet crosses 0.01 SOL</li>
      <li><strong>Distribution Confirmations</strong> - Full breakdown with Solscan links</li>
    </ul>
  </div>

  <!-- Token Settings -->
  <div class="page">
    <h2>🪙 Token Settings & Monitoring</h2>
    <p>Configure your token details for blockchain monitoring.</p>
    
    <div class="step">
      <span class="step-number">1</span>
      <span class="step-content">Click "Token" in your dashboard</span>
    </div>
    <div class="step">
      <span class="step-number">2</span>
      <span class="step-content">Enter your token's contract address (CA)</span>
    </div>
    <div class="step">
      <span class="step-number">3</span>
      <span class="step-content">Add your token name and symbol</span>
    </div>
    <div class="step">
      <span class="step-number">4</span>
      <span class="step-content">Save - monitoring starts automatically!</span>
    </div>
    
    ${screenshotImages['token-settings'] ? `<img src="${screenshotImages['token-settings']}" alt="Token Settings" class="screenshot">` : ''}
    
    <div class="tip">
      <div class="tip-title">💡 How It Works</div>
      <p>PumpLogic monitors the Solana blockchain for YOUR token's activity every 30 seconds. Combined with Telegram alerts, you'll know instantly when big moves happen!</p>
    </div>
  </div>

  <!-- Activity Log -->
  <div class="page">
    <h2>📋 Activity Log & Export</h2>
    <p>Track all your distribution history with full transparency.</p>
    
    ${screenshotImages['activity-log'] ? `<img src="${screenshotImages['activity-log']}" alt="Activity Log" class="screenshot">` : ''}
    
    <h3>View Transaction Details</h3>
    <ul>
      <li>Transaction type (Distribution, Optimize, etc.)</li>
      <li>Amounts and details</li>
      <li>Solscan links for on-chain verification</li>
      <li>Timestamps for all activities</li>
    </ul>
    
    <h3>Export Your Data</h3>
    <p>Click "Export CSV" to download your complete transaction history. Perfect for:</p>
    <ul>
      <li>Record keeping</li>
      <li>Tax documentation</li>
      <li>Showing your community you're legit!</li>
    </ul>
  </div>

  <!-- Quick Presets -->
  <div class="page">
    <h2>⚡ Quick Presets</h2>
    <p>Switch between different allocation strategies with one click.</p>
    
    <h3>Built-in Presets</h3>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-title">Aggressive Buyback</div>
        <p>Maximum buying pressure to support token price</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">Liquidity Focus</div>
        <p>Build deep pools for better trading</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">Balanced</div>
        <p>Even distribution across all categories</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">Creator Max</div>
        <p>Maximize your revenue earnings</p>
      </div>
    </div>
    
    <h3>Save Custom Presets</h3>
    <div class="step">
      <span class="step-number">1</span>
      <span class="step-content">Set your preferred allocations</span>
    </div>
    <div class="step">
      <span class="step-number">2</span>
      <span class="step-content">Click "Save Preset"</span>
    </div>
    <div class="step">
      <span class="step-number">3</span>
      <span class="step-content">Name your preset</span>
    </div>
    <div class="step">
      <span class="step-number">4</span>
      <span class="step-content">Load it anytime with one click!</span>
    </div>
  </div>

  <!-- Final Page -->
  <div class="page">
    <h2>🎉 You're Ready!</h2>
    <p>You now have everything you need to use PumpLogic effectively.</p>
    
    <h3>Quick Tips for Success</h3>
    <ul>
      <li>Use a dedicated fee wallet for cleaner tracking</li>
      <li>Set up Telegram alerts BEFORE your token launches</li>
      <li>Save your favorite allocation presets</li>
      <li>Check the AI optimizer for market-aware suggestions</li>
      <li>Export your CSV regularly for records</li>
    </ul>
    
    <h3>Need Help?</h3>
    <p>Check out our documentation or join the community:</p>
    
    <div class="footer">
      <h1 style="font-size: 36px;">PumpLogic</h1>
      <p style="color: #888;">Programmable Liquidity for Solana</p>
      <div class="footer-links">
        <span class="footer-link">🌐 pumplogic.live</span>
        <span class="footer-link">💬 t.me/PumpLogicSol</span>
        <span class="footer-link">🐦 x.com/i/communities/2004770032832929819</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('Starting PDF guide generation...');
  
  await ensureDirectories();
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  let screenshots: Record<string, string> = {};
  
  try {
    console.log('Capturing screenshots from app...');
    screenshots = await captureScreenshots(page);
    console.log(`Captured ${Object.keys(screenshots).length} screenshots`);
  } catch (error) {
    console.log('Could not capture all screenshots, continuing with available ones...');
  }
  
  console.log('Generating HTML guide...');
  const html = generateHTML(screenshots);
  
  const htmlPath = path.join(OUTPUT_DIR, 'pumplogic-guide.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML saved to ${htmlPath}`);
  
  console.log('Generating PDF...');
  const pdfPage = await browser.newPage();
  await pdfPage.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await delay(2000);
  
  const pdfPath = path.join(OUTPUT_DIR, 'PumpLogic-User-Guide.pdf');
  await pdfPage.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    timeout: 60000
  });
  
  console.log(`PDF saved to ${pdfPath}`);
  
  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
