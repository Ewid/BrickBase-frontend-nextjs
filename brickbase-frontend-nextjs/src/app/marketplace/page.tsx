'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { ShoppingCart, Filter, ArrowDownAZ, Loader2, AlertTriangle, Tag } from 'lucide-react';
import { ListingDto, PropertyDto } from '@/types/dtos';
import { formatUnits } from 'ethers';

// Helper function to modify existing API calls to match new data structure
const fetchPropertyDetails = async (apiUrl: string, propertyId: string): Promise<PropertyDto | null> => {
  try {
    const response = await fetch(`${apiUrl}/properties/${propertyId}`, {
      cache: 'force-cache',
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    console.log(`Fetched property ${propertyId}:`, data);
    
    // Make sure the data has a propertyDetails property
    if (!data.propertyDetails) {
      data.propertyDetails = {
        physicalAddress: 'Address not available',
        sqft: 0,
        bedrooms: 0,
        bathrooms: 0,
        yearBuilt: 0,
        propertyType: 'Unknown',
        associatedPropertyToken: ''
      };
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching property ${propertyId}:`, error);
    return null;
  }
};

// Mock data for when API is unavailable
const MOCK_LISTINGS: ListingDto[] = [
  {
    listingId: 1,
    nftAddress: '0xda988e1D11748E6589ac8a256A6cb61A3dd4F9D2',
    tokenId: "1",
    seller: '0x0B39C0f5F9de8B567116FFdB15543811491DF976',
    tokenAddress: '0x6fb0d9B37a681187C85E505596B45c4B3bE09222',
    amount: '1000000000000000000',
    pricePerToken: '50000000000000000',
    active: true
  },
  {
    listingId: 2,
    nftAddress: '0xda988e1D11748E6589ac8a256A6cb61A3dd4F9D2',
    tokenId: "2",
    seller: '0x0B39C0f5F9de8B567116FFdB15543811491DF976',
    tokenAddress: '0x6fb0d9B37a681187C85E505596B45c4B3bE09222',
    amount: '2000000000000000000',
    pricePerToken: '60000000000000000',
    active: true
  },
  {
    listingId: 3,
    nftAddress: '0xda988e1D11748E6589ac8a256A6cb61A3dd4F9D2',
    tokenId: "3",
    seller: '0x0B39C0f5F9de8B567116FFdB15543811491DF976',
    tokenAddress: '0x6fb0d9B37a681187C85E505596B45c4B3bE09222',
    amount: '1500000000000000000',
    pricePerToken: '55000000000000000',
    active: true
  }
];

const MOCK_PROPERTIES: Record<string, PropertyDto> = {
  '0xda988e1D11748E6589ac8a256A6cb61A3dd4F9D2': {
    id: '0xda988e1D11748E6589ac8a256A6cb61A3dd4F9D2',
    tokenId: 1,
    metadata: {
      name: 'Luxury Condo #1',
      description: 'A stunning luxury condo in the heart of the city with beautiful views and modern amenities.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070',
      attributes: [
        { trait_type: 'Address', value: '123 Crypto Ave, Blockchain City' },
        { trait_type: 'Square Footage', value: 2500 }
      ]
    },
    totalSupply: '10000000000000000000000',
    propertyDetails: {
      physicalAddress: '123 Crypto Ave, Blockchain City',
      sqft: 2500,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 2022,
      propertyType: 'Residential',
      associatedPropertyToken: '0x6fb0d9B37a681187C85E505596B45c4B3bE09222'
    }
  }
};

// Helper function to fetch IPFS metadata with caching and timeout
const metadataCache = new Map<string, Record<string, any> | null>();
async function fetchIpfsMetadata(tokenUri: string): Promise<Record<string, any> | null> {
  if (!tokenUri || !tokenUri.startsWith('ipfs://')) return null;
  
  // Return cached value if available
  if (metadataCache.has(tokenUri)) {
    return metadataCache.get(tokenUri) || null;
  }
  
  const cid = tokenUri.replace('ipfs://', '');
  // Try gateway.pinata.cloud as it can be faster than ipfs.io
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  
  try {
    // Set timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    const data = await response.json();
    
    // Cache the result
    metadataCache.set(tokenUri, data);
    return data;
  } catch (err) {
    // If pinata fails, try ipfs.io as fallback
    try {
      const fallbackUrl = `https://ipfs.io/ipfs/${cid}`;
      const response = await fetch(fallbackUrl);
      if (!response.ok) return null;
      const data = await response.json();
      metadataCache.set(tokenUri, data);
      return data;
    } catch {
      metadataCache.set(tokenUri, null);
      return null;
    }
  }
}

const MarketplacePage = () => {
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [propertyDataMap, setPropertyDataMap] = useState<Record<string, PropertyDto>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        
        let listingsData: ListingDto[] = [];
        
        try {
          // 1. Attempt to fetch listings
          const listingsResponse = await fetch(`${apiUrl}/marketplace/listings`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000)
          });
          
          if (!listingsResponse.ok) {
            throw new Error(`HTTP error fetching listings! status: ${listingsResponse.status}`);
          }
          
          listingsData = await listingsResponse.json();
          console.log("Raw listings from API:", listingsData);
        } catch (listingsErr) {
          console.warn("Error fetching listings, using mock data:", listingsErr);
          listingsData = MOCK_LISTINGS;
          setUseMockData(true);
        }
        
        setListings(listingsData);
        
        // If we're using mock data, use mock properties too
        if (useMockData) {
          setPropertyDataMap(MOCK_PROPERTIES);
          setIsLoading(false);
          return;
        }

        // 2. Get unique property addresses from listings
        const propertyAddresses = Array.from(new Set(listingsData.map(l => l.nftAddress))); 
        if (propertyAddresses.length === 0) {
          setIsLoading(false);
          return; // No properties to fetch details for
        }

        // 3. Batch requests for property details to reduce network load
        const properties: Record<string, PropertyDto> = {};
        
        try {
          for (const address of propertyAddresses) {
            const property = await fetchPropertyDetails(apiUrl, address);
            if (property) {
              properties[address] = property;
              // Update state incrementally for faster UI feedback
              setPropertyDataMap(prev => ({ ...prev, [address]: property }));
            }
          }
          
          // If we didn't get any properties, use mock data
          if (Object.keys(properties).length === 0) {
            setPropertyDataMap(MOCK_PROPERTIES);
            setUseMockData(true);
          }
          
        } catch (propertiesErr) {
          console.warn("Error fetching properties, using mock data:", propertiesErr);
          setPropertyDataMap(MOCK_PROPERTIES);
          setUseMockData(true);
        }

      } catch (err: any) {
        console.error("Failed to fetch marketplace data:", err);
        setError(err.message || 'Failed to load marketplace listings.');
        
        // Fall back to mock data on error
        setListings(MOCK_LISTINGS);
        setPropertyDataMap(MOCK_PROPERTIES);
        setUseMockData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceData();
  }, [useMockData]);

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20 col-span-full">
          <Loader2 className="h-12 w-12 animate-spin text-crypto-light" />
          <p className="ml-4 text-lg text-gray-400">Loading Marketplace...</p>
        </div>
      );
    }

    if (error && !useMockData) {
      return (
        <div className="text-center py-20 text-red-500 col-span-full">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2"/>
          <p>Error loading marketplace: {error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-crypto-light/30 text-crypto-light"
            onClick={() => setUseMockData(true)}>
            View Demo Data
          </Button>
        </div>
      );
    }

    if (listings.length === 0) {
      return (
        <div className="text-center py-20 text-gray-400 col-span-full">
           <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50"/>
          <p>No active listings found.</p>
        </div>
      );
    }

    // Filter only active listings and log for debugging
    const activeListings = listings.filter(listing => listing.active === true);
    console.log(`Found ${listings.length} total listings, ${activeListings.length} are active`);

    if (activeListings.length === 0 && listings.length > 0) {
      return (
        <div className="text-center py-20 text-gray-400 col-span-full">
           <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50"/>
          <p>Found {listings.length} listings, but none are active.</p>
          <Button 
            variant="outline" 
            className="mt-4 border-crypto-light/30 text-crypto-light"
            onClick={() => console.log("Listings data:", listings)}>
            Debug Listings
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {useMockData && (
          <div className="col-span-full mb-4 py-2 px-4 bg-yellow-500/20 text-yellow-300 rounded-md text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <p>Using demo data. Connect your backend API to see real marketplace listings.</p>
          </div>
        )}
        
        {activeListings.map(listing => {
          // Find property by matching property.id with listing.nftAddress
          const property = Object.values(propertyDataMap).find(p => p.id === listing.nftAddress);
          
          if (!property) { 
            return (
              <div key={listing.listingId} className="glass-card rounded-lg p-4 flex items-center justify-center text-gray-500 min-h-[300px]">
                Loading details...
              </div>
            );
          }

          // Extract data from metadata directly now
          const metadata = property.metadata;
          
          // Helper function to get attribute values
          const getAttributeValue = (traitType: string, defaultValue: any) => {
            const attr = metadata?.attributes?.find((attr: any) => attr.trait_type === traitType);
            return attr ? attr.value : defaultValue;
          };
          
          // Extract address and sqft from metadata attributes
          const address = getAttributeValue('Address', 'Location not available');
          const sqft = getAttributeValue('Square Footage', 0);

          // Format BigInt strings from listing
          const formattedPrice = formatUnits(listing.pricePerToken, 18);
          const formattedAmount = formatUnits(listing.amount, 18);

          // Parse tokenId from string to number if needed
          const tokenId = typeof listing.tokenId === 'string' ? parseInt(listing.tokenId, 10) : listing.tokenId;

          return (
            <PropertyCard 
              key={listing.listingId}
              id={tokenId}
              nftAddress={listing.nftAddress}
              title={metadata?.name || 'Loading...'}
              location={address}
              price={`Ξ ${parseFloat(formattedPrice).toFixed(5)}`}
              cryptoPrice={`${parseFloat(formattedAmount).toLocaleString()} tokens`}
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
    <div className="min-h-screen bg-crypto-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-10 px-6 max-w-7xl mx-auto w-full">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">NFT <span className="text-gradient">Marketplace</span></h1>
            <p className="text-gray-400">Buy and sell fractional property tokens</p>
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

      </main>
      <Footer />
    </div>
  );
};

export default MarketplacePage; 