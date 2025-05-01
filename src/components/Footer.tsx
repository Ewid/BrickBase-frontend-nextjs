import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Twitter, Facebook, Instagram, Linkedin, 
  Globe, Zap, Shield, Wallet, Clock, Hexagon, ExternalLink, 
  DollarSign, BarChart3
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-blue-950/90 pt-20 pb-10 px-6">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="hex-pattern absolute inset-0 opacity-5"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Web3 Benefits Banner */}
        <div className="mb-16 p-6 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Web3 Real Estate Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="font-medium text-white mb-1">Instant Transactions</h4>
              <p className="text-sm text-gray-400">No lengthy closing processes or paperwork</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
              <h4 className="font-medium text-white mb-1">Global Access</h4>
              <p className="text-sm text-gray-400">Invest from anywhere in the world</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <h4 className="font-medium text-white mb-1">USDC Payments</h4>
              <p className="text-sm text-gray-400">Stable, secure cryptocurrency transactions</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-yellow-400" />
              </div>
              <h4 className="font-medium text-white mb-1">Blockchain Verified</h4>
              <p className="text-sm text-gray-400">Immutable ownership records on the blockchain</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6 group">
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
            <p className="text-gray-400 mb-6">
              The future of real estate investment and ownership powered by blockchain technology. Fractional ownership, instant transactions, and global access.
            </p>
            <div className="flex space-x-3">
              {[Twitter, Facebook, Instagram, Linkedin].map((Icon, index) => (
                <Link 
                  key={index} 
                  href="#" 
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-900/50 transition-colors group"
                >
                  <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home', icon: Building2 },
                { href: '/properties', label: 'Properties', icon: Building2 },
                { href: '/marketplace', label: 'Marketplace', icon: BarChart3 },
                { href: '/portfolio', label: 'My Portfolio', icon: Wallet },
                { href: '/about', label: 'About', icon: Shield },
                { href: '/contact', label: 'Contact', icon: Globe }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <link.icon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/blog', label: 'Blog', icon: ExternalLink },
                { href: '/whitepaper', label: 'Whitepaper', icon: ExternalLink },
                { href: '/faq', label: 'FAQs', icon: ExternalLink },
                { href: '/tokenomics', label: 'Tokenomics', icon: Hexagon },
                { href: '/support', label: 'Support', icon: Shield }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <link.icon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Newsletter
            </h4>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full px-4 py-2 pl-10 rounded-lg bg-gray-800/50 border border-blue-500/30 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-2 px-4 rounded-lg"
              >
                {/* Animated glow effect */}
                <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <span className="relative z-10">Subscribe</span>
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="relative">
            <div className="absolute -inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <p className="text-gray-400 text-sm flex items-center">
              <Hexagon className="h-3 w-3 mr-2 text-blue-500/70" fill="currentColor" strokeWidth={0} />
              <span>&copy; {new Date().getFullYear()} BrickBase. All rights reserved.</span>
            </p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
              { href: '/cookies', label: 'Cookie Policy' }
            ].map((link, index) => (
              <Link 
                key={index}
                href={link.href} 
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Mail icon component
const Mail = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default Footer;
