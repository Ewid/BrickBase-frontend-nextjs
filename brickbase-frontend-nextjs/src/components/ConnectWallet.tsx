'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Wallet, ShieldCheck, Zap, Lock, LogOut, Loader2 } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';

interface ConnectWalletProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const ConnectWallet = ({ 
  variant = 'outline', 
  size = 'default',
  className = '' 
}: ConnectWalletProps) => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet, error } = useAccount();
  
  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm bg-crypto-dark/50 px-3 py-1.5 rounded-md border border-crypto-light/30">
          <span className="text-crypto-light">{account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={disconnectWallet}
          className="text-gray-400 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={connectWallet}
      disabled={isConnecting}
      className={`${className} border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10`}
    >
      {isConnecting ? (
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

export default ConnectWallet; 