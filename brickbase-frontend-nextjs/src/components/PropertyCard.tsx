import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Maximize2, Bitcoin, Tag, Info, AlertTriangle } from "lucide-react";
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
          <p className="text-crypto-light font-semibold text-xl">{price}</p>
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

  return (
    <Card className={`overflow-hidden card-hover glass-card border-0 ${featured ? 'border-l-4 border-l-crypto-teal' : ''}`}>
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
            <div className="w-full h-full bg-gray-700/50 flex items-center justify-center text-gray-400">No Image</div>
          )}
        </div>
        {featured && (
          <div className="absolute top-2 right-2 bg-crypto-teal px-3 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}
      </div>

      {/* Content Section - Mimicking Marketplace Card Structure */}
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div className="flex flex-col gap-2 mb-auto">
          {/* Title */}
          <h3 className="font-bold text-lg line-clamp-1" title={title}>
            {title}
          </h3>
          
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
            className="w-full crypto-btn"
            disabled={!addressToUse}
           > 
            <Tag className="mr-2 h-4 w-4" />
            View Property
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;