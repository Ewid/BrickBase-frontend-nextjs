import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Info } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-crypto-dark flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center text-center pt-24 pb-10 px-6">
        <div className="glass-card p-10 max-w-2xl">
          <Info className="w-16 h-16 mx-auto text-crypto-purple mb-8 opacity-70" />
          <h1 className="text-3xl font-bold mb-4">About <span className="text-gradient">BrickBase</span></h1>
          <p className="text-gray-300 mb-6 text-lg">
            BrickBase is revolutionizing real estate investment and ownership through the power of blockchain technology.
            We aim to make property ownership more accessible, transparent, and liquid for everyone.
          </p>
          <p className="text-gray-400">
            Join us in building the future of real estate, one block at a time.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage; 