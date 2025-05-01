import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Maximize2, Bitcoin, Tag, Info, AlertTriangle, Hexagon, ExternalLink, Shield } from "lucide-react";
import { tryConvertIpfsUrl } from '@/services/marketplace';

// Sample image URL for fallback when images fail to load
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvcGVydHl8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60";

// Update the interface to handle both old and new property formats
interface PropertyCardProps {
  id: number; // This represents tokenId from backend DTO
  nftAddress?: string; // Property NFT address (for linking)
  tokenAddress?: string; // NEW: Property token address for token operations
  title: string;
  location: string;
  price?: string;
  cryptoPrice?: string;
  imageUrl: string;
  sqft: number;
  featured?: boolean;
}

const PropertyCard = ({ 
  id, // tokenId
  nftAddress, // The actual address to link to
  tokenAddress, // NEW: Property token address for token operations
  title, 
  location, 
  price, 
  cryptoPrice, 
  imageUrl, 
  sqft, 
  featured = false 
}: PropertyCardProps) => {

  const httpImageUrl = imageUrl ? tryConvertIpfsUrl(imageUrl) : FALLBACK_IMAGE; // Convert IPFS URL
  const [imgSrc, setImgSrc] = useState(httpImageUrl);
  const [imgError, setImgError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Reset error state when imageUrl or nftAddress changes
  useEffect(() => {
    setImgSrc(imageUrl ? tryConvertIpfsUrl(imageUrl) : FALLBACK_IMAGE);
    setImgError(false);
    setAddressError(!nftAddress);
  }, [imageUrl, nftAddress]);
  
  const handleImageError = () => {
    // Use fallback image
    setImgSrc(FALLBACK_IMAGE);
    setImgError(true);
  };

  const renderPriceSection = () => {
    if (price && cryptoPrice) {
      return (
        <div>
          <p className="text-blue-400 font-semibold text-xl">{price}</p>
          <div className="flex items-center text-gray-400 text-xs">
            <Bitcoin className="h-3 w-3 mr-1 text-yellow-500" />
            {cryptoPrice}
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-sm text-gray-400 italic flex items-center">
           <Info className="h-4 w-4 mr-1 text-blue-400" /> 
           <span>Details via View Property</span>
           {tokenAddress && (
             <span className="ml-1 text-xs text-green-400" title="Tokenized property">•</span>
           )}
        </div>
      );
    }
  };

  // Ensure the addresses are valid and normalize them
  const validNftAddress = nftAddress && nftAddress.startsWith('0x') ? nftAddress : undefined;
  const validTokenAddress = tokenAddress && tokenAddress.startsWith('0x') ? tokenAddress : undefined;

  // Always use the token route, with either token address or NFT address as fallback
  const addressToUse = validTokenAddress || validNftAddress;
  const linkHref = addressToUse ? `/properties/token/${addressToUse}` : '#';

  // Function to handle click on disabled cards
  const handleDisabledClick = (e: React.MouseEvent) => {
    if (!addressToUse) {
      e.preventDefault();
      // Optional: Could add a toast notification here
      console.warn('Cannot view property: No valid address available');
      setAddressError(true);
    }
  };

  // Shortened token address for display
  const shortenedAddress = addressToUse ? 
    `${addressToUse.substring(0, 6)}...${addressToUse.substring(addressToUse.length - 4)}` : 
    'Unknown';

  return (
    <Card 
      className={`relative overflow-hidden glass-card-vibrant border-0 ${featured ? 'border-l-4 border-l-blue-500' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated gradient border */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 transition-opacity duration-300 ${isHovering ? 'opacity-50' : ''} -z-10`}></div>
      
      {/* Image Section */}
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden relative">
          {imgSrc ? (
            <Image 
              src={imgSrc}
              alt={title}
              className="transition-transform duration-500 hover:scale-110 object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={handleImageError}
              loading="lazy"
              priority={featured}
            />
          ) : (
            <div className="w-full h-full bg-gray-800/80 flex items-center justify-center text-gray-400">
              <Building2 className="h-8 w-8 text-gray-600" />
            </div>
          )}
          
          {/* Overlay with blockchain data */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
          
          {/* NFT Badge */}
          <div className="absolute top-3 left-3 nft-badge">
            <Hexagon className="h-3 w-3 mr-1" fill="currentColor" strokeWidth={0} />
            <span>NFT #{id}</span>
          </div>
          
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg">
              Featured
            </div>
          )}
          
          {/* Token Address */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <div className="blockchain-address text-xs text-blue-300 bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded-md border border-blue-500/30">
              {shortenedAddress}
            </div>
            
            {addressToUse && (
              <a 
                href={`https://basescan.org/token/${addressToUse}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors bg-gray-900/70 backdrop-blur-sm p-1 rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div className="flex flex-col gap-2 mb-auto">
          {/* Title with blockchain verification */}
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg line-clamp-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" title={title}>
              {title}
            </h3>
            <div className="blockchain-badge flex-shrink-0 ml-2">
              <Shield className="h-3 w-3 mr-1" />
              <span>Verified</span>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="line-clamp-1" title={location}>{location}</span>
          </div>
          
          {/* Price Section (if applicable) */}
          <div className="mt-2">
            {renderPriceSection()}
          </div>
        </div>
      </CardContent>

      {/* Footer Section */}
      <CardFooter className="p-4 pt-0">
        {addressError && (
          <div className="text-xs text-yellow-400 mb-2 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Invalid property address</span>
          </div>
        )}
        <Link href={linkHref} className={`w-full ${!addressToUse ? 'pointer-events-none opacity-70' : ''}`} onClick={handleDisabledClick}> 
          <Button 
            className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            disabled={!addressToUse}
           > 
            {/* Animated glow effect */}
            <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <Tag className="mr-2 h-4 w-4" />
            <span className="relative z-10">View Property</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
