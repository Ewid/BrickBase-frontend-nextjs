'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Home, Building2, Wallet, ChartBar, User, LayoutDashboard, Landmark, Hexagon } from 'lucide-react';
import { Button as ShadcnButton } from "@/components/ui/button";
import ConnectWallet from './ConnectWallet';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Check if a link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={`fixed top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
      scrolled 
        ? 'bg-gradient-to-r from-gray-900/90 via-blue-950/80 to-gray-900/90 shadow-lg py-3' 
        : 'bg-gradient-to-r from-gray-900/70 via-blue-950/60 to-gray-900/70 py-4'
    }`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 relative z-10">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/40 to-purple-600/40 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gray-900/80 rounded-lg p-1.5">
              <Image 
                src="/images/brickbaselogo.png"
                alt="BrickBase Logo" 
                width={32}
                height={32}
                className="rounded-md"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gradient">BrickBase</span>
            <span className="text-[10px] text-blue-400/80 -mt-1 font-mono tracking-wider">WEB3 REAL ESTATE</span>
          </div>
        </Link>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-1">
          {[
            { path: '/', label: 'Home', icon: Home },
            { path: '/properties', label: 'Properties', icon: Building2 },
            { path: '/marketplace', label: 'Marketplace', icon: ChartBar },
            { path: '/dao', label: 'Governance', icon: Landmark },
            { path: '/portfolio', label: 'Portfolio', icon: LayoutDashboard },
            { path: '/about', label: 'About', icon: User }
          ].map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`relative px-3 py-2 rounded-lg transition-all duration-300 group ${
                isActive(item.path) 
                  ? 'text-blue-400 bg-blue-500/10' 
                  : 'text-gray-300 hover:text-blue-400 hover:bg-blue-500/5'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <item.icon className={`h-4 w-4 ${isActive(item.path) ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></span>
              )}
            </Link>
          ))}
        </div>

        {/* Connect wallet button */}
        <div className="hidden md:block">
          <ConnectWallet />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <ShadcnButton 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
            {isOpen ? <X className="h-6 w-6 text-blue-400" /> : <Menu className="h-6 w-6 text-blue-400" />}
          </ShadcnButton>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gradient-to-b from-gray-900/95 to-blue-950/95 backdrop-blur-xl mt-2 py-4 px-4 rounded-xl border border-blue-500/20 mx-4 shadow-lg">
          <div className="flex flex-col space-y-1">
            {[
              { path: '/', label: 'Home', icon: Home },
              { path: '/properties', label: 'Properties', icon: Building2 },
              { path: '/marketplace', label: 'Marketplace', icon: ChartBar },
              { path: '/dao', label: 'Governance', icon: Landmark },
              { path: '/portfolio', label: 'Portfolio', icon: LayoutDashboard },
              { path: '/about', label: 'About', icon: User }
            ].map((item) => (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  isActive(item.path) 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'text-gray-300 hover:bg-blue-500/10 hover:text-blue-300'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive(item.path) ? 'bg-blue-500/30' : 'bg-gray-800/80'
                }`}>
                  <item.icon className={`h-4 w-4 ${isActive(item.path) ? 'text-blue-300' : 'text-gray-400'}`} />
                </div>
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <Hexagon className="h-2 w-2 ml-auto text-blue-400" fill="currentColor" />
                )}
              </Link>
            ))}
            
            {/* Connect wallet button in mobile menu */}
            <div className="pt-3 border-t border-blue-500/20 mt-2">
              <ConnectWallet />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
