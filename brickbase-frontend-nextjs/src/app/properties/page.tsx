import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { Filter, ArrowDownAZ } from 'lucide-react';

// Mock data for demonstration
const mockProperties = [
  {
    id: 1,
    title: "Neon Heights Tower",
    location: "Neo District, Metaverse",
    price: "$3,450,000",
    cryptoPrice: "125.5 ETH",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    sqft: 2800,
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
    featured: false
  },
  // Add more mock properties if needed
];

const PropertiesPage = () => {
  return (
    <div className="min-h-screen bg-crypto-dark">
      <Navbar />
      <main className="pt-24 pb-10 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">Explore <span className="text-gradient">Properties</span></h1>
            <p className="text-gray-400">Find your next digital real estate investment</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="border-crypto-light/30 text-crypto-light">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="border-crypto-light/30 text-crypto-light">
              <ArrowDownAZ className="mr-2 h-4 w-4" />
              Sort By
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProperties.map(property => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
        
        {/* Add pagination controls here if needed */}
        
      </main>
      <Footer />
    </div>
  );
};

export default PropertiesPage; 