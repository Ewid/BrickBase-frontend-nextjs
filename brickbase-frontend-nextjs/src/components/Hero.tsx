'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the ThreeJSScene component with no SSR
const ThreeJSScene = dynamic(() => import('./ThreeJSScene'), { ssr: false });

const Hero = () => {
  return (
    <section className="min-h-screen pt-20 flex flex-col md:flex-row items-center justify-between px-6 max-w-7xl mx-auto">
      <div className="md:w-1/2 space-y-6 md:pr-10 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-bold">
          The Future of <span className="text-gradient">Real Estate</span> is Here
        </h1>
        <p className="text-lg text-gray-300">
          Own, trade and invest in premium digital properties backed by blockchain technology.
          Join the next revolution in real estate with BrickBase.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <Link href="/properties">
            <Button className="crypto-btn animate-pulse-glow">
              Explore Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" className="border border-crypto-light text-crypto-light hover:bg-crypto-light/10">
              <Building2 className="mr-2 h-4 w-4" />
              Learn More
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-8 pt-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-crypto-light">1200+</p>
            <p className="text-sm text-gray-400">Properties</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-crypto-teal">$240M</p>
            <p className="text-sm text-gray-400">Trading Volume</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-crypto-accent">8.5k</p>
            <p className="text-sm text-gray-400">Owners</p>
          </div>
        </div>
      </div>
      <div className="md:w-1/2 h-[400px] md:h-[600px] mt-10 md:mt-0 animate-float">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-radial from-crypto-purple/30 to-transparent z-0 rounded-full blur-xl" />
          <div className="relative z-10 w-full h-full">
            <ThreeJSScene />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;