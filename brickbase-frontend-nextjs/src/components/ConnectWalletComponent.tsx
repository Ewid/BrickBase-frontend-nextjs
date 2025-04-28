'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAccount, useConnect } from 'wagmi';
import { Loader2 } from 'lucide-react';

const ConnectWalletComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect(); // Changed from isLoading to isPending

  useEffect(() => {
    setMounted(true);
    console.log("[ConnectWallet] Mounted:", mounted, "isConnected:", isConnected, "isConnecting:", isConnecting);
  }, [mounted, isConnected, isConnecting]);

  if (!mounted) return null;

  if (isConnected && address) {
    return (
      <Button variant="outline" className="border-crypto-light/30 text-crypto-light">
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect({ connector: connectors[0] });
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(true);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="border-crypto-light/30 text-crypto-light"
      onClick={handleConnect} 
      disabled={isPending || isConnecting}
    >
      {isPending || isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  );
};

export default ConnectWalletComponent;