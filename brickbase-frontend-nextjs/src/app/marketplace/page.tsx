import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart } from 'lucide-react';

const MarketplacePage = () => {
  return (
    <div className="min-h-screen bg-crypto-dark flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center text-center pt-24 pb-10 px-6">
        <div className="glass-card p-10 max-w-lg">
          <ShoppingCart className="w-20 h-20 mx-auto text-crypto-teal mb-8 opacity-70" />
          <h1 className="text-3xl font-bold mb-4">NFT <span className="text-gradient">Marketplace</span></h1>
          <p className="text-gray-300 mb-6">
            The secondary market for trading property NFTs is coming soon!
            Buy and sell fractions or entire properties directly with other users.
          </p>
          <p className="text-sm text-gray-400">Stay tuned for updates.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketplacePage; 