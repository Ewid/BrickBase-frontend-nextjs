import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-crypto-dark/80 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Image 
                src="/images/brickbaselogo.png"
                alt="BrickBase Logo" 
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="text-xl font-bold text-gradient">BrickBase</span>
            </Link>
            <p className="text-gray-400 mb-6">
              The future of real estate investment and ownership powered by blockchain technology.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-crypto-light transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-crypto-light transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-crypto-light transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-crypto-light transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/properties" className="text-gray-400 hover:text-white transition-colors">Properties</Link></li>
              <li><Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">My Portfolio</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/whitepaper" className="text-gray-400 hover:text-white transition-colors">Whitepaper</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/tokenomics" className="text-gray-400 hover:text-white transition-colors">Tokenomics</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-6">Newsletter</h4>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="space-y-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-crypto-light"
              />
              <button 
                type="submit" 
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-crypto-purple to-crypto-teal text-white font-medium hover:shadow-neon transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} BrickBase. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 