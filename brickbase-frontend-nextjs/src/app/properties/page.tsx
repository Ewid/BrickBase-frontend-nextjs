'use client'; // Needs to be client for hooks

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { Filter, ArrowDownAZ, Loader2, AlertTriangle } from 'lucide-react';
import { PropertyDto } from '@/types/dtos'; // Import DTO type

// Mock data for when the API fails
const MOCK_PROPERTIES: PropertyDto[] = [
  {
    id: '0xda988e1D11748E6589ac8a256A6cb61A3dd4F9D2',
    tokenId: 1,
    metadata: {
      name: 'BrickBase Property #0 - 1 Property Lane',
      description: 'A lovely residential property managed by BrickBase.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070',
      attributes: [
        { trait_type: 'Address', value: '1 Property Lane' },
        { trait_type: 'Square Footage', value: 1000 }
      ]
    },
    totalSupply: '10000000000000000000000'
  },
  {
    id: '0xC072f717869bb13c04d4C76E933a66b4c0d47FE0',
    tokenId: 2,
    metadata: {
      name: 'BrickBase Property #1 - 2 Property Lane',
      description: 'A lovely residential property managed by BrickBase.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053',
      attributes: [
        { trait_type: 'Address', value: '2 Property Lane' },
        { trait_type: 'Square Footage', value: 1200 }
      ]
    },
    totalSupply: '10000000000000000000000'
  },
  {
    id: '0x1330a7aE207a0A8585e6c6ef543b4Ef59568c4b9', // Different ID
    tokenId: 3,
    metadata: {
      name: 'BrickBase Property #2 - 3 Property Lane',
      description: 'A modern luxury property with ocean views.',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070',
      attributes: [
        { trait_type: 'Address', value: '3 Property Lane' },
        { trait_type: 'Square Footage', value: 1800 }
      ]
    },
    totalSupply: '10000000000000000000000'
  }
];

const PropertiesPage = () => {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/properties`, {
          signal: AbortSignal.timeout(8000) // Timeout after 8 seconds
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: PropertyDto[] = await response.json();
        console.log("API returned properties:", data);
        
        if (data.length === 0) {
          // If no properties returned, use mock data
          setUseMockData(true);
          setProperties(MOCK_PROPERTIES);
        } else {
          // De-duplicate properties by ID and tokenId to avoid React key conflicts
          const uniquePropertiesMap = new Map<string, PropertyDto>();
          data.forEach(property => {
            if (property.id) {
              // Create a composite key using both id and tokenId
              const uniqueKey = `${property.id}-${property.tokenId || 0}`;
              uniquePropertiesMap.set(uniqueKey, property);
            }
          });
          
          const uniqueProperties = Array.from(uniquePropertiesMap.values());
          console.log(`De-duplicated ${data.length} properties to ${uniqueProperties.length} unique properties`);
          
          setProperties(uniqueProperties);
        }
      } catch (err: any) {
        console.error("Failed to fetch properties:", err);
        setError(err.message || 'Failed to load properties.');
        // Fall back to mock data
        setUseMockData(true);
        setProperties(MOCK_PROPERTIES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []); // Empty dependency array means this runs once on mount

  // Basic filtering/sorting state (can be expanded)
  const [filter, setFilter] = useState({});
  const [sortBy, setSortBy] = useState('default');

  // Helper function to extract attribute values
  const getAttributeValue = (attributes: any[] | undefined, traitType: string, defaultValue: any) => {
    if (!attributes) return defaultValue;
    const attr = attributes.find(attr => attr.trait_type === traitType);
    return attr ? attr.value : defaultValue;
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-crypto-light" />
          <p className="ml-4 text-lg text-gray-400">Loading Properties...</p>
        </div>
      );
    }

    if (error && !useMockData) {
      return (
        <div className="text-center py-20 text-red-500">
          <p>Error loading properties: {error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-crypto-light/30 text-crypto-light"
            onClick={() => setUseMockData(true)}>
            View Demo Data
          </Button>
        </div>
      );
    }

    if (properties.length === 0) {
      return (
        <div className="text-center py-20 text-gray-400">
          <p>No properties found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {useMockData && (
          <div className="col-span-full mb-4 py-2 px-4 bg-yellow-500/20 text-yellow-300 rounded-md text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <p>Using demo data. Connect your backend API to see real properties.</p>
          </div>
        )}
        
        {properties.map((property, index) => {
          // Extract details from property metadata
          const metadata = property.metadata;
          const sqft = getAttributeValue(metadata?.attributes, 'Square Footage', 0);
          const address = getAttributeValue(metadata?.attributes, 'Address', 'No address available');
          
          // Create a unique key combining the property id, token id and index
          const uniqueKey = `${property.id}-${property.tokenId || 0}-${index}`;
          
          return (
            <PropertyCard
              key={uniqueKey}
              id={property.tokenId || 0}
              nftAddress={property.id} // Use property.id (address) for the link
              title={metadata?.name || 'Unnamed Property'}
              location={address}
              imageUrl={metadata?.image || ''}
              sqft={sqft}
              featured={false}
            />
          );
        })}
      </div>
    );
  }

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

        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default PropertiesPage; 