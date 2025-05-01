'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Loader2, Wallet, LogOut, Shield, ExternalLink, CheckCircle2 } from 'lucide-react';

const ConnectWalletComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add pulse effect when connected
  useEffect(() => {
    if (isConnected) {
      setPulseEffect(true);
      const timer = setTimeout(() => setPulseEffect(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!mounted) return null;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className={`relative group`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-sm opacity-75 ${pulseEffect ? 'animate-pulse' : ''} group-hover:opacity-100 transition-opacity duration-300`}></div>
          <div className="relative flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-500/30">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              <span className="font-mono text-sm text-blue-300">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </div>
            <a 
              href={`https://basescan.org/address/${address}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="View on BaseScan"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => disconnect()}
          className="relative overflow-hidden group p-1.5 h-8 w-8 rounded-full"
          title="Disconnect Wallet"
        >
          <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-400 transition-colors" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="default" 
      className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none"
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
    >
      {/* Animated glow effect */}
      <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
      
      {isPending ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50 animate-pulse"></div>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="relative z-10">Connecting...</span>
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4 text-blue-200" /> 
          <span className="relative z-10">Connect Wallet</span>
        </>
      )}
    </Button>
  );
};

export default ConnectWalletComponent;
