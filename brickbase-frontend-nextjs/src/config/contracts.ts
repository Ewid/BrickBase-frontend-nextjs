// Contract addresses and configuration
export const CONTRACT_CONFIG = {

  // Main contracts
  PROPERTY_TOKEN_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_PROPERTY_TOKEN_FACTORY_ADDRESS || '0x67410f8784eA3447c4f20A60840D3269F1c5e135',
  PROPERTY_NFT_ADDRESS: process.env.NEXT_PUBLIC_PROPERTY_NFT_ADDRESS || '0x2923f8C35aBC526041A64e8885ec61E1c654DFf1',
  PROPERTY_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || '0x9f5bA89EACeCeA215c9fF948068c1F923ab8E068',
  PROPERTY_MARKETPLACE_ADDRESS: process.env.NEXT_PUBLIC_PROPERTY_MARKETPLACE_ADDRESS || '0xAd6e864BEaD48b9DdEcc0cE53CA25cAEdeBEC064',
  RENT_DISTRIBUTION_ADDRESS: process.env.NEXT_PUBLIC_RENT_DISTRIBUTION_ADDRESS || '0xECfC4AEA8DF2aeFd6a292F9bE37E4F8cDd913b7D',
  PROPERTY_DAO_ADDRESS: process.env.NEXT_PUBLIC_PROPERTY_DAO_ADDRESS || '0xdDD158d7cb2cC650e54E2fa4E57B7d2494F5297F',
  
  // USDC token address on Base Sepolia
  USDC_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  
  // Individual property token addresses
  PROPERTY_TOKENS: {
    MBV: process.env.NEXT_PUBLIC_MBV_TOKEN_ADDRESS || '0x55E6e92C51B7E9d94a90dB539B0636a7BB713325', // Miami Beachfront Villa
    MLC: process.env.NEXT_PUBLIC_MLC_TOKEN_ADDRESS || '0x13690b78E6d8C40019ce71e7902AFdB1d287Ff47', // Manhattan Luxury Condo
    SFMT: process.env.NEXT_PUBLIC_SFMT_TOKEN_ADDRESS || '0xA06C5216a8a0Bf26a7E09c47e2211215a058a3d5', // San Francisco Modern Townhouse
    CDP: process.env.NEXT_PUBLIC_CDP_TOKEN_ADDRESS || '0x1038Da4f080Df159e9bdc6b47d6268B060d0586C'  // Chicago Downtown Penthouse
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