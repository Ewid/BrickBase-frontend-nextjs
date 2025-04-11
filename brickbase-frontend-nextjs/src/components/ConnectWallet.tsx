import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Wallet, ShieldCheck, Zap, Lock } from 'lucide-react';

const ConnectWallet = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto glass-card rounded-2xl p-10">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="md:w-3/5 md:pr-10">
            <h2 className="text-3xl font-bold mb-4">
              Connect Your <span className="text-gradient">Web3 Wallet</span>
            </h2>
            <p className="text-gray-300 mb-6">
              Link your cryptocurrency wallet to start buying, selling, and trading
              premium digital real estate on the blockchain. All transactions are
              secure, transparent, and recorded on-chain.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="bg-crypto-purple/20 p-2 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-crypto-light" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Secure Transactions</h3>
                  <p className="text-sm text-gray-400">All transactions are encrypted and secured by blockchain technology</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-crypto-purple/20 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-crypto-light" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Instant Processing</h3>
                  <p className="text-sm text-gray-400">Transactions are processed immediately with minimal fees</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-crypto-purple/20 p-2 rounded-lg">
                  <Lock className="h-6 w-6 text-crypto-light" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Private Keys</h3>
                  <p className="text-sm text-gray-400">You maintain full control of your assets and private keys</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button className="crypto-btn animate-pulse-glow">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
              <Link href="/learn">
                <Button variant="outline" className="border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="md:w-2/5 mt-10 md:mt-0 flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-radial from-crypto-purple/30 to-transparent rounded-full blur-2xl" />
              <div className="relative z-10 w-full max-w-[350px] h-[250px] rounded-xl shadow-neon">
                <Image 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1332&q=80" 
                  alt="Digital Wallet" 
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 350px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectWallet; 