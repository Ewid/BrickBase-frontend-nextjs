'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Building2, MapPin, Tag, ArrowLeft, Loader2, AlertTriangle, ShoppingCart } from "lucide-react";
import Link from 'next/link';
import { PropertyDto } from '@/types/dtos';
import { formatUnits } from 'ethers';
import { useAccount } from '@/hooks/useAccount';
import CreateListingForm from '@/components/CreateListingForm';

// Mock property data for fallback when API fails
const MOCK_PROPERTY: PropertyDto = {
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
};

// We don't need separate mock metadata since it's included in the property response
const MOCK_METADATA = MOCK_PROPERTY.metadata;

// Helper function to fetch IPFS metadata (simplified since metadata is now in the direct API response)
async function fetchImageFromIpfs(ipfsUrl: string): Promise<string | null> {
  if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) {
    return null;
  }
  
  // Return HTTP URL for the image
  const cid = ipfsUrl.replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

// Define default empty property details to avoid TypeScript errors
const DEFAULT_PROPERTY_DETAILS = {
  physicalAddress: 'Address not available',
  sqft: 0,
  bedrooms: 0,
  bathrooms: 0,
  yearBuilt: 0,
  propertyType: 'Unknown',
  associatedPropertyToken: 'Not available'
};

const PropertyDetailPage = () => {
  const params = useParams();
  const rawPropertyAddress = params?.id as string | undefined;
  const { isConnected } = useAccount();

  // Use our custom hook to validate and normalize the address

  const [property, setProperty] = useState<PropertyDto | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!rawPropertyAddress) {
        setError('Property address not found or invalid.');
        setIsLoading(false);
        return;
      }

      // Even if the address doesn't pass ethers validation, try to use it
      // as some systems don't require proper checksum addresses
      const addressToUse =  rawPropertyAddress;

      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        console.log(`Fetching property: ${apiUrl}/properties/${addressToUse}`);
        
        const response = await fetch(`${apiUrl}/properties/${addressToUse}`, {
          signal: AbortSignal.timeout(8000) // 8 second timeout
        });
        
        if (response.status === 404) {
           throw new Error(`Property ${addressToUse} not found via API.`);
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: PropertyDto = await response.json();
        console.log("Property data from API:", data);
        
        // Ensure propertyDetails exists (create it if not present)
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
        
        setProperty(data);

        // Convert IPFS image URL to HTTP URL for display
        if (data.metadata?.image) {
          if (data.metadata.image.startsWith('ipfs://')) {
            const httpUrl = await fetchImageFromIpfs(data.metadata.image);
            setImageUrl(httpUrl);
          } else {
            setImageUrl(data.metadata.image);
          }
        }

      } catch (err: any) {
        console.error("Failed to fetch property details:", err);
        setError(err.message || 'Failed to load property details.');
        
        // Create customized mock data that matches the property ID
        const customMockProperty = {
          ...MOCK_PROPERTY,
          id: addressToUse,
          tokenId: parseInt(addressToUse.substring(2, 6), 16) % 100 // Use part of the address as a deterministic token ID
        };
        
        // Use mock data if API call fails
        if (!useMockData) {
          setUseMockData(true);
          setProperty(customMockProperty);
          setImageUrl(customMockProperty.metadata.image);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [rawPropertyAddress, useMockData]);

  const handleListingSuccess = () => {
    // Close the modal after successful listing creation
    setShowCreateListingModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-crypto-light mb-4" />
        <p className="text-lg text-gray-400">Loading Property Details...</p>
      </div>
    );
  }

  if (error && !useMockData) {
    return (
      <div className="min-h-screen bg-crypto-dark flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Property</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/properties">
            <Button variant="outline" className="border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                 Back to Properties
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10"
            onClick={() => setUseMockData(true)}>
            View Demo Data
          </Button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
       <div className="min-h-screen bg-crypto-dark flex flex-col items-center justify-center text-center p-6">
         <p className="text-xl text-gray-400">Property data could not be loaded.</p>
         <Link href="/properties" className="mt-4 text-crypto-light hover:underline">
            Go Back
         </Link>
       </div>
    );
  }
  
  // Safely access properties with fallbacks - now directly from the metadata
  const displayTitle = property.metadata?.name || 'Unnamed Property';
  const displayDescription = property.metadata?.description || 'No description available.';
  
  // Extract attributes from metadata if available
  const getAttributeValue = (traitType: string, defaultValue: any) => {
    const attr = property.metadata?.attributes?.find(
      (attr: any) => attr.trait_type === traitType
    );
    return attr ? attr.value : defaultValue;
  };
  
  // Safely access property details with fallbacks
  const propertyDetails = property.propertyDetails || DEFAULT_PROPERTY_DETAILS;
  const address = propertyDetails.physicalAddress || getAttributeValue('Address', 'Address not available');
  
  // Try to get values from property details first, then from metadata attributes as fallback
  const sqft = propertyDetails.sqft || getAttributeValue('Square Footage', 0);
  const bedrooms = propertyDetails.bedrooms || getAttributeValue('Bedrooms', 0);
  const bathrooms = propertyDetails.bathrooms || getAttributeValue('Bathrooms', 0);
  const yearBuilt = propertyDetails.yearBuilt || getAttributeValue('Year Built', 0);
  const propertyType = propertyDetails.propertyType || getAttributeValue('Property Type', 'Unknown');
  const tokenAddress = propertyDetails.associatedPropertyToken || getAttributeValue('Token Address', 'Not available');
  
  // Get formatted address for display

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
        
        {useMockData && (
          <div className="mb-6 py-2 px-4 bg-yellow-500/20 text-yellow-300 rounded-md text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <p>Using demo data. Connect your backend API to see real property details.</p>
          </div>
        )}
        
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="relative h-96 w-full bg-gray-800">
            {imageUrl ? (
               <Image 
                 src={imageUrl} 
                 alt={displayTitle}
                 fill
                 className="object-cover"
                 sizes="(max-width: 1024px) 100vw, 1024px"
                 priority
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400">Image loading or unavailable...</div>
             )}
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
              <h1 className="text-3xl font-bold mb-2 md:mb-0" title={displayTitle}>{displayTitle}</h1>
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {address}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 border-b border-white/10 pb-6">
               <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Building2 className="h-4 w-4 text-crypto-light" />
                  <span>{sqft} sqft</span>
                </div>
                <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>{bedrooms} Beds</span>
                </div>
                 <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>{bathrooms} Baths</span>
                </div>
                 <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>Built: {yearBuilt}</span>
                </div>
                <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>Type: {propertyType}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed">{displayDescription}</p>
                
                <h3 className="text-lg font-semibold mt-6 mb-2">Contract Details</h3>
                <div className="text-xs text-gray-400 space-y-1 break-all">
                    <p>NFT Address: {property.id || 'N/A'}</p>
                    <p>Token ID: {property.tokenId !== undefined ? property.tokenId : 'N/A'}</p>
                    <p>Total Supply: {property.totalSupply ? formatUnits(property.totalSupply, 18) : 'N/A'}</p>
                    <p>Fractional Token: {tokenAddress}</p>
                </div>
              </div>
              
              <div className="md:col-span-1 space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">Purchase options available on the Marketplace.</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href="/marketplace" className="inline-block">
                        <Button variant="outline" className="w-full border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Go to Marketplace
                        </Button>
                    </Link>
                    {isConnected && propertyDetails.associatedPropertyToken && (
                      <Button 
                        className="w-full crypto-btn"
                        onClick={() => setShowCreateListingModal(true)}
                      >
                        Create Listing
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Create Listing Modal */}
      {showCreateListingModal && property && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Create Property Listing</h2>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                onClick={() => setShowCreateListingModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold">{property.metadata?.name}</h3>
              <p className="text-sm text-gray-400">
                Token: {propertyDetails.associatedPropertyToken?.slice(0, 6)}...{propertyDetails.associatedPropertyToken?.slice(-4)}
              </p>
            </div>
            
            <CreateListingForm 
              property={property} 
              onSuccess={handleListingSuccess}
              onError={(error) => console.error('Listing creation error:', error)}
            />
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default PropertyDetailPage; 