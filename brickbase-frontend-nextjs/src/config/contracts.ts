// Contract addresses and configuration
export const CONTRACT_CONFIG = {
  // Main contracts
  PROPERTY_NFT_ADDRESS: process.env.NEXT_PUBLIC_PROPERTY_NFT_ADDRESS || '0x79744a5832E911aA8A9c35408f7409232C8AFE6D',
  PROPERTY_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || '0x9c3A881d4ad4FdBbf07F15aAD0ea20a4cc625e81',
  PROPERTY_MARKETPLACE_ADDRESS: process.env.NEXT_PUBLIC_PROPERTY_MARKETPLACE_ADDRESS || '0x8b69548f445f4B76e6AC8B3deF04dD9A0587D314',
  RENT_DISTRIBUTION_ADDRESS: process.env.NEXT_PUBLIC_RENT_DISTRIBUTION_ADDRESS || '0xf98DA6026B4cA7662a80833EC2dC757395eFaFe6',
  PROPERTY_DAO_ADDRESS: process.env.NEXT_PUBLIC_PROPERTY_DAO_ADDRESS || '0xe04A6AB85c8E2e24b8c0fbd128E88b7981Df1b18',
  
  // Individual property token addresses
  PROPERTY_TOKENS: {
    MBV: process.env.NEXT_PUBLIC_MBV_TOKEN_ADDRESS || '0xC95137A1659d28d8a1CfCF3F7F37F2737801e007', // Miami Beachfront Villa
    MLC: process.env.NEXT_PUBLIC_MLC_TOKEN_ADDRESS || '0x5419ca254Aa6635235aCd66B09Da27Ba2a72BEEB', // Manhattan Luxury Condo
    SFMT: process.env.NEXT_PUBLIC_SFMT_TOKEN_ADDRESS || '0x432a5cBb7278C19Ca7b3f44A7fc509f4D6e2D185', // San Francisco Modern Townhouse
    CDP: process.env.NEXT_PUBLIC_CDP_TOKEN_ADDRESS || '0x14fdE87ed08a7F496A9838C541AaD472Db55d68e'  // Chicago Downtown Penthouse
  },
  
  // API configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  
  // IPFS Gateway
  IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'
};

// Helper to get a property token address by property name or key
export const getPropertyTokenAddress = (propertyKey: string): string => {
  const key = propertyKey.toUpperCase();
  
  // Check if it's a direct key match (MBV, MLC, etc)
  if (key in CONTRACT_CONFIG.PROPERTY_TOKENS) {
    return CONTRACT_CONFIG.PROPERTY_TOKENS[key as keyof typeof CONTRACT_CONFIG.PROPERTY_TOKENS];
  }
  
  // Try to match by name
  const nameMap: Record<string, keyof typeof CONTRACT_CONFIG.PROPERTY_TOKENS> = {
    'MIAMI BEACHFRONT VILLA': 'MBV',
    'MANHATTAN LUXURY CONDO': 'MLC',
    'SAN FRANCISCO MODERN TOWNHOUSE': 'SFMT',
    'CHICAGO DOWNTOWN PENTHOUSE': 'CDP'
  };
  
  if (key in nameMap) {
    const mappedKey = nameMap[key];
    return CONTRACT_CONFIG.PROPERTY_TOKENS[mappedKey];
  }
  
  // Return empty string if not found
  return '';
};

export default CONTRACT_CONFIG; 