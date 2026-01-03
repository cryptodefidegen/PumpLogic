# PumpLogic - Programmable Liquidity Platform

## Overview

PumpLogic is a Solana-based DeFi platform that enables creators to automatically route token fees into market making, buybacks, liquidity provision, and revenue distribution. The application provides a dashboard for managing fee allocations across these four categories with AI-powered optimization and automated distribution via Phantom wallet integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for wallet state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints under `/api` prefix
- **Development**: Hot module replacement via Vite middleware in development mode
- **Production**: Static file serving from compiled dist folder

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema management (`drizzle-kit push`)
- **Tables**:
  - `users`: Wallet addresses and creation timestamps
  - `allocations`: Fee distribution percentages per user
  - `transactions`: Transaction history and signatures
  - `automationConfigs`: Automation settings per user
  - `destinationWallets`: Target wallets for each allocation category

### Authentication
- Multi-wallet support: Phantom, Solflare, and Backpack wallets
- No traditional username/password - users authenticate by connecting their Solana wallet
- Session persistence via localStorage with wallet address and provider name
- Wallet selection modal shows all supported wallets with install links for missing ones

### Key Design Patterns
- **Shared Types**: Schema types are shared between frontend and backend via `@shared/*` path alias
- **Storage Interface**: `IStorage` interface in `server/storage.ts` abstracts database operations
- **API Client**: Centralized API functions in `client/src/lib/api.ts`
- **Context Providers**: Wallet state managed through React Context (`WalletContext`)

## External Dependencies

### Blockchain
- **Solana Web3.js**: Core Solana blockchain interactions
- **Phantom Wallet**: Primary wallet integration for transaction signing
- **RPC Endpoint**: Configurable via `SOLANA_RPC_URL` environment variable (defaults to mainnet-beta)

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **pg**: Node.js PostgreSQL client
- **connect-pg-simple**: PostgreSQL session store for Express

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **TypeScript**: Full stack type safety

### UI Framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-styled component collection
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

## Feature Notes

### API Provider System
- **Location**: `client/src/lib/tokenApi.ts` (unified API client)
- **Context**: `client/src/contexts/ApiProviderContext.tsx` (provider state management)
- **Supported Providers**:
  - **VoidScreener**: `https://rehreqnnkhczmpaytulk.supabase.co/functions/v1` (default)
  - **DexScreener**: `https://api.dexscreener.com/latest/dex` (fallback)
- **Features**:
  - Token analytics lookup (getTokenAnalytics)
  - Token with risk factors (getTokenWithRiskFactors)
  - Whale alerts (getWhaleAlerts) - VoidScreener only
- **Toggle**: Navbar button visible only to whitelisted address `9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8`
- **Persistence**: Provider selection saved to localStorage (`pumplogic_api_provider`)
- **Rate Limits**: VoidScreener 60 req/min, DexScreener standard limits
- **Note**: Whale alerts unavailable when using DexScreener (shows notice in Guard)

### PumpLogic Guard
- **Location**: `/guard` route, available to all users
- **Features**:
  - Token Scanner: Analyze any Solana token for rug-pull risks using VoidScreener API
  - Whale Alerts: Real-time large transaction monitoring from VoidScreener (buy/sell/transfer with tx links)
  - Risk Alerts: Watchlist monitoring for tracked tokens
  - Tax Reports: Date range selection and CSV export for transaction history
- **API Integration**: Uses VoidScreener API for token data and whale alerts
### Token Burn Feature
- **Location**: `/burn` route, available to all users
- **Features**:
  - Manual token burning for any SPL token
  - Token metadata display: name, image, symbol, price, FDV, 24h price change
  - On-chain data: total supply, decimals, mint authority status, freeze authority status
  - Burn impact calculation: USD value and percentage of total supply
  - Two-step confirmation modal with burn summary before executing
  - In-session burn history tracking with Solscan transaction links
  - Enhanced UI with tooltips, animated transitions, two-column layout
- **Implementation**: Uses native @solana/web3.js with manual SPL Token burn instruction (avoids Buffer polyfill issues)

### PumpLogic Deployer (In Development)
- **Location**: `/deployer` route, available to all users
- **Status**: In Development
- **Features**:
  - One-click Pump.fun token deployment
  - Token metadata form: name, symbol, description, image upload
  - Optional banner image upload (1500x500 recommended)
  - Optional social links: Twitter, Telegram, Website
  - Launch templates: Fair Launch (0 SOL), Standard (0.5 SOL), Meme Token (1 SOL)
  - Custom initial buy configuration
  - Live token preview card
  - Cost breakdown calculator
  - Post-deploy success dialog with contract address, copy button, and quick links to Pump.fun, Solscan, Guard, Burn, Allocator
  - Deployment history: persisted record of all tokens deployed by connected wallet
- **API Integration**: Uses Pump.fun API for IPFS metadata upload and PumpPortal for transaction creation
- **Database**: `deployment_records` table stores wallet address, mint address, signature, token name/symbol/description, and timestamp
- **Implementation**: Client-side deployment with wallet transaction signing, server-side history persistence