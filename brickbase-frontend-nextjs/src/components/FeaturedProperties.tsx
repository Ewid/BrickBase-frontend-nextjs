'use client'; // Needs client hooks

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Filter, ArrowDownAZ, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard from './PropertyCard';
import { PropertyDto } from '@/types/dtos';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Ideally, backend should have a dedicated /properties/featured endpoint
        // For now, fetch all and take the first few (or filter if DTO includes a featured flag)
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/properties`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allProperties: PropertyDto[] = await response.json();
        
        // Placeholder logic: Take first 4 properties as "featured"
        setProperties(allProperties.slice(0, 4)); 

      } catch (err: any) {
        console.error("Failed to fetch featured properties:", err);
        setError(err.message || 'Failed to load featured properties.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const renderProperties = () => {
     if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10 col-span-full">
          <Loader2 className="h-8 w-8 animate-spin text-crypto-light" />
          <p className="ml-3 text-gray-400">Loading Featured...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 text-red-500 col-span-full">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Error: {error}</p>
        </div>
      );
    }
    
    if (properties.length === 0) {
       return <p className="text-gray-400 col-span-full text-center py-10">No featured properties available.</p>;
    }

    return properties.map(property => (
      <PropertyCard 
        key={property.nftAddress}
        id={property.tokenId} 
        nftAddress={property.nftAddress}
        title={property.metadata?.name || 'Unnamed Property'}
        location={property.propertyDetails.physicalAddress}
        // Price currently not available directly in PropertyDto for this general view
        imageUrl={property.metadata?.image || ''}
        sqft={property.propertyDetails.sqft}
        // featured={property.isFeatured} // Uncomment if backend adds this flag
      />
    ));
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-2">Featured <span className="text-gradient">Properties</span></h2>
            <p className="text-gray-400">Discover our selection of premium digital real estate</p>
          </div>
          {/* Filter/Sort buttons might not be needed for a small featured section */}
          {/* <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="border-crypto-light/30 text-crypto-light">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="border-crypto-light/30 text-crypto-light">
              <ArrowDownAZ className="mr-2 h-4 w-4" />
              Sort By
            </Button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderProperties()}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/properties">
            <Button className="crypto-btn">
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;