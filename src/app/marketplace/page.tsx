'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, Tag, Loader2, AlertCircle, RefreshCcw, Wallet, DollarSign, 
  ExternalLink, MapPin, ArrowUpRight, Building2, Check, Store, ImageOff,
  Zap, BarChart3, Filter, Search, Hexagon, Shield, Globe, Activity, 
  ChevronDown, Layers, Lock, Landmark
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from '@/hooks/useAccount';
import BuyTokensForm from '@/components/BuyTokensForm';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { tryConvertIpfsUrl, getActiveListings, getTokenBalance, formatCurrency } from '@/services/marketplace';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import CreateListingForm from '@/components/CreateListingForm';
import { PropertyDto } from '@/types/dtos';
import PropertyCard from '@/components/PropertyCard';

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

// Define EnrichedPropertyDto to include extra fields
interface EnrichedPropertyDto extends PropertyDto {
  balance?: string;
  formattedBalance?: string;
}

interface EnrichedListing extends Listing {
  propertyDetails: EnrichedPropertyDto | null;
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

// Helper function to format token IDs for display
const formatTokenId = (tokenId: string | number | undefined): string => {
  if (tokenId === undefined) return 'Unknown';
  const idStr = typeof tokenId === 'number' ? tokenId.toString() : tokenId;
  if (idStr && idStr.length > 10) {
    return `${idStr.substring(0, 8)}...`;
  }
  return idStr || 'Unknown';
};

// Particle animation component for background effects
const ParticleBackground = () => {
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [...Array(30)].map((_, i) => ({
        width: `${Math.random() * 4 + 1}px`,
        height: `${Math.random() * 4 + 1}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.5 + 0.3,
        animation: `float ${Math.random() * 10 + 10}s linear infinite`,
        animationDelay: `${Math.random() * 5}s`
      }));
      setParticles(newParticles);
    };

    // Generate particles only on the client side
    if (typeof window !== 'undefined') {
      generateParticles();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <div className="absolute w-full h-full">
        {particles.map((style, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-400"
            style={style}
          />
        ))}
      </div>
    </div>
  );
};

// Animated network nodes for the empty state
const NetworkNodes = () => {
  return (
    <div className="relative w-full h-40 my-6">
      {[...Array(6)].map((_, i) => {
        const size = Math.random() * 20 + 10;
        const x = 20 + (i * 60) % 300;
        const y = 20 + Math.random() * 80;
        
        return (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-500/30 border border-blue-500/50 flex items-center justify-center"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `calc(50% - 150px + ${x}px)`,
              top: `${y}px`,
              animation: `pulse-slow ${Math.random() * 3 + 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            {i % 2 === 0 && <Building2 className="h-3 w-3 text-blue-400" />}
            {i % 3 === 0 && <Hexagon className="h-3 w-3 text-purple-400" />}
            {i % 3 === 1 && <Landmark className="h-3 w-3 text-cyan-400" />}
          </div>
        );
      })}
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        <line x1="calc(50% - 130px)" y1="40" x2="calc(50% - 70px)" y2="60" className="stroke-blue-500/30 stroke-1" />
        <line x1="calc(50% - 70px)" y1="60" x2="calc(50% - 10px)" y2="30" className="stroke-blue-500/30 stroke-1" />
        <line x1="calc(50% - 10px)" y1="30" x2="calc(50% + 50px)" y2="70" className="stroke-blue-500/30 stroke-1" />
        <line x1="calc(50% + 50px)" y1="70" x2="calc(50% + 110px)" y2="40" className="stroke-blue-500/30 stroke-1" />
        <line x1="calc(50% - 130px)" y1="40" x2="calc(50% + 50px)" y2="70" className="stroke-blue-500/30 stroke-1" />
      </svg>
    </div>
  );
};

// Circular progress indicator
const CircularProgress = ({ value = 75, size = 24, strokeWidth = 2 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-blue-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[8px] font-medium text-blue-400">
        {value}%
      </div>
    </div>
  );
};

