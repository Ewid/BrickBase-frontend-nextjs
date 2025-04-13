'use client';

import React from 'react';
import { WagmiConfig, createConfig, http } from 'wagmi';
import { wagmiConfig } from '@/lib/web3Config';

interface Web3WrapperProps {
  children: React.ReactNode;
}

export default function Web3Wrapper({ children }: Web3WrapperProps) {
  try {
    if (!wagmiConfig) {
      console.warn("Web3 functionality is disabled due to missing configuration");
      return <>{children}</>;
    }
    
    return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
  } catch (error) {
    console.error("Error initializing Web3:", error);
    return <>{children}</>;
  }
} 