import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Maximize2, Bitcoin, Tag, Info, AlertTriangle } from "lucide-react";

// Sample image URL for fallback when images fail to load
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvcGVydHl8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60";

// Helper to convert IPFS URL to HTTP Gateway URL
const ipfsToGatewayUrl = (ipfsUrl: string): string => {
  if (!ipfsUrl || typeof ipfsUrl !== 'string') {
    return FALLBACK_IMAGE; // Return fallback for undefined/null or non-string values
  }
  
  if (!ipfsUrl.startsWith('ipfs://')) {
    // It's already an HTTP URL or another format
    return ipfsUrl;
  }
  
  // Use gateway.pinata.cloud which is faster than ipfs.io
  const cid = ipfsUrl.replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

// Update the interface to handle both old and new property formats
interface PropertyCardProps {
  id: number; // This represents tokenId from backend DTO
  nftAddress?: string; // Property NFT address (for linking)
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
  title, 
  location, 
  price, 
  cryptoPrice, 
  imageUrl, 
  sqft, 
  featured = false 
}: PropertyCardProps) => {

  const httpImageUrl = ipfsToGatewayUrl(imageUrl); // Convert IPFS URL
  const [imgSrc, setImgSrc] = useState(httpImageUrl);
  const [imgError, setImgError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  
  // Reset error state when imageUrl or nftAddress changes
  useEffect(() => {
    setImgSrc(ipfsToGatewayUrl(imageUrl));
    setImgError(false);
    setAddressError(!nftAddress);
  }, [imageUrl, nftAddress]);
  
  const handleImageError = () => {
    // First try IPFS.io if primary gateway fails
    if (imageUrl?.startsWith('ipfs://') && !imgError) {
      const cid = imageUrl.replace('ipfs://', '');
      setImgSrc(`https://ipfs.io/ipfs/${cid}`);
      setImgError(true);
      return;
    }
    
    // If all else fails, use a fallback image
    if (imgError) {
      setImgSrc(FALLBACK_IMAGE);
    }
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
        </div>
      );
    }
  };

  // Ensure the NFT address is valid and normalize it
  const validNftAddress = nftAddress && nftAddress.startsWith('0x') ? nftAddress : undefined;

  // Determine the link destination
  const linkHref = validNftAddress ? `/properties/${validNftAddress}` : '#'; // Link to address if available

  // Function to handle click on disabled cards
  const handleDisabledClick = (e: React.MouseEvent) => {
    if (!validNftAddress) {
      e.preventDefault();
      // Optional: Could add a toast notification here
      console.warn('Cannot view property: NFT address is missing or invalid');
      setAddressError(true);
    }
  };

  return (
    <Card className={`overflow-hidden card-hover glass-card border-0 ${featured ? 'border-l-4 border-l-crypto-teal' : ''}`}>
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
              loading="lazy" // Add lazy loading 
              priority={featured} // Prioritize loading of featured properties
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

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg truncate" title={title}>{title}</h3>
          <div className="flex items-center gap-1 text-xs bg-crypto-dark/50 px-2 py-1 rounded-full flex-shrink-0">
            <Building2 className="h-3 w-3 text-crypto-light" />
            <span>{sqft} sqft</span>
          </div>
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate" title={location}>{location}</span>
        </div>
      </CardHeader>

      <CardContent className="pb-3 min-h-[60px]"> 
        <div className="flex justify-between items-center">
          {renderPriceSection()}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {addressError && (
          <div className="text-xs text-yellow-400 mb-2 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Invalid property address</span>
          </div>
        )}
        <Link href={linkHref} className={`w-full ${!validNftAddress ? 'pointer-events-none opacity-70' : ''}`} onClick={handleDisabledClick}> 
          <Button 
            className="w-full bg-crypto-dark hover:bg-crypto-dark/80 border border-crypto-light/30 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!validNftAddress} // Disable button if no address
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