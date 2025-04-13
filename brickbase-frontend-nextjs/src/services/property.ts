import { ethers } from 'ethers';
import ERC20ABI from '@/abis/ERC20.json';
import PropertyRegistryABI from '@/abis/PropertyRegistry.json';
import PropertyNFTABI from '@/abis/PropertyNFT.json';
import RentDistributionABI from '@/abis/RentDistribution.json';
import CONTRACT_CONFIG from '@/config/contracts';
import { PropertyDto, TokenBalanceDto, RentDto } from '@/types/dtos';

/**
 * Get property token contract instance
 */
export const getPropertyTokenContract = async (tokenAddress: string, signer?: ethers.Signer) => {
  if (!tokenAddress) {
    throw new Error('Token address is required');
  }
  
  if (!signer) {
    // Read-only provider
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    return new ethers.Contract(tokenAddress, ERC20ABI, provider);
  }
  
  return new ethers.Contract(tokenAddress, ERC20ABI, signer);
};

/**
 * Get property registry contract instance
 */
export const getPropertyRegistryContract = async (signer?: ethers.Signer) => {
  const registryAddress = CONTRACT_CONFIG.PROPERTY_REGISTRY_ADDRESS;
  
  if (!registryAddress) {
    throw new Error('Property registry address not configured');
  }
  
  if (!signer) {
    // Read-only provider
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    return new ethers.Contract(registryAddress, PropertyRegistryABI, provider);
  }
  
  return new ethers.Contract(registryAddress, PropertyRegistryABI, signer);
};

/**
 * Get property NFT contract instance
 */
export const getPropertyNFTContract = async (signer?: ethers.Signer) => {
  const nftAddress = CONTRACT_CONFIG.PROPERTY_NFT_ADDRESS;
  
  if (!nftAddress) {
    throw new Error('Property NFT address not configured');
  }
  
  if (!signer) {
    // Read-only provider
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    return new ethers.Contract(nftAddress, PropertyNFTABI, provider);
  }
  
  return new ethers.Contract(nftAddress, PropertyNFTABI, signer);
};

/**
 * Get rent distribution contract instance
 */
export const getRentDistributionContract = async (signer?: ethers.Signer) => {
  const rentAddress = CONTRACT_CONFIG.RENT_DISTRIBUTION_ADDRESS;
  
  if (!rentAddress) {
    throw new Error('Rent distribution address not configured');
  }
  
  if (!signer) {
    // Read-only provider
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    return new ethers.Contract(rentAddress, RentDistributionABI, provider);
  }
  
  return new ethers.Contract(rentAddress, RentDistributionABI, signer);
};

/**
 * Fetch all properties
 */
export const getAllProperties = async (): Promise<PropertyDto[]> => {
  try {
    const apiUrl = CONTRACT_CONFIG.API_BASE_URL;
    const response = await fetch(`${apiUrl}/properties`, {
      signal: AbortSignal.timeout(30000), // 30 second timeout
      next: { revalidate: 300 } // Revalidate cache every 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

/**
 * Fetch property by NFT address
 */
export const getPropertyByNFTAddress = async (nftAddress: string): Promise<PropertyDto> => {
  try {
    const apiUrl = CONTRACT_CONFIG.API_BASE_URL;
    const response = await fetch(`${apiUrl}/properties/${nftAddress}`, {
      signal: AbortSignal.timeout(30000), // 30 second timeout
      next: { revalidate: 300 } // Revalidate cache every 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch property: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching property with NFT address ${nftAddress}:`, error);
    throw error;
  }
};

/**
 * Fetch property by token address
 */
export const getPropertyByTokenAddress = async (tokenAddress: string): Promise<PropertyDto> => {
  try {
    const apiUrl = CONTRACT_CONFIG.API_BASE_URL;
    const response = await fetch(`${apiUrl}/properties/token/${tokenAddress}`, {
      signal: AbortSignal.timeout(30000), // 30 second timeout
      next: { revalidate: 300 } // Revalidate cache every 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch property: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching property with token address ${tokenAddress}:`, error);
    throw error;
  }
};

/**
 * Get user's token balance
 */
export const getUserTokenBalance = async (userAddress: string, tokenAddress: string): Promise<TokenBalanceDto> => {
  try {
    const tokenContract = await getPropertyTokenContract(tokenAddress);
    const decimals = await tokenContract.decimals();
    const totalSupply = await tokenContract.totalSupply();
    const balance = await tokenContract.balanceOf(userAddress);
    
    // Calculate ownership percentage
    const percentage = totalSupply.gt(0) 
      ? (balance * BigInt(10000) / totalSupply) / BigInt(100)
      : 0;
      
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    return {
      tokenAddress,
      balance: balance.toString(),
      formattedBalance,
      percentage: Number(percentage)
    };
  } catch (error) {
    console.error(`Error getting token balance for ${userAddress} on token ${tokenAddress}:`, error);
    throw error;
  }
};

/**
 * Get claimable rent amount
 */
export const getClaimableRent = async (userAddress: string, propertyTokenAddress: string): Promise<RentDto> => {
  try {
    const apiUrl = CONTRACT_CONFIG.API_BASE_URL;
    const response = await fetch(`${apiUrl}/rent/claimable/${userAddress}/${propertyTokenAddress}`, {
      signal: AbortSignal.timeout(30000), // 30 second timeout
      next: { revalidate: 300 } // Revalidate cache every 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch claimable rent: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching claimable rent for ${userAddress} on token ${propertyTokenAddress}:`, error);
    throw error;
  }
};

/**
 * Claim rent for a property token
 */
export const claimRent = async (propertyTokenAddress: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    
    const rentContract = await getRentDistributionContract(signer);
    const tx = await rentContract.claimRent(propertyTokenAddress);
    await tx.wait();
    
    return {
      success: true,
      transaction: tx
    };
  } catch (error: any) {
    console.error('Failed to claim rent:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Unknown error occurred'
      }
    };
  }
}; 