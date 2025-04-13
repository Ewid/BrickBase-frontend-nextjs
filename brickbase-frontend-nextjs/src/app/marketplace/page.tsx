'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Tag, Loader2, AlertCircle, RefreshCcw, Wallet, DollarSign, ExternalLink, MapPin, ArrowUpRight, Building2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from '@/hooks/useAccount';
import BuyTokensForm from '@/components/BuyTokensForm';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Store } from 'lucide-react';
import { ImageOff } from 'lucide-react';
import { ethers } from 'ethers';
import { tryConvertIpfsUrl } from '@/services/marketplace';

// Define interfaces for the marketplace data
interface Listing {
  listingId: number;
  seller: string;
  nftAddress: string;
  tokenId: string;
  tokenAddress: string;
  pricePerToken: string;
  amount: string;
  active: boolean;
}

interface PropertyMetadata {
  id: string;
  tokenId: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: any[];
  };
  totalSupply: string;
}

interface EnrichedListing extends Listing {
  propertyDetails: PropertyMetadata | null;
  formattedPrice: string;
  formattedAmount: string;
  usdPrice?: string; // For USD price display
}

// Helper function to extract attribute value with fallback
const getAttributeValue = (attributes: any, traitType: string, defaultValue: any = null) => {
  if (!attributes) return defaultValue;
  
  // Try standard format first
  if (attributes[traitType] !== undefined) {
    return attributes[traitType];
  }
  
  // Create an array of possible names to check for (to handle different naming conventions)
  const possibleNames = [traitType];
  
  // Add alternate names based on the attribute we're looking for
  if (traitType === 'Bedrooms') possibleNames.push('Beds');
  if (traitType === 'Bathrooms') possibleNames.push('Baths');
  if (traitType === 'Square Footage') possibleNames.push('sqft', 'Sqft');
  if (traitType === 'Year Built') possibleNames.push('YearBuilt', 'Year');
  if (traitType === 'Property Type') possibleNames.push('Type');
  if (traitType === 'Address') possibleNames.push('Location', 'location', 'address');
  
  // Try array format (trait_type/value pairs)
  if (Array.isArray(attributes)) {
    const attr = attributes.find((attr: any) => 
      possibleNames.some(name => 
        attr.trait_type === name || 
        attr.trait_type?.toLowerCase() === name.toLowerCase()
      )
    );
    return attr ? attr.value : defaultValue;
  }
  
  return defaultValue;
};

