'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Dynamically import the actual component, disabling SSR
const ConnectWalletComponent = dynamic(
  () => import('./ConnectWalletComponent'), 
  {
    ssr: false,
    loading: () => (
        <Button 
            variant="outline" 
            size="default"
            disabled 
            className="border-crypto-light/30 text-crypto-light cursor-wait opacity-70"
        >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
        </Button>
    )
  }
);

// Re-export the dynamically loaded component
export default ConnectWalletComponent;