'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Building2, MapPin, Maximize2, Bitcoin, Tag, Wallet, ArrowLeft } from "lucide-react";
import Link from 'next/link';

// Mock data - replace with actual data fetching
const mockProperties = [
  {
    id: 1,
    title: "Neon Heights Tower",
    location: "Neo District, Metaverse",
    price: "$3,450,000",
    cryptoPrice: "125.5 ETH",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    sqft: 2800,
    description: "Experience luxury living in the heart of the Neo District. This stunning tower offers panoramic views and state-of-the-art amenities.",
    bedrooms: 3,
    bathrooms: 4,
    yearBuilt: 2077,
    featured: true
  },
  {
    id: 2,
    title: "Quantum View Residence",
    location: "Cyber Park, Decentraland",
    price: "$1,750,000",
    cryptoPrice: "63.2 ETH",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    sqft: 1950,
    description: "A modern residence overlooking the vibrant Cyber Park. Features open-plan living and direct access to virtual green spaces.",
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2088,
    featured: false
  },
  {
    id: 3,
    title: "Digital Horizon Complex",
    location: "Blockchain Boulevard, Sandbox",
    price: "$5,200,000",
    cryptoPrice: "189.4 ETH",
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1453&q=80",
    sqft: 4200,
    description: "An expansive complex on the prestigious Blockchain Boulevard. Ideal for large gatherings or commercial ventures in the Sandbox metaverse.",
    bedrooms: 5,
    bathrooms: 6,
    yearBuilt: 2095,
    featured: true
  },
  {
    id: 4,
    title: "Ethereal Sky Penthouse",
    location: "Token Heights, Ethereum City",
    price: "$2,950,000",
    cryptoPrice: "106.8 ETH",
    imageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    sqft: 2300,
    description: "Top-floor living with breathtaking views of Ethereum City. This penthouse boasts high-end finishes and exclusive rooftop access.",
    bedrooms: 2,
    bathrooms: 3,
    yearBuilt: 2080,
    featured: false
  }
];

const PropertyDetailPage = () => {
  const params = useParams();
  const propertyId = params?.id;

  // Find the property based on ID - replace with actual data fetching logic
  const property = mockProperties.find(p => p.id.toString() === propertyId);

  if (!property) {
    // Optional: Render a specific component or redirect if property not found
    // For now, we rely on the main not-found handler
    return (
      <div className="min-h-screen bg-crypto-dark flex flex-col items-center justify-center text-center p-6">
         <Navbar />
         <div className="flex-grow flex items-center justify-center">
            <p className="text-xl text-gray-400">Property not found.</p>
         </div>
         <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Navbar />
      <main className="pt-24 pb-10 px-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/properties" className="inline-flex items-center text-crypto-light hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </div>
        
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="relative h-96 w-full">
            <Image 
              src={property.imageUrl} 
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority // Prioritize loading the main image
            />
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
              <h1 className="text-3xl font-bold mb-2 md:mb-0">{property.title}</h1>
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 border-b border-white/10 pb-6">
               <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Building2 className="h-4 w-4 text-crypto-light" />
                  <span>{property.sqft} sqft</span>
                </div>
                <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>{property.bedrooms} Beds</span>
                </div>
                 <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>{property.bathrooms} Baths</span>
                </div>
                 <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>Built: {property.yearBuilt}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed">{property.description}</p>
              </div>
              
              <div className="md:col-span-1 space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Current Price</p>
                  <p className="text-crypto-light font-bold text-3xl mb-1">{property.price}</p>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Bitcoin className="h-4 w-4 mr-1 text-yellow-500" />
                    {property.cryptoPrice}
                  </div>
                </div>
                <Button className="w-full crypto-btn animate-pulse-glow">
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet to Buy
                </Button>
                 <Button variant="outline" className="w-full border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10">
                  Make an Offer
                </Button>
              </div>
            </div>
            
            {/* Add sections for NFT details, transaction history, etc. later */}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetailPage; 