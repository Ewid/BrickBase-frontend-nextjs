// Sample property data for development
const FEATURED_PROPERTIES = [
  {
    id: '1',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/ba1d3513-7df4-4e3f-9409-9bbd12c783b4.png',
    price: '$1.5M',
    beds: 2,
    baths: 2,
    address: '123 Main St',
    city: 'San Francisco',
    isNFT: true,
    listingDate: '3 days ago'
  },
  {
    id: '2',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/f7f38d9c-5405-43af-a3c7-a591d6534d2b.png',
    price: '$1.5M',
    beds: 2,
    baths: 2,
    address: '123 Main St',
    city: 'San Francisco',
    isNFT: true,
    listingDate: '3 days ago'
  }
];

const RECENT_PROPERTIES = [
  {
    id: '1',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/f2c83bae-2db4-4d40-89ef-9ad976115e34.png',
    price: '$3,200,000',
    beds: 4,
    baths: 3,
    sqft: 2500,
    address: '123 Main St.',
    city: 'San Francisco',
  },
  {
    id: '2',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/c62f6a01-0c4d-4fc9-811b-aaab1d0c64f0.png',
    price: '$2,500,000',
    beds: 3,
    baths: 2,
    sqft: 1500,
    address: '456 Elm St.',
    city: 'Los Angeles',
  },
  {
    id: '3',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/0a08d266-f9ca-4dd8-abdb-13a911c53044.png',
    price: '$1,800,000',
    beds: 2,
    baths: 2,
    sqft: 1000,
    address: '789 Oak St.',
    city: 'New York',
  },
  {
    id: '4',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/43717b9d-8716-4f45-aa4f-f3ff5e862798.png',
    price: '$1,200,000',
    beds: 2,
    baths: 1,
    sqft: 900,
    address: '101 Pine St.',
    city: 'Chicago',
  },
  {
    id: '5',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/b0dec03b-482e-41ce-b54f-0e58ac589e35.png',
    price: '$950,000',
    beds: 1,
    baths: 1,
    sqft: 750,
    address: '202 Cedar St.',
    city: 'Miami',
  },
];

const FEATURED_NFTS = [
  {
    id: 'nft1',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/ee7410c6-6915-4a2a-8f5e-e5b9d6966455.png',
  },
  {
    id: 'nft2',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/0ec666e4-dbd2-4166-ac3d-c8e01038230a.png',
  },
  {
    id: 'nft3',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/99914fa4-6d1f-4dcb-9064-40c193397f19.png',
  },
  {
    id: 'nft4',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/00fb17ad-d319-4dc8-a2f4-c08e2db26d9e.png',
  },
  {
    id: 'nft5',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/df8a27f7-e62c-4710-bc18-07e535ea750c.png',
  },
  {
    id: 'nft6',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/7f8c5483-abfe-403e-b5d9-eb71b9e94899.png',
  },
];

export interface PropertyData {
  id: string;
  imageUrl: string;
  price: string;
  beds: number;
  baths: number;
  sqft?: number;
  address: string;
  city?: string;
  isNFT?: boolean;
  listingDate?: string;
}

export interface NFTData {
  id: string;
  imageUrl: string;
}

// Simulate API calls with promises
export const propertyService = {
  getFeaturedProperties: async (): Promise<PropertyData[]> => {
    // In a real app, this would be a fetch call to an API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(FEATURED_PROPERTIES);
      }, 300);
    });
  },
  
  getRecentProperties: async (): Promise<PropertyData[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(RECENT_PROPERTIES);
      }, 300);
    });
  },
  
  getFeaturedNFTs: async (): Promise<NFTData[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(FEATURED_NFTS);
      }, 300);
    });
  },
  
  searchProperties: async (query: string): Promise<PropertyData[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allProperties = [...FEATURED_PROPERTIES, ...RECENT_PROPERTIES];
        const filteredProperties = allProperties.filter(property => 
          property.address.toLowerCase().includes(query.toLowerCase()) || 
          property.city?.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filteredProperties);
      }, 300);
    });
  }
};
