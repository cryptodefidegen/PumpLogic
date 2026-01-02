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

### VoidScreener API Integration
- **Location**: `client/src/lib/voidscreener.ts`
- **Base URL**: `https://rehreqnnkhczmpaytulk.supabase.co/functions/v1`
- **Features**:
  - Token data lookup by address (getPairs, getToken)
  - Whale alerts for large transactions (getWhaleAlerts)
  - Token search functionality
  - Token analytics aggregation (getTokenAnalytics)
- **Rate Limit**: 60 requests/minute, no API key required
- **Usage**: Replaces DexScreener API for Guard token scanner and Analytics token lookup

### PumpLogic Guard (Beta)
- **Location**: `/guard` route, restricted to whitelisted addresses only
- **Whitelist**: Deployer address `9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8`
- **Features**:
  - Token Scanner: Analyze any Solana token for rug-pull risks using VoidScreener API
  - Whale Alerts: Real-time large transaction monitoring from VoidScreener (buy/sell/transfer with tx links)
  - Risk Alerts: Watchlist monitoring for tracked tokens
  - Tax Reports: Date range selection and CSV export for transaction history
- **API Integration**: Uses VoidScreener API for token data and whale alerts
- **Access Control**: Non-whitelisted users see "SOON" badge in navbar (non-clickable), whitelisted see "BETA" badge (clickable)

### Token Burn Feature
- **Location**: `/burn` route, restricted to whitelisted addresses only
- **Whitelist**: Deployer address `9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8`
- **Features**:
  - Manual token burning for any SPL token
  - Token metadata display: name, image, symbol, price, FDV, 24h price change
  - On-chain data: total supply, decimals, mint authority status, freeze authority status
  - Burn impact calculation: USD value and percentage of total supply
  - Two-step confirmation modal with burn summary before executing
  - In-session burn history tracking with Solscan transaction links
  - Enhanced UI with tooltips, animated transitions, two-column layout
- **Access Control**: Non-whitelisted users see "SOON" badge in navbar (non-clickable), whitelisted see "BETA" badge (clickable)
- **Implementation**: Uses native @solana/web3.js with manual SPL Token burn instruction (avoids Buffer polyfill issues)