// Helper function to truncate addresses
function shortenAddress(address: string): string {
  if (!address) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default function MarketplacePage() {
  const { account, isConnected, connectWallet } = useAccount();
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<EnrichedListing | null>(null);
  const [ethUsdPrice, setEthUsdPrice] = useState<number | null>(null);
  
  const apiUrl = 'http://localhost:3000'; // Your backend API URL
  
  // Fetch ETH to USD price
  const fetchEthUsdPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
        signal: AbortSignal.timeout(15000), // 15 second timeout for price API
      });
      if (response.ok) {
        const data = await response.json();
        setEthUsdPrice(data.ethereum.usd);
      }
    } catch (error) {
      console.warn('Failed to fetch ETH/USD price:', error);
    }
  };
  
  const fetchPropertyDetails = async (listing: Listing): Promise<PropertyMetadata | null> => {
    try {
      const tokenAddress = listing.tokenAddress;
      console.log(`Making request to: ${apiUrl}/properties/token/${tokenAddress}`);
      
      const response = await fetch(`${apiUrl}/properties/token/${tokenAddress}`, {
        signal: AbortSignal.timeout(30000), // 30 second timeout
        next: { revalidate: 300 } // Revalidate cache every 5 minutes
      });
      
      if (!response.ok) {
        throw new Error(`Property API returned status ${response.status}`);
      }
      
      // Get raw response text first
      const responseText = await response.text();
      console.log(`Raw property response for token ${tokenAddress}:`, 
                 responseText ? (responseText.length > 200 ? 
                                responseText.substring(0, 200) + "..." : 
                                responseText) : 
                                "EMPTY RESPONSE");
      
      // Handle empty response
      if (!responseText || responseText.trim() === '') {
        console.warn(`Empty response from property API for token ${tokenAddress}`);
        return null;
      }
      
      // Try parsing the response
      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (jsonError) {
        console.error("Invalid JSON in property response:", jsonError);
        return null;
      }
    } catch (error: any) {
      console.error(`Error fetching property for token ${listing.tokenAddress}:`, error);
      return null;
    }
  };
  
  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Fetch listings from marketplace
      console.log("Fetching marketplace listings...");
      
      const response = await fetch(`${apiUrl}/marketplace/listings`, {
        signal: AbortSignal.timeout(30000), // 30 second timeout
        next: { revalidate: 300 } // Revalidate cache every 5 minutes
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText}`);
      }
      
      // Get raw text first to debug
      const responseText = await response.text();
      console.log("Raw listings response:", responseText.substring(0, 200) + "...");
      
      // Parse the text to JSON manually to better handle errors
      const rawListings = responseText ? JSON.parse(responseText) : [];
      console.log(`Found ${rawListings.length} listings`);
      
      // 2. Enrich listings with property details
      const enrichedListings = await Promise.all(
        rawListings.map(async (listing: Listing) => {
          // Calculate formatted values for display
          const formattedPrice = ethers.formatUnits(listing.pricePerToken, 18);
          const formattedAmount = ethers.formatUnits(listing.amount, 18);
          
          // Calculate USD price if ETH price is available
          let usdPrice = undefined;
          if (ethUsdPrice) {
            const ethPrice = parseFloat(formattedPrice);
            usdPrice = (ethPrice * ethUsdPrice).toFixed(2);
          }
          
          // Start with null property details
          let propertyDetails = null;
          
          // Fetch property details for each listing
          if (listing.tokenAddress) {
            try {
              console.log(`Fetching property details for token: ${listing.tokenAddress}`);
              propertyDetails = await fetchPropertyDetails(listing);
            } catch (err) {
              console.error(`Error fetching property details for token ${listing.tokenAddress}:`, err);
            }
          }
          
          return {
            ...listing,
            propertyDetails,
            formattedPrice,
            formattedAmount,
            usdPrice
          };
        })
      );
      
      setListings(enrichedListings);
    } catch (err: any) {
      console.error("Error in fetchListings:", err);
      setError(err.message || "Failed to fetch listings");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Fetch ETH/USD price first, then fetch listings
    fetchEthUsdPrice().then(fetchListings);
    
    // Set up a refresh timer for ETH price
    const priceRefreshInterval = setInterval(fetchEthUsdPrice, 60000); // Every minute
    
    return () => clearInterval(priceRefreshInterval);
  }, []);
  
  const handleRefresh = () => {
    fetchEthUsdPrice().then(fetchListings);
  };
  
  const handlePurchaseSuccess = () => {
    // Refresh listings after successful purchase
    fetchListings();
    // Clear selected listing
    setSelectedListing(null);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <h3 className="text-xl font-semibold">Failed to load marketplace listings</h3>
          <p className="text-gray-400 max-w-md">
            {error}
          </p>
          <Button 
            variant="outline"
            onClick={handleRefresh}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      );
    }
    
    if (listings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-center">
          <Store className="h-8 w-8 text-gray-400" />
          <h3 className="text-xl font-semibold">No Active Listings</h3>
          <p className="text-gray-400 max-w-md">
            There are currently no properties listed on the marketplace.
          </p>
          <Button 
            variant="outline"
            onClick={handleRefresh}
            className="mt-2"
          >
            Refresh Page
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => {
          const propertyData = listing.propertyDetails;
          
          // Handle cases where property data is missing or has errors
          const isPropertyDataValid = propertyData !== null;
          
          // Extract property details
          const attributes = isPropertyDataValid ? propertyData.metadata?.attributes : null;
          
          // Use our enhanced getAttributeValue function that handles multiple naming conventions
          const location = getAttributeValue(attributes, 'Address', 'Location not specified');
          const sqft = getAttributeValue(attributes, 'Square Footage', 0);
          const bedrooms = getAttributeValue(attributes, 'Bedrooms', 0);
          const bathrooms = getAttributeValue(attributes, 'Bathrooms', 0);
          const propertyType = getAttributeValue(attributes, 'Property Type', 'Not specified');
          
          return (
            <Card key={listing.listingId} className="overflow-hidden h-full flex flex-col border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader className="p-0">
                {isPropertyDataValid && propertyData.metadata?.image ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={tryConvertIpfsUrl(propertyData.metadata.image)}
                      alt={propertyData.metadata.name || 'Property image'}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/property-placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge 
                      variant="outline" 
                      className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border-gray-500"
                    >
                      {listing.formattedPrice} ETH
                    </Badge>
                  </div>
                ) : (
                  <div className="relative h-48 w-full bg-slate-800 flex items-center justify-center">
                    <ImageOff className="h-10 w-10 text-gray-500" />
                    <Badge 
                      variant="outline" 
                      className="absolute top-3 right-3 border-gray-500"
                    >
                      {listing.formattedPrice} ETH
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {isPropertyDataValid ? propertyData.metadata?.name : 'Property Information Unavailable'}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-1">
                    {sqft > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-gray-800/80 px-2 py-1 rounded-full">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        <span>{sqft} sqft</span>
                      </div>
                    )}
                    {bedrooms > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-gray-800/80 px-2 py-1 rounded-full">
                        <Tag className="h-3 w-3 text-gray-400" />
                        <span>{bedrooms} Beds</span>
                      </div>
                    )}
                    {bathrooms > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-gray-800/80 px-2 py-1 rounded-full">
                        <Tag className="h-3 w-3 text-gray-400" />
                        <span>{bathrooms} Baths</span>
                      </div>
                    )}
                    {propertyType && (
                      <div className="flex items-center gap-1 text-xs bg-gray-800/80 px-2 py-1 rounded-full">
                        <Tag className="h-3 w-3 text-gray-400" />
                        <span>{propertyType}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-800 my-3"></div>
                
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Available:</span>
                    <span className="font-medium">{listing.formattedAmount} tokens</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Price per token:</span>
                    <div className="text-right">
                      <span className="font-medium">{listing.formattedPrice} ETH</span>
                      {listing.usdPrice && (
                        <div className="text-xs text-gray-400 flex items-center justify-end">
                          <DollarSign className="h-3 w-3 mr-0.5" />
                          <span>${listing.usdPrice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Link href={`/properties/token/${listing.tokenAddress || 'unknown'}`} className="flex-1">
                  <Button variant="outline" className="w-full text-xs" size="sm">
                    View Property
                    <ArrowUpRight className="h-3 w-3 ml-1.5" />
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex-[2] crypto-btn text-xs" size="sm">Buy Tokens</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {isPropertyDataValid ? propertyData.metadata?.name : 'Property Listing'}
                      </DialogTitle>
                      <DialogDescription>
                        {isPropertyDataValid ? (
                          propertyData.metadata?.description || 'No description available'
                        ) : (
                          'Property details are currently unavailable. You can still purchase tokens.'
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex flex-col md:flex-row gap-4 py-4">
                      <div className="md:w-1/3">
                        <div className="relative h-48 w-full rounded-md overflow-hidden">
                          {isPropertyDataValid && propertyData.metadata?.image ? (
                            <Image
                              src={tryConvertIpfsUrl(propertyData.metadata.image)}
                              alt={propertyData.metadata.name || 'Property image'}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/property-placeholder.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <ImageOff className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {location && (
                            <div className="flex items-center text-xs text-gray-400">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {sqft > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-gray-800/80 px-2 py-1 rounded-full">
                              <span>{sqft} sqft</span>
                            </div>
                          )}
                          {bedrooms > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-gray-800/80 px-2 py-1 rounded-full">
                              <span>{bedrooms} Bed</span>
                            </div>
                          )}
                          {bathrooms > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-gray-800/80 px-2 py-1 rounded-full">
                              <span>{bathrooms} Bath</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <Link href={`/properties/token/${listing.tokenAddress || 'unknown'}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                            View property details
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3">
                        <div className="bg-gray-800/50 p-3 rounded-md mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-300">Price per token:</span>
                            <div className="text-right">
                              <div>{listing.formattedPrice} ETH</div>
                              {listing.usdPrice && (
                                <div className="text-xs text-gray-400">≈ ${listing.usdPrice} USD</div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Available tokens:</span>
                            <span>{listing.formattedAmount}</span>
                          </div>
                        </div>
                        
                        <BuyTokensForm 
                          listing={{
                            id: listing.listingId.toString(),
                            seller: listing.seller,
                            tokenAmount: listing.amount,
                            pricePerToken: listing.pricePerToken,
                            ethUsdPrice: ethUsdPrice || undefined
                          }}
                          onSuccess={() => {
                            toast({
                              title: "Tokens purchased successfully!",
                              description: "Your tokens have been added to your wallet.",
                            });
                            handlePurchaseSuccess();
                          }}
                          onError={(error) => {
                            toast({
                              variant: "destructive",
                              title: "Transaction failed",
                              description: error?.message || "There was an error processing your transaction.",
                            });
                          }}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-crypto-dark">
      <Navbar />
      
      <main className="pt-24 pb-10 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">Property <span className="text-gradient">Marketplace</span></h1>
            <p className="text-gray-400">Buy and sell fractional property tokens</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {ethUsdPrice && (
              <div className="text-sm bg-green-900/30 px-4 py-2 rounded-md border border-green-500/30 flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-green-400" />
                <span className="text-green-400">1 ETH = ${ethUsdPrice}</span>
              </div>
            )}
          </div>
        </div>
        
        {renderContent()}
      </main>
      
      <Footer />
    </div>
  );
} 