// Mini chart component to show token activity
const MiniActivityChart = () => {
  return (
    <div className="h-6 flex items-end space-x-0.5">
      {[...Array(10)].map((_, i) => {
        const height = Math.random() * 100;
        return (
          <div 
            key={i} 
            className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm"
            style={{ 
              height: `${height}%`,
              opacity: 0.7 + (i / 20)
            }}
          />
        );
      })}
    </div>
  );
};

export default function MarketplacePage() {
  const { account, isConnected, connectWallet } = useAccount();
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<EnrichedListing | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('0');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [userProperties, setUserProperties] = useState<EnrichedPropertyDto[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<EnrichedPropertyDto | null>(null);
  const [isLoadingUserProperties, setIsLoadingUserProperties] = useState(false);
  const [transactionStep, setTransactionStep] = useState<'approve' | 'listing' | 'complete'>('approve');
  const [isApproving, setIsApproving] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [approvalComplete, setApprovalComplete] = useState(false);
  const [listingComplete, setListingComplete] = useState(false);
  const [purchaseErrorToast, setPurchaseErrorToast] = useState<{ title: string; description: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const apiUrl = 'http://localhost:3000'; // Your backend API URL
  
  const fetchPropertyDetails = async (listing: Listing): Promise<EnrichedPropertyDto | null> => {
    try {
      const tokenAddress = listing.tokenAddress;
      console.log(`Making request to: ${apiUrl}/properties/token/${tokenAddress}`);
      
      const response = await fetch(`${apiUrl}/properties/token/${tokenAddress}`, {
        signal: AbortSignal.timeout(30000),
        next: { revalidate: 300 }
      });
      
      if (!response.ok) {
        throw new Error(`Property API returned status ${response.status}`);
      }
      
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        console.warn(`Empty response from property API for token ${tokenAddress}`);
        return null;
      }
      
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
      
      const enrichedListings = await Promise.all(
        listings.map(async (listing: any) => {
          try {
            const propertyDetails = await fetchPropertyDetails(listing);
            const formattedPrice = formatUSDC(listing.pricePerToken);
            const formattedAmount = ethers.formatUnits(listing.amount, 18);
            
            return {
              ...listing,
              propertyDetails,
              formattedPrice,
              formattedAmount,
            };
          } catch (error) {
            console.error('Error enriching listing:', error);
            return {
              ...listing,
              propertyDetails: null,
              formattedPrice: formatUSDC(listing.pricePerToken),
              formattedAmount: ethers.formatUnits(listing.amount, 18),
            };
          }
        })
      );
      
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
  
  // Function to fetch properties owned by the user
  const fetchUserProperties = async () => {
    if (!account) return;
    setIsLoadingUserProperties(true);
    try {
      const response = await fetch(`${apiUrl}/properties/owned/${account}`, {
        signal: AbortSignal.timeout(30000),
        next: { revalidate: 120 } // Optional: Cache for 2 minutes
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch user properties: ${response.statusText}`);
      }
      const ownedProperties: PropertyDto[] = await response.json(); // <-- Get initial properties

      // Enrich properties with balance
      const enrichedPropertiesPromises = ownedProperties.map(async (prop) => {
        const tokenAddr = prop.tokenAddress || prop.propertyDetails?.associatedPropertyToken;
        if (!tokenAddr) {
            console.warn(`Skipping balance fetch for property ${prop.id} due to missing token address.`);
            return { ...prop, balance: '0' }; // Return with 0 balance if no address
        }
        try {
            const userBalance = await getTokenBalance(tokenAddr, account);
            // Optional: format balance here if needed, but CreateListingForm already does
            // const formatted = formatCurrency(userBalance);
            return { ...prop, balance: userBalance /*, formattedBalance: formatted */ };
        } catch (balanceError) {
            console.error(`Failed to fetch balance for ${tokenAddr}:`, balanceError);
            return { ...prop, balance: '0' }; // Return with 0 balance on error
        }
      });

      const enrichedProperties = await Promise.all(enrichedPropertiesPromises);

      setUserProperties(enrichedProperties); // <-- Set the enriched list

    } catch (err: any) {
      console.error("Error fetching user properties:", err);
      toast.error("Could not load your properties", { description: err.message });
      setUserProperties([]);
    } finally {
      setIsLoadingUserProperties(false);
    }
  };
  
  const handleRefresh = () => {
    fetchListings();
  };
  
  const handleListingSelect = (listing: EnrichedListing) => {
    setSelectedListing(listing);
    setPurchaseAmount('0');
    setError(null);
  };
  
  const handleCreateListingClick = () => {
    if (!isConnected) {
      toast.error("Connect your wallet", { description: "You need to connect your wallet to create a listing" });
      return;
    }
    
    fetchUserProperties();
    setShowCreateListingModal(true);
  };
  
  // Filter listings based on activeFilter and searchQuery
  const filteredListings = listings.filter(listing => {
    // Apply search filter
    if (searchQuery) {
      const propertyName = listing.propertyDetails?.metadata?.name?.toLowerCase() || '';
      const propertyLocation = getAttributeValue(listing.propertyDetails?.metadata?.attributes, 'Address', '')?.toLowerCase() || '';
      const searchLower = searchQuery.toLowerCase();
      
      if (!propertyName.includes(searchLower) && !propertyLocation.includes(searchLower)) {
        return false;
      }
    }
    
    // Apply category filter
    if (activeFilter === 'all') return true;
    
    const propertyType = getAttributeValue(listing.propertyDetails?.metadata?.attributes, 'Property Type', '')?.toLowerCase() || '';
    
    switch(activeFilter) {
      case 'residential':
        return propertyType.includes('residential') || 
               propertyType.includes('house') || 
               propertyType.includes('apartment') || 
               propertyType.includes('condo');
      case 'commercial':
        return propertyType.includes('commercial') || 
               propertyType.includes('office') || 
               propertyType.includes('retail');
      case 'land':
        return propertyType.includes('land') || 
               propertyType.includes('lot');
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Navbar />
      
      <main className="pt-24 pb-10 px-6 max-w-7xl mx-auto">
        {/* Enhanced Header with Web3 Elements */}
        <div className="relative mb-12">
          {/* Particle background */}
          <ParticleBackground />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-lg blur opacity-70"></div>
              <div className="relative">
                <h1 className="text-3xl font-bold mb-2">Property <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">Marketplace</span></h1>
                <p className="text-gray-400">Buy and sell fractional property tokens with USDC</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              
              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800">
                <Button 
                  variant={activeFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className={activeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
                >
                  All
                </Button>
                <Button 
                  variant={activeFilter === 'residential' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveFilter('residential')}
                  className={activeFilter === 'residential' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
                >
                  Residential
                </Button>
                <Button 
                  variant={activeFilter === 'commercial' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveFilter('commercial')}
                  className={activeFilter === 'commercial' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
                >
                  Commercial
                </Button>
              </div>
              
              <Button 
                onClick={handleCreateListingClick}
                className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-500/30"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <Tag className="h-4 w-4 mr-2" />
                <span className="relative z-10">Create Listing</span>
              </Button>
            </div>
          </div>
          
          {/* Render content based on state */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-t-2 border-purple-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-4 rounded-full border-t-2 border-cyan-500 animate-spin" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Hexagon className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <h3 className="mt-6 text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Loading Marketplace</h3>
              <p className="mt-2 text-gray-400 max-w-md text-center">Fetching property listings from the blockchain...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center py-12">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold">Failed to load marketplace listings</h3>
              <p className="text-gray-400 max-w-md">
                {error}
              </p>
              <Button 
                variant="outline"
                onClick={handleRefresh}
                className="mt-4 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:text-white"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center py-12">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                <Store className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">No Active Listings</h3>
              <p className="text-gray-400 max-w-md">
                There are currently no properties listed on the marketplace.
              </p>
              
              {/* Network visualization */}
              <NetworkNodes />
              
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:text-white"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                
                <Button 
                  onClick={handleCreateListingClick}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </div>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center py-12">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                <Search className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">No Matching Listings</h3>
              <p className="text-gray-400 max-w-md">
                No properties match your current search criteria. Try adjusting your filters or search query.
              </p>
              
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:text-white"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {filteredListings.map((listing) => {
                const propertyData = listing.propertyDetails;
                const isPropertyDataValid = propertyData !== null;
                const attributes = isPropertyDataValid ? propertyData?.metadata?.attributes : null;
                const metadata = isPropertyDataValid ? propertyData?.metadata : null;

                // Extract data for PropertyCard props, providing defaults
                const id = parseInt(listing.tokenId || '0');
                const nftAddress = listing.nftAddress;
                const tokenAddress = listing.tokenAddress;
                const title = metadata?.name || 'Unnamed Property';
                const location = getAttributeValue(attributes, 'Address', 'Location not specified');
                const price = listing.formattedPrice ? `$${listing.formattedPrice}` : undefined; // Add $ sign
                const imageUrl = metadata?.image || '';
                const sqft = parseInt(getAttributeValue(attributes, 'Square Footage', '0'));
                const bedrooms = parseInt(getAttributeValue(attributes, 'Bedrooms', '0'));
                const bathrooms = parseInt(getAttributeValue(attributes, 'Bathrooms', '0'));
                const propertyType = getAttributeValue(attributes, 'Property Type', '');

                // Remove random data generation for props handled by PropertyCard
                const featured = listing.listingId % 5 === 0; // Example: mark every 5th as featured

                return (
                  <div key={listing.listingId} className="flex flex-col">
                    <PropertyCard
                      id={id}
                      nftAddress={nftAddress} 
                      tokenAddress={tokenAddress}
                      title={title}
                      location={location}
                      price={price}
                      imageUrl={imageUrl}
                      sqft={sqft}
                      bedrooms={bedrooms}
                      bathrooms={bathrooms}
                      propertyType={propertyType}
                      availableAmount={listing.formattedAmount}
                      featured={featured}
                    />
                    {/* Add Buy Button Dialog Trigger below the card */}
                    <Dialog onOpenChange={(open) => !open && setSelectedListing(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="mt-2 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={() => handleListingSelect(listing)}
                          disabled={!isPropertyDataValid}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Tokens
                        </Button>
                      </DialogTrigger>
                      {selectedListing && selectedListing.listingId === listing.listingId && (
                        <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900 to-gray-950 border-blue-900/50 rounded-xl backdrop-blur-lg shadow-xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Buy Property Tokens</DialogTitle>
                            <DialogDescription className="text-gray-300 pt-1">
                              Purchase tokens for {selectedListing.propertyDetails?.metadata?.name || 'this property'}.
                            </DialogDescription>
                          </DialogHeader>
                          <BuyTokensForm 
                            listing={selectedListing}
                          />
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>
                );
              })} 
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Create Listing Modal */}
      <Dialog open={showCreateListingModal} onOpenChange={setShowCreateListingModal}>
          <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-gray-900 to-gray-950 border-blue-900/50 rounded-xl backdrop-blur-lg shadow-xl">
              <DialogHeader>
                  <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Create New Listing</DialogTitle>
                  <DialogDescription className="text-gray-300 pt-1">
                      Select one of your owned properties and specify the amount and price per token (in USDC) to list for sale.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {isLoadingUserProperties ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                  </div>
                ) : (
                  <CreateListingForm
                      ownedTokens={userProperties} 
                      onSuccess={() => {
                          setShowCreateListingModal(false);
                          fetchListings(); // Refresh listings after creating one
                      }}
                      onClose={() => setShowCreateListingModal(false)} 
                  />
                )}
              </div>
          </DialogContent>
      </Dialog>

    </div>
  );
}
