import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Info, Globe, Zap, Lock, Users, Building, Coins } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-crypto-dark flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-16 px-6">
        {/* Hero Section with Animated Elements */}
        <div className="relative w-full max-w-5xl mx-auto mb-16">
          {/* Decorative background elements */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="glass-card-vibrant p-10 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] rounded-2xl relative overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-sm opacity-30 -z-10"></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 rounded-full mb-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Info className="w-16 h-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">BrickBase</span>
              </h1>
              
              <p className="text-gray-200 mb-8 text-lg max-w-3xl leading-relaxed">
                BrickBase is revolutionizing real estate investment and ownership through the power of blockchain technology.
                We aim to make property ownership more accessible, instant, transparent, and liquid for everyone.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <span className="bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">Blockchain Powered</span>
                <span className="bg-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-sm font-medium border border-purple-500/30 shadow-[0_0_10px_rgba(124,58,237,0.2)]">Fractional Ownership</span>
                <span className="bg-cyan-500/20 text-cyan-300 px-4 py-1.5 rounded-full text-sm font-medium border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">Global Access</span>
                <span className="bg-green-500/20 text-green-300 px-4 py-1.5 rounded-full text-sm font-medium border border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]">Instant Liquidity</span>
              </div>
              
              <p className="text-gray-300 text-lg font-medium">
                Join us in building the future of real estate, one block at a time.
              </p>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="w-full max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Web3 Real Estate Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card-vibrant p-6 border border-blue-500/20 rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
              <div className="bg-blue-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Globe className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Global Access</h3>
              <p className="text-gray-300">Invest in properties worldwide without geographical limitations or complex international regulations.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-card-vibrant p-6 border border-purple-500/20 rounded-xl hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all duration-300">
              <div className="bg-purple-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Instant Transactions</h3>
              <p className="text-gray-300">Buy and sell property tokens in seconds, not months, with blockchain-powered smart contracts.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-card-vibrant p-6 border border-cyan-500/20 rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300">
              <div className="bg-cyan-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Lock className="h-7 w-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Secure Ownership</h3>
              <p className="text-gray-300">Property ownership recorded on the blockchain provides immutable proof and transparent history.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="glass-card-vibrant p-6 border border-green-500/20 rounded-xl hover:shadow-[0_0_20px_rgba(74,222,128,0.2)] transition-all duration-300">
              <div className="bg-green-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Fractional Ownership</h3>
              <p className="text-gray-300">Own exactly what you can afford, from a fraction of a property to multiple entire buildings.</p>
            </div>
            
            {/* Feature 5 */}
            <div className="glass-card-vibrant p-6 border border-yellow-500/20 rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-300">
              <div className="bg-yellow-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Building className="h-7 w-7 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Property DAO</h3>
              <p className="text-gray-300">Participate in decentralized governance to make collective decisions about property management.</p>
            </div>
            
            {/* Feature 6 */}
            <div className="glass-card-vibrant p-6 border border-red-500/20 rounded-xl hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300">
              <div className="bg-red-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Coins className="h-7 w-7 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Automated Rent</h3>
              <p className="text-gray-300">Receive your share of rental income automatically through smart contracts, without intermediaries.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
