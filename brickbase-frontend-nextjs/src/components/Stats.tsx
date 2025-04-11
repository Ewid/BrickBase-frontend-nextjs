import React from 'react';

// Placeholder for Stats component
const Stats = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Platform <span className="text-gradient">Statistics</span></h2>
        {/* Placeholder content - replace with actual stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-lg">
            <p className="text-4xl font-bold text-crypto-light mb-2">1,200+</p>
            <p className="text-gray-400">Total Properties</p>
          </div>
          <div className="glass-card p-6 rounded-lg">
            <p className="text-4xl font-bold text-crypto-teal mb-2">$240M+</p>
            <p className="text-gray-400">Trading Volume</p>
          </div>
          <div className="glass-card p-6 rounded-lg">
            <p className="text-4xl font-bold text-crypto-accent mb-2">8,500+</p>
            <p className="text-gray-400">Active Owners</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats; 