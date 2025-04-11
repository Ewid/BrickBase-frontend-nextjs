'use client'; // Add this directive for client-side hooks

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedProperties from '@/components/FeaturedProperties';
import Stats from '@/components/Stats';
import ConnectWallet from '@/components/ConnectWallet';
import Footer from '@/components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-crypto-dark">
      <Navbar />
      <Hero />
      <FeaturedProperties />
      <Stats />
      <ConnectWallet />
      <Footer />
    </div>
  );
};

export default Home;
