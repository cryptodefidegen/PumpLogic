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
- Wallet-based authentication using Phantom wallet
- No traditional username/password - users authenticate by connecting their Solana wallet
- Session persistence via localStorage with wallet address

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

### PumpLogic Guard (Beta)
- **Location**: `/guard` route, restricted to whitelisted addresses only
- **Whitelist**: Deployer address `9mRTLVQXjF2Fj9TkzUzmA7Jk22kAAq5Ssx4KykQQHxn8`
- **Features**:
  - Token Scanner: Analyze any Solana token for rug-pull risks (liquidity lock, holder concentration, authority status)
  - Risk Alerts: Real-time monitoring with sample alerts for large holder movements, liquidity changes
  - Tax Reports: Date range selection and CSV export for transaction history
- **Access Control**: Non-whitelisted users see "SOON" badge in navbar (non-clickable), whitelisted see "BETA" badge (clickable)