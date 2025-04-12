# BrickBase Frontend

Frontend application for the BrickBase real estate tokenization platform.

## Overview

This Next.js application provides the user interface for interacting with the BrickBase platform, enabling users to:
- Browse tokenized properties
- Purchase and manage property tokens
- Participate in DAO governance
- View property details and transaction history
- Connect wallets and manage investments

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Ethers.js
- **State Management**: React Query
- **Wallet Connection**: Web3Modal
- **UI Components**: shadcn/ui

## Project Structure

```
src/
├── app/                    # App router pages
├── components/            
│   ├── common/            # Reusable components
│   ├── layout/            # Layout components
│   └── web3/              # Web3 specific components
├── config/                # Configuration files
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── services/              # API and blockchain services
├── store/                 # State management
└── types/                 # TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn
- MetaMask or similar Web3 wallet

### Installation

1. Clone the repository
```
git clone https://github.com/Ewid/brickbase-frontend.git
cd brickbase-frontend
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
```
cp .env.example .env.local
```

4. Start the development server
```
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia testnet
NEXT_PUBLIC_INFURA_ID=your_infura_id
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Development

### Key Features Implementation

1. **Property Listing**
   - Grid view of available properties
   - Detailed property information
   - Real-time price updates

2. **Investment Management**
   - Token purchase interface
   - Portfolio overview
   - Transaction history

3. **DAO Governance**
   - Proposal creation and voting
   - Governance dashboard
   - Vote delegation

4. **Wallet Integration**
   - Multiple wallet support
   - Transaction signing
   - Balance checking

### Commands

```
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Testing
npm run test

# Linting
npm run lint
```

## Testing

```
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## Deployment

The application can be deployed to Vercel with the following steps:
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy
