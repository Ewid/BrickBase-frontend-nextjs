'use client';

import dynamic from 'next/dynamic';
import { Loader2, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Dynamically import the actual component, disabling SSR
const ConnectWalletComponent = dynamic(
  () => import('./ConnectWalletComponent'), 
  {
    ssr: false,
    loading: () => (
        <Button 
            variant="default" 
            size="default"
            disabled 
            className="relative overflow-hidden bg-gradient-to-r from-blue-600/70 to-purple-600/70 text-white border-none opacity-80 cursor-wait"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 animate-pulse"></div>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="relative z-10">Initializing...</span>
        </Button>
    )
  }
);

// Re-export the dynamically loaded component
export default ConnectWalletComponent;
