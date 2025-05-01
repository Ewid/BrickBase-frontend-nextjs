'use client'; 


import { createAppKit } from '@reown/appkit/react' 
import { baseSepolia} from '@reown/appkit/networks' 
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'


let wagmiConfig: any = null;

try {
  
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

  if (!projectId) {
    console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
    throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
  }

  
  const metadata = {
    name: 'BrickBase',
    description: 'Fractional Real Estate on the Blockchain',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    icons: ['/favicon.ico'] 
  }
  
  const networks = [baseSepolia]; 

  
  const wagmiAdapter = new WagmiAdapter({
    networks: networks, 
    projectId
  })

  
  createAppKit({ 
    adapters: [wagmiAdapter], 
    networks:[baseSepolia],
    metadata: metadata,
    projectId,
    themeMode: 'dark', 
    features: { 
      analytics: false, 
    }
  })

  
  wagmiConfig = wagmiAdapter.wagmiConfig; 
} catch (error) {
  console.error('Failed to initialize web3 configuration:', error);
  
}

export { wagmiConfig }; 