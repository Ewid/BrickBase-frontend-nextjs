'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Loader2, Wallet, LogOut } from 'lucide-react';

const ConnectWalletComponent = () => {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm bg-crypto-dark/50 px-3 py-1.5 rounded-md border border-crypto-light/30">
          <span className="text-crypto-light">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => disconnect()}
          className="text-gray-400 hover:text-white"
          title="Disconnect Wallet"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      className="border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10"
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" /> 
          Connect Wallet
        </>
      )}
    </Button>
  );
};

export default ConnectWalletComponent;