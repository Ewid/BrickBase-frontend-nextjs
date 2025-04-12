'use client'; // Mark as client component if using hooks directly here, though likely imported elsewhere

// --- Imports based on Reown Docs --- 
import { createAppKit } from '@reown/appkit/react' 
import { baseSepolia, mainnet } from '@reown/appkit/networks' // Import chain from appkit/networks
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Keep WagmiConfig for the provider, but config creation is handled by adapter
import { WagmiConfig } from 'wagmi' 

// 1. Get project ID from WalletConnect Cloud
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

// 2. Define metadata and networks
const metadata = {
  name: 'BrickBase',
  description: 'Fractional Real Estate on the Blockchain',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001', // Use env var for URL
  icons: ['/favicon.ico'] // Replace with path to your logo/icon
}
// Define networks for the adapter
const networks = [baseSepolia]; 

// 3. Create the Wagmi adapter (This likely creates the wagmiConfig internally)
const wagmiAdapter = new WagmiAdapter({
  networks: networks, 
  projectId
})

// 4. Create Reown AppKit
createAppKit({ 
  adapters: [wagmiAdapter], // Pass adapter instance
  networks:[baseSepolia],
  metadata: metadata,
  projectId,
  themeMode: 'dark', // Match the site theme
  features: { // Optional: enable analytics
    analytics: true, 
  }
})

// 5. Export the wagmiConfig *from the adapter* for the WagmiProvider
export const wagmiConfig = wagmiAdapter.wagmiConfig; 