'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { ShoppingCart, Filter, ArrowDownAZ, Loader2, AlertTriangle, Tag } from 'lucide-react';
import { ListingDto, PropertyDto } from '@/types/dtos';
import { formatUnits } from 'ethers';

// Helper function to fetch IPFS metadata (could be moved to a utils file)
async function fetchIpfsMetadata(tokenUri: string): Promise<Record<string, any> | null> {
  if (!tokenUri || !tokenUri.startsWith('ipfs://')) return null;
  const cid = tokenUri.replace('ipfs://', '');
  const url = `https://ipfs.io/ipfs/${cid}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch { return null; }
}

// Define the combined type explicitly for clarity
type PropertyWithMetadata = PropertyDto & { metadata?: Record<string, any> };

const MarketplacePage = () => {
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [propertyDataMap, setPropertyDataMap] = useState<Record<string, PropertyWithMetadata>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        
        // 1. Fetch listings
        const listingsResponse = await fetch(`${apiUrl}/marketplace/listings`);
        if (!listingsResponse.ok) {
          throw new Error(`HTTP error fetching listings! status: ${listingsResponse.status}`);
        }
        const listingsData: ListingDto[] = await listingsResponse.json();
        setListings(listingsData);

        // 2. Get unique property addresses from listings - Convert Set to Array here
        const propertyAddresses = Array.from(new Set(listingsData.map(l => l.nftAddress))); 
        if (propertyAddresses.length === 0) {
          setIsLoading(false);
          return; // No properties to fetch details for
        }

        // 3. Fetch property details for each unique address
        const propertyPromises = propertyAddresses.map(addr => 
          fetch(`${apiUrl}/properties/${addr}`).then(async (res) => {
            if (!res.ok) return null; 
            const propData: PropertyDto = await res.json();
            // 4. Fetch metadata for each property
            const fetchedMetadata = await fetchIpfsMetadata(propData.tokenUri);
            // Combine property data and metadata, ensuring metadata is undefined if null
            const combinedData: PropertyWithMetadata = {
               ...propData,
               metadata: fetchedMetadata ?? undefined // Use undefined if fetchedMetadata is null
            };
            return combinedData;
          })
        );
        const propertiesResults = await Promise.all(propertyPromises);
        
        // 5. Create a map for easy lookup
        const fetchedPropertyMap: Record<string, PropertyWithMetadata> = {};
        propertiesResults.forEach(prop => {
          if (prop) {
            fetchedPropertyMap[prop.nftAddress] = prop;
          }
        });
        setPropertyDataMap(fetchedPropertyMap);

      } catch (err: any) {
        console.error("Failed to fetch marketplace data:", err);
        setError(err.message || 'Failed to load marketplace listings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceData();
  }, []);

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

    if (error) {
      return (
        <div className="text-center py-20 text-red-500 col-span-full">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2"/>
          <p>Error loading marketplace: {error}</p>
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

    // TODO: Implement filtering and sorting
    const displayedListings = listings;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedListings.map(listing => {
           // Look up combined property + metadata
           const propertyWithMeta = propertyDataMap[listing.nftAddress]; 
           if (!propertyWithMeta) { 
             // Optionally render a placeholder or skip if property data hasn't loaded yet
             return (
                <div key={listing.id} className="glass-card rounded-lg p-4 flex items-center justify-center text-gray-500 min-h-[300px]">
                   Loading details...
                 </div>
             );
           } 

           const metadata = propertyWithMeta.metadata;
           const propertyDetails = propertyWithMeta.propertyDetails;

           // Format BigInt strings from listing
           const formattedPrice = formatUnits(listing.pricePerToken, 18); // Assuming 18 decimals for ETH price
           const formattedAmount = formatUnits(listing.amount, 18); // Assuming 18 decimals for PropertyToken

           return (
             <PropertyCard 
                key={listing.id} // Use listing ID as key
                id={listing.tokenId}
                nftAddress={listing.nftAddress}
                title={metadata?.name || 'Loading...'} 
                location={propertyDetails?.physicalAddress || 'Loading...'}
                // Pass price information from the listing
                price={`Ξ ${parseFloat(formattedPrice).toFixed(5)}`} // Display formatted ETH price per token
                cryptoPrice={`${parseFloat(formattedAmount).toLocaleString()} tokens`} // Display amount available
                imageUrl={metadata?.image || ''} 
                sqft={propertyDetails?.sqft || 0}
                featured={false} // Listings might not be inherently featured
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