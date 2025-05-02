import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, MapPin, Maximize2, Bitcoin, Tag, Info, AlertTriangle, 
  Hexagon, ExternalLink, Shield, BarChart3, 
  Layers, DollarSign, Globe, Landmark
} from "lucide-react";
import { tryConvertIpfsUrl } from '@/services/marketplace';

// Sample image URL for fallback when images fail to load
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvcGVydHl8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60";

// Particle animation component for background effects
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
      <div className="absolute w-full h-full">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-400"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

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
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  availableAmount?: string; // <-- Add prop for available tokens
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
  featured = false,
  bedrooms = 0,
  bathrooms = 0,
  propertyType = '',
  availableAmount // <-- Destructure the new prop
}: PropertyCardProps) => {
  // Card tilt effect ref and state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({});

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

  // Handle mouse move for tilt effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease'
    });
  };
  
  // Reset tilt on mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease'
    });
  };

  const handleImageError = () => {
    // Use fallback image
    setImgSrc(FALLBACK_IMAGE);
    setImgError(true);
  };

  const renderPriceSection = () => {
    if (price) {
      return (
        <div className="relative">
          {/* Holographic price effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-lg blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative bg-gray-900/70 backdrop-blur-md rounded-lg p-3 border border-blue-500/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 font-medium">Price Per Token In USDC</span>
              <div className="flex items-center">
                <DollarSign className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">USDC</span>
              </div>
            </div>
            
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 font-bold text-2xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] tracking-tight">{price}</p>
            
            {/* Display Available Amount if provided */}
            {availableAmount && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-500/10">
                 <span className="text-xs text-gray-400 font-medium">Available Tokens:</span>
                 <span className="text-sm text-white font-semibold">{availableAmount}</span> 
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return null;
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
      ref={cardRef}
      className={`relative overflow-hidden glass-card-vibrant border-0 group ${featured ? 'border-l-4 border-l-blue-500' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={tiltStyle}
    >
      {/* Particle background effect */}
      <ParticleBackground />
      
      {/* Animated gradient border with enhanced glow */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-sm opacity-0 transition-opacity duration-300 ${isHovering ? 'opacity-70' : ''} -z-10`}></div>
      
      {/* Image Section */}
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden relative">
          {imgSrc ? (
            <Image 
              src={imgSrc}
              alt={title}
              className="transition-transform duration-500 group-hover:scale-110 object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={handleImageError}
              priority={featured}
            />
          ) : (
            <div className="w-full h-full bg-gray-800/80 flex items-center justify-center text-gray-400">
              <Building2 className="h-8 w-8 text-gray-600" />
            </div>
          )}
          
          {/* Futuristic overlay with grid pattern */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent hex-pattern opacity-70"></div>
          
          {/* Holographic effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
          
          {/* NFT Badge - enhanced with animation */}
          <div className="absolute top-3 left-3 nft-badge shadow-lg group-hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-300">
            <Hexagon className="h-3 w-3 mr-1" fill="currentColor" strokeWidth={0} />
            <span className="font-medium">NFT #{id}</span>
          </div>
          
          {/* Blockchain verification badge with animated glow */}
          <div className="blockchain-badge absolute top-3 right-3 flex-shrink-0 shadow-lg group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300">
            <Shield className="h-3 w-3 mr-0.5" /> 
            <span className="text-xs">Verified</span> 
          </div>
          
          {/* Featured Badge with enhanced styling */}
          {featured && ( 
            <div className="absolute top-12 right-3 bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 rounded-md text-xs font-medium text-white shadow-lg flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              <span>Featured</span>
            </div>
          )}
          
          {/* Property type badge */}
          {propertyType && (
            <div className="absolute top-12 left-3 bg-gray-900/70 text-gray-300 px-2 py-0.5 rounded-md text-xs font-medium shadow-lg flex items-center border border-gray-700">
              <Building2 className="h-3 w-3 mr-1 text-gray-400" />
              <span>{propertyType}</span>
            </div>
          )}
          
          {/* Token Address with enhanced futuristic styling */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <div className="blockchain-address text-xs text-blue-300 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-md border border-blue-500/40 shadow-[0_0_5px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1 animate-pulse"></span>
              {shortenedAddress}
            </div>
            
            {addressToUse && (
              <a 
                href={`https://basescan.org/token/${addressToUse}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-400 transition-colors bg-gray-900/80 backdrop-blur-sm p-1 rounded-md border border-blue-500/30 shadow-[0_0_5px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300"
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
        <div className="flex flex-col gap-3 mb-auto">
          {/* Title with enhanced styling */}
          <div className="flex items-start">
            <h3 className="font-bold text-base line-clamp-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" title={title}>
              {title}
            </h3>
          </div>
          
          {/* Location with enhanced styling */}
          <div className="flex items-center text-gray-300 text-xs backdrop-blur-sm bg-gray-900/40 px-2 py-1.5 rounded-md shadow-inner border border-gray-800/50">
            <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0 text-blue-400" />
            <span className="line-clamp-1" title={location}>{location}</span>
          </div>
          
          {/* Property details with enhanced styling */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {sqft > 0 && (
              <div className="flex items-center gap-1 bg-gray-900/40 px-2 py-1 rounded-md border border-gray-800/50">
                <Maximize2 className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">{sqft} sqft</span>
              </div>
            )}
            
            {bedrooms > 0 && (
              <div className="flex items-center gap-1 bg-gray-900/40 px-2 py-1 rounded-md border border-gray-800/50">
                <Tag className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">{bedrooms} Beds</span>
              </div>
            )}
            
            {bathrooms > 0 && (
              <div className="flex items-center gap-1 bg-gray-900/40 px-2 py-1 rounded-md border border-gray-800/50">
                <Tag className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">{bathrooms} Baths</span>
              </div>
            )}
          </div>
          
          {/* Price Section with enhanced styling */}
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
            className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-500/30"
            disabled={!addressToUse}
          > 
            {/* Enhanced animated glow effect */}
            <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></span>
            <Tag className="mr-2 h-4 w-4 text-blue-200" />
            <span className="relative z-10 font-medium">View Property</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
