'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Building2, Wallet, ChartBar, User } from 'lucide-react';
import { Button as ShadcnButton } from "@/components/ui/button";
import ConnectWallet from './ConnectWallet';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full glass-card py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="w-8 h-8 text-crypto-light" />
          <span className="text-xl font-bold text-gradient">BrickBase</span>
        </Link>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-white hover:text-crypto-light transition-colors">Home</Link>
          <Link href="/properties" className="text-white hover:text-crypto-light transition-colors">Properties</Link>
          <Link href="/marketplace" className="text-white hover:text-crypto-light transition-colors">Marketplace</Link>
          <Link href="/dao" className="text-white hover:text-crypto-light transition-colors">Governance</Link>
          <Link href="/portfolio" className="text-white hover:text-crypto-light transition-colors">My Portfolio</Link>
          <Link href="/about" className="text-white hover:text-crypto-light transition-colors">About</Link>
        </div>

        {/* Connect wallet button */}
        <div className="hidden md:block">
          <ConnectWallet />
        </div>

        {/* Mobile menu button (using Shadcn Button) */}
        <div className="md:hidden">
          <ShadcnButton 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </ShadcnButton>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass-card mt-2 py-4 px-4 rounded-lg">
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-white hover:text-crypto-light transition-colors p-2" onClick={() => setIsOpen(false)}>
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link href="/properties" className="flex items-center space-x-2 text-white hover:text-crypto-light transition-colors p-2" onClick={() => setIsOpen(false)}>
              <Building2 className="h-5 w-5" />
              <span>Properties</span>
            </Link>
            <Link href="/marketplace" className="flex items-center space-x-2 text-white hover:text-crypto-light transition-colors p-2" onClick={() => setIsOpen(false)}>
              <ChartBar className="h-5 w-5" />
              <span>Marketplace</span>
            </Link>
            <Link href="/dao" className="flex items-center space-x-2 text-white hover:text-crypto-light transition-colors p-2" onClick={() => setIsOpen(false)}>
              <Wallet className="h-5 w-5" />
              <span>Governance</span>
            </Link>
            <Link href="/about" className="flex items-center space-x-2 text-white hover:text-crypto-light transition-colors p-2" onClick={() => setIsOpen(false)}>
              <User className="h-5 w-5" />
              <span>About</span>
            </Link>
            {/* Connect wallet button in mobile menu */}
            <div className="pt-2">
              <ConnectWallet />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 