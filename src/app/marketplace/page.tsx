import { ListingDto } from '@/types/dtos';

// Define the property metadata structure
interface PropertyMetadata {
  id: string;
  name: string;
  description: string;
  images: string[];
  attributes?: {
    location?: string;
    description?: string;
    sqft?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    propertyType?: string;
    [key: string]: any;
  };
  error?: boolean;
}

// Update the interface to match the backend DTO
interface EnhancedListing extends Omit<ListingDto, 'propertyMetadata'> {
  propertyMetadata: PropertyMetadata;
  usdPrice?: string;
}

// Create a mock API for property metadata if the actual API is unavailable
const mockPropertyData = (propertyToken: string): PropertyMetadata => {
  // Generate deterministic mock data based on the token address
  const tokenDigits = propertyToken.slice(-4);
  const mockId = parseInt(tokenDigits, 16) % 1000;
  
  return {
    id: propertyToken,
    name: `Property #${mockId}`,
    description: 'This property information is currently unavailable from the API. This is placeholder data for demo purposes.',
    images: ['/property-placeholder.jpg'],
    attributes: {
      location: '123 Blockchain Avenue, Crypto City',
      propertyType: mockId % 3 === 0 ? 'Residential' : mockId % 3 === 1 ? 'Commercial' : 'Mixed-Use',
      bedrooms: Math.floor(Math.random() * 5) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      sqft: Math.floor(Math.random() * 2000) + 800,
      yearBuilt: 2000 + Math.floor(Math.random() * 23),
    }
  };
};

export default function MarketplacePage() {
  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const activeListings = await getActiveListings();
      
      if (!activeListings || activeListings.length === 0) {
        setListings([]);
        setIsLoading(false);
        return;
      }
      
      const listingsWithMetadata = await Promise.all(
        activeListings.map(async (listing) => {
          try {
            // Use propertyToken if nftAddress is not available
            const tokenToUse = listing.nftAddress || listing.propertyToken || listing.tokenAddress;
            
            if (!tokenToUse) {
              console.error('No property token or NFT address found in listing:', listing);
              throw new Error('Missing property identifier');
            }
            
            const propertyData = await fetchPropertyMetadata(tokenToUse);
            
            // Calculate USD price if ETH price is available
            let usdPrice = undefined;
            if (ethUsdPrice) {
              const ethPrice = parseFloat(formatCurrency(listing.pricePerToken));
              usdPrice = (ethPrice * ethUsdPrice).toFixed(2);
            }
            
            return {
              ...listing,
              propertyMetadata: propertyData,
              usdPrice
            } as EnhancedListing;
          } catch (err) {
            console.error(`Error fetching property metadata for ${listing.propertyToken || listing.nftAddress || 'unknown property'}:`, err);
            // Use any available token address for fallback data
            const tokenToUse = listing.nftAddress || listing.propertyToken || listing.tokenAddress;
            const fallbackData = mockPropertyData(tokenToUse);
            
            return {
              ...listing,
              propertyMetadata: {
                ...fallbackData,
                error: true
              }
            } as EnhancedListing;
          }
        })
      );
      
      setListings(listingsWithMetadata);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err.message || 'An error occurred while fetching listings');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => {
        return (
          <Card key={listing.id} className="overflow-hidden h-full flex flex-col border-gray-800 hover:border-gray-700 transition-colors">
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Link href={`/properties/${listing.nftAddress || listing.propertyToken || listing.tokenAddress}`} className="flex-1">
                <Button variant="outline" className="w-full text-xs" size="sm">
                  View Property
                  <ArrowUpRight className="h-3 w-3 ml-1.5" />
                </Button>
              </Link>
              <div className="mt-3">
                <Link href={`/properties/${listing.nftAddress || listing.propertyToken || listing.tokenAddress}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                  View property details
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
} 