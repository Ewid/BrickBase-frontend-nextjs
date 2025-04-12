import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Maximize2, Bitcoin, Tag, Info } from "lucide-react";

interface PropertyCardProps {
  id: number; // This represents tokenId from backend DTO
  nftAddress?: string; // Add nftAddress if available from the source
  title: string;
  location: string;
  price?: string; // Make optional
  cryptoPrice?: string; // Make optional
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

  // Determine the link destination
  const linkHref = nftAddress ? `/properties/${nftAddress}` : '#'; // Link to address if available

  return (
    <Card className={`overflow-hidden card-hover glass-card border-0 ${featured ? 'border-l-4 border-l-crypto-teal' : ''}`}>
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden relative">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={title}
              className="transition-transform duration-500 hover:scale-110 object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
        <Link href={linkHref} className={`w-full ${!nftAddress ? 'pointer-events-none' : ''}`}> 
          <Button 
            className="w-full bg-crypto-dark hover:bg-crypto-dark/80 border border-crypto-light/30 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!nftAddress} // Disable button if no address
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