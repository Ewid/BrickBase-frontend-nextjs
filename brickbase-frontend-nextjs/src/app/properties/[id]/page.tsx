'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Building2, MapPin, Bitcoin, Tag, Wallet, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { PropertyDto } from '@/types/dtos';
import { formatUnits } from 'ethers';

// Helper function to fetch IPFS metadata
async function fetchIpfsMetadata(tokenUri: string): Promise<Record<string, any> | null> {
  if (!tokenUri || !tokenUri.startsWith('ipfs://')) {
    return null;
  }
  // Use a public gateway or your own Pinata gateway
  const cid = tokenUri.replace('ipfs://', '');
  const url = `https://ipfs.io/ipfs/${cid}`; // Example public gateway
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch IPFS data: ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching IPFS metadata:", error);
    return null;
  }
}

const PropertyDetailPage = () => {
  const params = useParams();
  const propertyNftAddress = params?.id as string | undefined;

  const [property, setProperty] = useState<PropertyDto | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyNftAddress) {
        setError('Property address not found in URL.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/properties/${propertyNftAddress}`);
        
        if (response.status === 404) {
           throw new Error('Property not found via API.');
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: PropertyDto = await response.json();
        setProperty(data);

        // Fetch IPFS metadata after getting the DTO
        if (data.tokenUri) {
          const fetchedMetadata = await fetchIpfsMetadata(data.tokenUri);
          setMetadata(fetchedMetadata);
        }

      } catch (err: any) {
        console.error("Failed to fetch property details:", err);
        setError(err.message || 'Failed to load property details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyNftAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-crypto-light mb-4" />
        <p className="text-lg text-gray-400">Loading Property Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-crypto-dark flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Property</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/properties">
            <Button variant="outline" className="border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                 Back to Properties
            </Button>
         </Link>
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
  
  const displayTitle = metadata?.name || 'Unnamed Property';
  const displayImage = metadata?.image || '';
  const displayDescription = metadata?.description || 'No description available.';

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
          <div className="relative h-96 w-full bg-gray-800">
            {displayImage ? (
               <Image 
                 src={displayImage} 
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
                {property.propertyDetails.physicalAddress}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 border-b border-white/10 pb-6">
               <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Building2 className="h-4 w-4 text-crypto-light" />
                  <span>{property.propertyDetails.sqft} sqft</span>
                </div>
                <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>{property.propertyDetails.bedrooms} Beds</span>
                </div>
                 <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>{property.propertyDetails.bathrooms} Baths</span>
                </div>
                 <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>Built: {property.propertyDetails.yearBuilt}</span>
                </div>
                <div className="flex items-center gap-1 text-sm bg-crypto-dark/50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-crypto-light" />
                  <span>Type: {property.propertyDetails.propertyType}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed">{displayDescription}</p>
                
                <h3 className="text-lg font-semibold mt-6 mb-2">Contract Details</h3>
                <div className="text-xs text-gray-400 space-y-1 break-all">
                    <p>NFT Address: {property.nftAddress}</p>
                    <p>Token ID: {property.tokenId}</p>
                    <p>Fractional Token: {property.propertyDetails.associatedPropertyToken}</p>
                    <p>Token URI: {property.tokenUri}</p>
                    <p>Owner: {property.owner}</p>
                </div>
              </div>
              
              <div className="md:col-span-1 space-y-6">
                 <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Purchase options available on the Marketplace.</p>
                    <Link href="/marketplace" className="mt-2 inline-block">
                        <Button variant="outline" className="border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10">
                            Go to Marketplace
                        </Button>
                    </Link>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetailPage; 