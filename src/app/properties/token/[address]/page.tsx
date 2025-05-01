'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Building2, MapPin, Tag, ArrowLeft, Loader2, AlertTriangle, ShoppingCart, Shield } from "lucide-react";
import Link from 'next/link';
import { PropertyDto } from '@/types/dtos';
import { formatUnits } from 'ethers';
import { useAccount } from '@/hooks/useAccount';
import CreateListingForm from '@/components/CreateListingForm';
import { getPropertyByTokenAddress } from '@/services/property';
import { tryConvertIpfsUrl } from '@/services/marketplace';

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

const TokenPropertyDetailPage = () => {
  const params = useParams();
  const tokenAddress = params?.address as string | undefined;
  const { isConnected } = useAccount();

  const [property, setProperty] = useState<PropertyDto | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!tokenAddress) {
        setError('Token address not found or invalid.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Use token-based property fetch
        const data = await getPropertyByTokenAddress(tokenAddress);
        console.log("Property data from API (token lookup):", data);
        
        // Ensure propertyDetails exists (create it if not present)
        if (data && !data.propertyDetails) {
          data.propertyDetails = {
            physicalAddress: 'Address not available',
            sqft: 0,
            bedrooms: 0,
            bathrooms: 0,
            yearBuilt: 0,
            propertyType: 'Unknown',
            associatedPropertyToken: tokenAddress
          };
        }
        
        setProperty(data);

        // Convert IPFS image URL to HTTP URL for display
        try {
          if (data?.metadata?.image) {
            const httpUrl = tryConvertIpfsUrl(data.metadata.image);
            setImageUrl(httpUrl);
          }
        } catch (imageError) {
          console.error("Failed to process image URL:", imageError);
          // Don't throw here - we'll just show a placeholder image
          setImageUrl('/property-placeholder.jpg');
        }

      } catch (err: any) {
        console.error("Failed to fetch property details by token:", err);
        setError(err.message || 'Failed to load property details.');
        
        // Create customized mock data that matches the token address
        const customMockProperty = {
          ...MOCK_PROPERTY,
          tokenAddress: tokenAddress,
          propertyDetails: {
            ...MOCK_PROPERTY.propertyDetails,
            associatedPropertyToken: tokenAddress
          }
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
  }, [tokenAddress, useMockData]);

  const handleListingSuccess = () => {
    // Close the modal after successful listing creation
    setShowCreateListingModal(false);
  };

  // Safe access to property details
  const propertyDetails = property?.propertyDetails || DEFAULT_PROPERTY_DETAILS;

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
  const getAttributeValue = (attrName: string, defaultValue: string = 'Not specified') => {
    if (!property?.metadata?.attributes) return defaultValue;
    
    // Create an array of possible names to check for (to handle different naming conventions)
    const possibleNames = [attrName];
    
    // Add alternate names based on the attribute we're looking for
    if (attrName === 'Bedrooms') possibleNames.push('Beds');
    if (attrName === 'Bathrooms') possibleNames.push('Baths');
    if (attrName === 'Square Footage') possibleNames.push('sqft', 'Sqft');
    if (attrName === 'Year Built') possibleNames.push('YearBuilt', 'Year');
    if (attrName === 'Property Type') possibleNames.push('Type');
    if (attrName === 'Address') possibleNames.push('Location', 'location', 'address');
    
    // Look for any matching attribute
    const attr = property.metadata.attributes.find(
      attr => possibleNames.some(name => 
        attr.trait_type?.toLowerCase() === name.toLowerCase()
      )
    );
    
    return attr?.value?.toString() || defaultValue;
  };
  
  // First try to get address from metadata's "Address" attribute, then fall back to physical address
  const address = getAttributeValue('Address', '') || propertyDetails.physicalAddress || 'Address not available';
  
  // Try to get values from metadata attributes first, then from property details as fallback
  const sqft = getAttributeValue('Square Footage', propertyDetails.sqft?.toString() || '0');
  const bedrooms = getAttributeValue('Bedrooms', propertyDetails.bedrooms?.toString() || '0');
  const bathrooms = getAttributeValue('Bathrooms', propertyDetails.bathrooms?.toString() || '0');
  const yearBuilt = getAttributeValue('Year Built', propertyDetails.yearBuilt?.toString() || '0');
  const propertyType = getAttributeValue('Property Type', propertyDetails.propertyType || 'Unknown');

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Navbar />
      <main className="pt-24 pb-10 px-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/properties" className="inline-flex items-center text-gray-300 hover:text-white transition-colors">
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
        
        <div className="glass-card-vibrant rounded-xl overflow-hidden border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <div className="relative h-96 w-full bg-gray-800">
            {imageUrl ? (
               <div className="relative h-full w-full">
                 <Image 
                   src={imageUrl} 
                   alt={displayTitle}
                   fill
                   className="object-cover"
                   sizes="(max-width: 1024px) 100vw, 1024px"
                   priority
                 />
                 {/* Overlay with futuristic elements */}
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                 <div className="absolute top-4 right-4 blockchain-badge shadow-lg">
                   <Shield className="h-4 w-4 mr-1" />
                   <span>Blockchain Verified</span>
                 </div>
               </div>
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-900 to-gray-800">
                 <Building2 className="h-12 w-12 text-gray-600 mb-2" />
                 <span className="text-gray-500">Image loading or unavailable...</span>
               </div>
             )}
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
              <h1 className="text-3xl font-bold mb-2 md:mb-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" title={displayTitle}>{displayTitle}</h1>
              <div className="flex items-center text-gray-300 text-sm bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-blue-500/20 shadow-inner">
                <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                <span className="font-medium">{address}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 border-b border-blue-500/20 pb-6">
               <div className="flex items-center gap-2 text-sm bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-200 font-medium">{sqft} sqft</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  <Tag className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-200 font-medium">{bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  <Tag className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-200 font-medium">{bathrooms} Baths</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  <Tag className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-200 font-medium">Built: {yearBuilt}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  <Tag className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-200 font-medium">Type: {propertyType}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div className="md:col-span-2">
                <div className="bg-gray-900/30 backdrop-blur-sm p-5 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <h2 className="text-xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Property Description</h2>
                  <p className="text-gray-300 leading-relaxed">{displayDescription}</p>
                  
                  <div className="mt-6 pt-6 border-t border-blue-500/20">
                    <h3 className="text-lg font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Blockchain Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 p-3 rounded-lg border border-blue-500/20">
                        <div className="text-xs text-gray-400 font-medium mb-1">NFT Contract</div>
                        <div className="blockchain-address text-sm text-blue-300 break-all font-mono">{property.id || 'N/A'}</div>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-lg border border-blue-500/20">
                        <div className="text-xs text-gray-400 font-medium mb-1">Token Contract</div>
                        <div className="blockchain-address text-sm text-blue-300 break-all font-mono">{tokenAddress || 'Not available'}</div>
                      </div>
                      {property.totalSupply && (
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-blue-500/20 sm:col-span-2">
                          <div className="text-xs text-gray-400 font-medium mb-1">Total Supply</div>
                          <div className="text-sm text-green-400 font-medium">{formatUnits(property.totalSupply, 18)} tokens</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-gray-900/80 to-blue-900/20 backdrop-blur-sm p-5 rounded-xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">Tokenized Ownership</h3>
                    <p className="text-gray-300 text-sm">Purchase fractional ownership on the marketplace or create a new listing.</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Link href="/marketplace" className="inline-block w-full">
                      <Button 
                        className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-500/30"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></span>
                        <ShoppingCart className="mr-2 h-4 w-4 text-blue-200" />
                        <span className="relative z-10 font-medium">Go to Marketplace</span>
                      </Button>
                    </Link>
                    
                    {isConnected && tokenAddress && (
                      <Button 
                        className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-500/30"
                        onClick={() => setShowCreateListingModal(true)}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></span>
                        <span className="relative z-10 font-medium">Create Listing</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Create Listing Modal - Enhanced with web3 styling */}
      {showCreateListingModal && property && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="glass-card-vibrant rounded-xl max-w-md w-full p-6 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            {/* Animated gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-sm opacity-30 -z-10"></div>
            
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Create Property Listing</h2>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-800/50" 
                onClick={() => setShowCreateListingModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="mb-5 bg-gray-900/50 p-3 rounded-lg border border-blue-500/20">
              <h3 className="font-semibold text-white">{property.metadata?.name}</h3>
              <div className="flex items-center mt-1">
                <div className="blockchain-address text-xs text-blue-300 bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded-md border border-blue-500/30 font-mono">
                  {tokenAddress?.slice(0, 6)}...{tokenAddress?.slice(-4)}
                </div>
                <span className="ml-2 text-xs text-gray-400">Token Contract</span>
              </div>
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

export default TokenPropertyDetailPage;
