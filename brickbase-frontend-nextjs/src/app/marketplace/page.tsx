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
import { tryConvertIpfsUrl, getActiveListings } from '@/services/marketplace';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

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

// Helper function to format USDC amount (6 decimals)
const formatUSDC = (amount: string): string => {
  if (!amount) return '0.00';
  try {
    // USDC has 6 decimals
    return ethers.formatUnits(amount, 6);
  } catch (error) {
    console.error('Error formatting USDC amount:', error);
    return '0.00';
  }
};

export default function MarketplacePage() {
  const { account, isConnected, connectWallet } = useAccount();
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<EnrichedListing | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('0.000001');
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const apiUrl = 'http://localhost:3000'; // Your backend API URL
  
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
    setIsLoading(true);
    setError(null);
    try {
      const listings = await getActiveListings();
      console.log('Raw listings:', listings);

      // Enrich listings with property details and format values
      const enrichedListings = await Promise.all(
        listings.map(async (listing: any) => {
          try {
            const propertyDetails = await fetchPropertyDetails(listing);
            
            // Format price (USDC has 6 decimals)
            const formattedPrice = formatUSDC(listing.pricePerToken);
            
            // Format token amount (ERC20 has 18 decimals)
            const formattedAmount = ethers.formatUnits(listing.amount, 18);
            
            return {
              ...listing,
              propertyDetails,
              formattedPrice,
              formattedAmount,
            };
          } catch (error) {
            console.error('Error enriching listing:', error);
            // Return listing with error flag
            return {
              ...listing,
              propertyDetails: null,
              formattedPrice: formatUSDC(listing.pricePerToken),
              formattedAmount: ethers.formatUnits(listing.amount, 18),
            };
          }
        })
      );
      
      console.log('Enriched listings:', enrichedListings);
      setListings(enrichedListings);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      setError(error.message || 'Failed to fetch listings');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchListings();
  }, []);
  
  const handleRefresh = () => {
    fetchListings();
  };
  
  const handleListingSelect = (listing: EnrichedListing) => {
    setSelectedListing(listing);
    setPurchaseAmount('0.000001'); // Reset to minimum amount
    setError(null);
  };
  
  const handlePurchaseSuccess = () => {
    // Refresh listings after successful purchase
    fetchListings();
    // Clear selected listing
    setSelectedListing(null);
  };
  
  const handlePurchase = async () => {
    if (!selectedListing || !purchaseAmount || parseFloat(purchaseAmount) <= 0 || parseFloat(purchaseAmount) > parseFloat(selectedListing.formattedAmount)) {
      return;
    }

    try {
      setIsPurchasing(true);
      setError(null);

      // Convert purchaseAmount to token amount with 18 decimals
      const tokenAmount = ethers.parseUnits(purchaseAmount, 18);
      const tokenAddress = selectedListing.tokenAddress;

      console.log(`Making request to: ${apiUrl}/properties/buy/${tokenAddress}/${tokenAmount}`);
      
      const response = await fetch(`${apiUrl}/properties/buy/${tokenAddress}/${tokenAmount}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: account,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Property API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Purchase response:', data);

      toast({
        title: "Tokens purchased successfully!",
        description: "Your tokens have been added to your wallet.",
      });
      handlePurchaseSuccess();
    } catch (error: any) {
      console.error("Error in handlePurchase:", error);
      setError(error.message || "Failed to purchase tokens");
      toast({
        variant: "destructive",
        title: "Transaction failed",
        description: error.message || "There was an error processing your transaction.",
      });
    } finally {
      setIsPurchasing(false);
    }
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
                      className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border-gray-500 flex items-center"
                    >
                      <DollarSign className="h-3 w-3 mr-0.5 text-green-400" />
                      <span className="text-green-400">${listing.formattedPrice} USDC</span>
                    </Badge>
                  </div>
                ) : (
                  <div className="relative h-48 w-full bg-slate-800 flex items-center justify-center">
                    <ImageOff className="h-10 w-10 text-gray-500" />
                    <Badge 
                      variant="outline" 
                      className="absolute top-3 right-3 border-gray-500 flex items-center"
                    >
                      <DollarSign className="h-3 w-3 mr-0.5 text-green-400" />
                      <span className="text-green-400">${listing.formattedPrice} USDC</span>
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
                      <div className="flex items-center justify-end">
                        <DollarSign className="h-3.5 w-3.5 mr-0.5 text-green-400" />
                        <span className="font-medium text-green-400">${listing.formattedPrice} USDC</span>
                      </div>
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
                <Button 
                  className="flex-1"
                  size="sm"
                  onClick={() => handleListingSelect(listing)}
                >
                  Purchase Tokens
                </Button>
                <Dialog open={!!selectedListing && selectedListing.listingId === listing.listingId} onOpenChange={(open) => !open && setSelectedListing(null)}>
                  {selectedListing && (
                    <>
                      <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-gray-900 to-gray-950 border-blue-900/50 rounded-xl backdrop-blur-lg shadow-xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Purchase Property Tokens</DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Select how many tokens you would like to purchase for this property. You can use the slider or enter a precise amount.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                          {/* Property Preview Column */}
                          <div className="space-y-4">
                            <div className="aspect-square rounded-xl overflow-hidden relative border border-gray-800 bg-gray-900 shadow-lg">
                              {selectedListing.propertyDetails?.metadata?.image ? (
                                <Image
                                  src={tryConvertIpfsUrl(selectedListing.propertyDetails.metadata.image)}
                                  alt={selectedListing.propertyDetails?.metadata?.name || 'Property'}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/property-placeholder.jpg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageOff className="h-12 w-12 text-gray-600" />
                                </div>
                              )}
                              
                              {/* Futuristic overlay elements */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <div className="text-xs font-mono text-blue-400 mb-1 flex items-center">
                                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1 animate-pulse"></span>
                                  PROPERTY ID: {selectedListing.tokenId.substring(0, 8)}...
                                </div>
                                <div className="text-white font-semibold truncate">
                                  {selectedListing.propertyDetails?.metadata?.name || 'Property'}
                                </div>
                              </div>
                              
                              {/* Token badge */}
                              <div className="absolute top-3 left-3 font-mono text-xs bg-blue-500/20 border border-blue-500/30 text-blue-300 px-2 py-1 rounded-lg backdrop-blur-sm">
                                NFT #{selectedListing.tokenId}
                              </div>
                            </div>
                            
                            {/* Property info */}
                            <div className="bg-gray-800/30 backdrop-blur p-4 rounded-xl border border-gray-700/50">
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Property Details</h4>
                              
                              <div className="space-y-2 text-sm">
                                {selectedListing.propertyDetails?.metadata?.attributes && (
                                  <>
                                    {getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Address') && (
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                        <span className="truncate">
                                          {getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Address', 'Location not specified')}
                                        </span>
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                      {getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Square Footage') && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <Building2 className="h-3 w-3 text-gray-500" />
                                          <span>{getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Square Footage', '0')} sqft</span>
                                        </div>
                                      )}
                                      
                                      {getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Bedrooms') && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <Tag className="h-3 w-3 text-gray-500" />
                                          <span>{getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Bedrooms', '0')} Beds</span>
                                        </div>
                                      )}
                                      
                                      {getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Bathrooms') && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <Tag className="h-3 w-3 text-gray-500" />
                                          <span>{getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Bathrooms', '0')} Baths</span>
                                        </div>
                                      )}
                                      
                                      {getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Property Type') && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <Tag className="h-3 w-3 text-gray-500" />
                                          <span>{getAttributeValue(selectedListing.propertyDetails.metadata.attributes, 'Property Type', 'Not specified')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                                
                                <div className="flex justify-between border-t border-gray-700/50 pt-2 mt-2">
                                  <span className="text-xs text-gray-500">Listed by:</span>
                                  <a href={`https://basescan.org/address/${selectedListing.seller}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 flex items-center">
                                    {shortenAddress(selectedListing.seller)}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Purchase Form Column */}
                          <div className="space-y-5">
                            <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-900/20 backdrop-blur-md">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-300">Price per token:</span>
                                <span className="text-green-400 font-semibold flex items-center text-lg">
                                  <DollarSign className="h-4 w-4 mr-0.5" />
                                  ${selectedListing.formattedPrice} <span className="text-xs ml-1 text-green-500">USDC</span>
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-300">Available:</span>
                                <span className="font-semibold flex items-center gap-1">
                                  <span>{selectedListing.formattedAmount}</span>
                                  <span className="text-xs text-gray-400">tokens</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="tokenAmount" className="text-sm mb-2 block font-medium text-gray-200">
                                  Amount to purchase
                                </Label>
                                <div className="flex items-center gap-3">
                                  <div className="relative flex-grow">
                                    <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                                    <Input
                                      id="tokenAmount"
                                      type="number"
                                      min="0.000001"
                                      step="0.000001"
                                      max={selectedListing.formattedAmount}
                                      value={purchaseAmount}
                                      onChange={(e) => setPurchaseAmount(e.target.value)}
                                      className="pl-9 pr-16 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                      tokens
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm mb-2 block font-medium text-gray-200">Adjust amount</Label>
                                <Slider
                                  value={[parseFloat(purchaseAmount)]}
                                  max={parseFloat(selectedListing.formattedAmount)}
                                  min={0.000001}
                                  step={0.000001}
                                  onValueChange={(values) => setPurchaseAmount(values[0].toString())}
                                  className="my-4"
                                />
                                <div className="flex justify-between items-center gap-2 mt-3">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setPurchaseAmount((parseFloat(selectedListing.formattedAmount) * 0.25).toFixed(6))}
                                    className="flex-1 h-8 border-gray-700 hover:bg-blue-900/20 hover:text-blue-300"
                                  >
                                    25%
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setPurchaseAmount((parseFloat(selectedListing.formattedAmount) * 0.5).toFixed(6))}
                                    className="flex-1 h-8 border-gray-700 hover:bg-blue-900/20 hover:text-blue-300"
                                  >
                                    50%
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setPurchaseAmount((parseFloat(selectedListing.formattedAmount) * 0.75).toFixed(6))}
                                    className="flex-1 h-8 border-gray-700 hover:bg-blue-900/20 hover:text-blue-300"
                                  >
                                    75%
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setPurchaseAmount(selectedListing.formattedAmount)}
                                    className="flex-1 h-8 border-gray-700 hover:bg-blue-900/20 hover:text-blue-300"
                                  >
                                    Max
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 backdrop-blur-md">
                              <h4 className="font-medium mb-3 flex items-center text-blue-300 text-sm">
                                <span>Purchase Summary</span>
                              </h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <span className="text-gray-300">Tokens to buy:</span>
                                <span className="text-right font-medium">{purchaseAmount}</span>
                                
                                <span className="text-gray-300">Price per token:</span>
                                <span className="text-right font-medium">${selectedListing.formattedPrice} USDC</span>
                                
                                <span className="text-gray-300 font-medium pt-2 border-t border-blue-800/30">Total cost:</span>
                                <span className="text-right font-bold text-green-400 pt-2 border-t border-blue-800/30 flex items-center justify-end">
                                  <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                                  ${(parseFloat(selectedListing.formattedPrice) * parseFloat(purchaseAmount || "0")).toFixed(6)}
                                  <span className="text-xs ml-1 text-green-500">USDC</span>
                                </span>
                              </div>
                              
                              <div className="mt-4 text-xs text-gray-400 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span>
                                  Purchasing tokens makes you a fractional owner of this property, entitling you 
                                  to a proportional share of rental income and voting rights.
                                </span>
                              </div>
                            </div>
                            
                            {error && (
                              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-sm" role="alert">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>{error}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <DialogFooter className="flex gap-3 sm:gap-0 mt-2 pt-4 border-t border-gray-800">
                          <Button variant="outline" onClick={() => setSelectedListing(null)} className="border-gray-700 hover:bg-gray-800">
                            Cancel
                          </Button>
                          <Button 
                            onClick={handlePurchase} 
                            disabled={isPurchasing || !purchaseAmount || parseFloat(purchaseAmount) <= 0 || parseFloat(purchaseAmount) > parseFloat(selectedListing.formattedAmount)}
                            className={`bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white ${isPurchasing ? "opacity-80" : ""}`}
                          >
                            {isPurchasing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>Confirm Purchase</>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </>
                  )}
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
            <p className="text-gray-400">Buy and sell fractional property tokens with USDC</p>
          </div>
        </div>
        
        {renderContent()}
      </main>
      
      <Footer />
    </div>
  );
} 