'use client'; // Needs to be client for hooks

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { Filter, ArrowDownAZ, Loader2 } from 'lucide-react';
import { PropertyDto } from '@/types/dtos'; // Import DTO type
import { formatUnits } from 'ethers'; // For potential formatting later

const PropertiesPage = () => {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/properties`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PropertyDto[] = await response.json();
        setProperties(data);
      } catch (err: any) {
        console.error("Failed to fetch properties:", err);
        setError(err.message || 'Failed to load properties.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []); // Empty dependency array means this runs once on mount

  // Basic filtering/sorting state (can be expanded)
  const [filter, setFilter] = useState({});
  const [sortBy, setSortBy] = useState('default');

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

    if (error) {
      return (
        <div className="text-center py-20 text-red-500">
          <p>Error loading properties: {error}</p>
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

    // TODO: Implement actual filtering and sorting based on state
    const displayedProperties = properties;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProperties.map(property => (
          // Map PropertyDto to PropertyCardProps
          <PropertyCard
            key={property.tokenId} // Use tokenId as key
            id={property.tokenId} // Pass tokenId
            nftAddress={property.nftAddress} // Pass nftAddress for the link
            title={property.metadata?.name || 'Unnamed Property'} // Use metadata name if available
            location={property.metadata?.attributes?.find((attr: any) => attr.trait_type === 'Address')?.value || 'N/A'} // Get address from attributes
            // Price props removed as they are not directly in PropertyDto
            imageUrl={property.metadata?.image || ''} // Use metadata image
            sqft={property.metadata?.attributes?.find((attr: any) => attr.trait_type === 'Square Footage')?.value || 0} // Get sqft from attributes
            // featured status might need to come from backend or be determined differently
            featured={false}
          />
        ))}
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
            {/* TODO: Implement filter/sort functionality */}
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
        
        {/* Add pagination controls here if needed */}
        
      </main>
      <Footer />
    </div>
  );
};

export default PropertiesPage; 