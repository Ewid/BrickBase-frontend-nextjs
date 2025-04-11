'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Building2, Wallet, ChartBar, User } from 'lucide-react';

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
          <Link href="/about" className="text-white hover:text-crypto-light transition-colors">About</Link>
        </div>

        {/* Connect wallet button */}
        <div className="hidden md:block">
          <Button className="crypto-btn">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass-card mt-2 py-4 px-4 rounded-lg">
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-white hover:text-crypto-light transition-colors p-2">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link href="/properties" className="flex items-center space-x-2 text-white hover:text-crypto-light transition-colors p-2">
              <Building2 className="h-5 w-5" />
              <span>Properties</span>
            </Link>
            <Link href="/marketplace" className="flex items-center space-x-2 text-white hover:text-crypto-light transition-colors p-2">
              <ChartBar className="h-5 w-5" />
              <span>Marketplace</span>
            </Link>
            <Link href="/about" className="flex items-center space-x-2 text-white hover:text-crypto-light transition-colors p-2">
              <User className="h-5 w-5" />
              <span>About</span>
            </Link>
            <Button className="crypto-btn w-full">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 