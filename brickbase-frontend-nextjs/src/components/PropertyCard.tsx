import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Maximize2, Bitcoin, Tag } from "lucide-react";

interface PropertyCardProps {
  id: number;
  title: string;
  location: string;
  price: string;
  cryptoPrice: string;
  imageUrl: string;
  sqft: number;
  featured?: boolean;
}

const PropertyCard = ({ 
  id, 
  title, 
  location, 
  price, 
  cryptoPrice, 
  imageUrl, 
  sqft, 
  featured = false 
}: PropertyCardProps) => {
  return (
    <Card className={`overflow-hidden card-hover glass-card border-0 ${featured ? 'border-l-4 border-l-crypto-teal' : ''}`}>
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden relative">
          <Image 
            src={imageUrl} 
            alt={title}
            className="transition-transform duration-500 hover:scale-110 object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        {featured && (
          <div className="absolute top-2 right-2 bg-crypto-teal px-3 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="flex items-center gap-1 text-xs bg-crypto-dark/50 px-2 py-1 rounded-full">
            <Building2 className="h-3 w-3 text-crypto-light" />
            <span>{sqft} sqft</span>
          </div>
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <MapPin className="h-3 w-3 mr-1" />
          {location}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-crypto-light font-semibold text-xl">{price}</p>
            <div className="flex items-center text-gray-400 text-xs">
              <Bitcoin className="h-3 w-3 mr-1 text-yellow-500" />
              {cryptoPrice}
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full h-8 w-8 p-0 border-crypto-light">
            <Maximize2 className="h-4 w-4 text-crypto-light" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/properties/${id}`} className="w-full">
          <Button className="w-full bg-crypto-dark hover:bg-crypto-dark/80 border border-crypto-light/30">
            <Tag className="mr-2 h-4 w-4" />
            View Property
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;