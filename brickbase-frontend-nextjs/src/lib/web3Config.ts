'use client'; // Mark as client component if using hooks directly here, though likely imported elsewhere

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { baseSepolia } from 'viem/chains'; // Import directly from viem/chains

// 1. Get project ID from WalletConnect Cloud
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

// 2. Create wagmiConfig
const metadata = {
  name: 'BrickBase',
  description: 'Fractional Real Estate on the Blockchain',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001', // Use env var for URL
  icons: ['/favicon.ico'] // Replace with path to your logo/icon
}

// Define chains as a const tuple for type inference
const chains = [baseSepolia] as const;
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: 'dark', // Match the site theme
  themeVariables: { // Optional: Custom theme tweaks
    '--w3m-font-family': 'inherit', // Use site font
    '--w3m-accent': '#9b87f5', // Corrected variable name
    '--w3m-border-radius-master': 'var(--radius)',
  }
}) 