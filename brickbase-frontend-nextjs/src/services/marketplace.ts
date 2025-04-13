import { ethers } from 'ethers';
import MarketplaceABI from '@/abis/PropertyMarketplace.json';
import ERC20ABI from '@/abis/ERC20.json';
import CONTRACT_CONFIG from '@/config/contracts';

// Get the marketplace contract instance
export const getMarketplaceContract = async (signer?: ethers.Signer) => {
  const marketplaceAddress = CONTRACT_CONFIG.PROPERTY_MARKETPLACE_ADDRESS;
  
  if (!marketplaceAddress) {
    throw new Error('Marketplace contract address not configured');
  }
  
  if (!signer) {
    // Read-only provider
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    // Cast window.ethereum to any to avoid type issues
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    return new ethers.Contract(marketplaceAddress, MarketplaceABI, provider);
  }
  
  return new ethers.Contract(marketplaceAddress, MarketplaceABI, signer);
};

// Get ERC20 token contract instance
export const getTokenContract = async (tokenAddress: string, signer?: ethers.Signer) => {
  if (!signer) {
    // Read-only provider
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    // Cast window.ethereum to any to avoid type issues
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    return new ethers.Contract(tokenAddress, ERC20ABI, provider);
  }
  
  return new ethers.Contract(tokenAddress, ERC20ABI, signer);
};

// Get active listings from the marketplace
export const getActiveListings = async () => {
  try {
    // Use the API_BASE_URL from config
    const apiUrl = CONTRACT_CONFIG.API_BASE_URL;
    
    console.log(`Fetching marketplace listings from: ${apiUrl}/marketplace/listings`);
    
    try {
      const response = await fetch(`${apiUrl}/marketplace/listings`, {
        signal: AbortSignal.timeout(30000), // 30 second timeout
        next: { revalidate: 300 } // Revalidate cache every 5 minutes
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status} ${response.statusText}`);
      }
      
      const listings = await response.json();
      console.log('Received marketplace listings:', listings);
      return listings;
    } catch (apiError) {
      console.error('API call failed:', apiError);
      throw apiError; // Rethrow as we don't want to fall back to contract calls
    }
  } catch (error) {
    console.error('Failed to get active listings:', error);
    throw error;
  }
};

// Create a new listing
export const createListing = async (propertyToken: string, tokenAmount: string, pricePerToken: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    // Cast window.ethereum to any to avoid type issues
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    
    // First approve the marketplace to transfer tokens
    const tokenContract = await getTokenContract(propertyToken, signer);
    const marketplaceAddress = CONTRACT_CONFIG.PROPERTY_MARKETPLACE_ADDRESS;
    
    const approveTx = await tokenContract.approve(marketplaceAddress, tokenAmount);
    await approveTx.wait();
    
    // Create the listing
    const contract = await getMarketplaceContract(signer);
    const tx = await contract.createListing(propertyToken, tokenAmount, pricePerToken);
    const receipt = await tx.wait();
    
    // Extract listingId from events
    const event = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find((event: any) => event && event.name === 'ListingCreated');
    
    const listingId = event ? event.args.listingId.toString() : null;
    
    return {
      success: true,
      listingId,
      transaction: tx
    };
  } catch (error: any) {
    console.error('Failed to create listing:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Unknown error occurred'
      }
    };
  }
};

// Cancel a listing
export const cancelListing = async (listingId: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    // Cast window.ethereum to any to avoid type issues
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    
    const contract = await getMarketplaceContract(signer);
    const tx = await contract.cancelListing(listingId);
    await tx.wait();
    
    return {
      success: true,
      transaction: tx
    };
  } catch (error: any) {
    console.error('Failed to cancel listing:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Unknown error occurred'
      }
    };
  }
};

// Buy tokens from a listing
export const buyTokensFromListing = async (listingId: string, amount: string) => {
  try {
    // First validate the transaction will succeed with estimateGas
    try {
      // Get the listing details from the contract
      const contract = await getMarketplaceContract();
      const listing = await contract.listings(listingId);
      
      // Calculate total price (amount * pricePerToken)
      const totalPrice = (BigInt(amount) * BigInt(listing.pricePerToken)) / BigInt(10**18);
      
      // Get signer from the connected wallet
      if (!window.ethereum) {
        throw new Error('No ethereum provider available');
      }
      
      // Cast window.ethereum to any to avoid type issues
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      // Check if user has enough ETH for the transaction
      const balance = await provider.getBalance(signerAddress);
      if (balance < totalPrice) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_FUNDS',
            message: 'You do not have enough ETH to complete this purchase'
          }
        };
      }
      
      // Create marketplace contract instance with the signer
      const marketplaceWithSigner = await getMarketplaceContract(signer);
      
      // Estimate gas to check if transaction would fail
      try {
        await marketplaceWithSigner.purchaseTokens.estimateGas(
          listingId,
          amount,
          { value: totalPrice.toString() }
        );
      } catch (estimateError: any) {
        console.error("Gas estimation failed:", estimateError);
        return {
          success: false,
          error: {
            code: 'CALL_EXCEPTION',
            message: 'Transaction would fail. There might be an issue with the contract or your request.',
            details: estimateError?.message || 'Unknown error during gas estimation'
          }
        };
      }
      
      // Execute the purchase transaction
      const tx = await marketplaceWithSigner.purchaseTokens(
        listingId,
        amount,
        { 
          value: totalPrice.toString(),
          // Add some extra gas limit to ensure transaction doesn't fail
          gasLimit: 500000
        }
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return { 
        success: true, 
        transaction: tx,
        receipt: receipt
      };
    } catch (error: any) {
      console.error("Purchase failed:", error);
      
      // Extract useful information from the error
      let errorMessage = 'Transaction failed';
      let errorCode = 'UNKNOWN_ERROR';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by the user';
        errorCode = 'USER_REJECTED';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'You don\'t have enough ETH to complete this transaction';
        errorCode = 'INSUFFICIENT_FUNDS';
      } else if (error.message?.includes('estimateGas')) {
        errorMessage = 'Transaction would fail. The contract rejected the transaction.';
        errorCode = 'ESTIMATE_GAS_FAILED';
      } else if (error.reason) {
        errorMessage = `Transaction failed: ${error.reason}`;
        errorCode = 'CONTRACT_ERROR';
      }
      
      return { 
        success: false, 
        error: {
          code: errorCode,
          message: errorMessage,
          originalError: error
        }
      };
    }
  } catch (outerError: any) {
    console.error("Unexpected error during purchase:", outerError);
    return { 
      success: false, 
      error: {
        code: 'UNEXPECTED_ERROR',
        message: outerError.message || 'An unexpected error occurred',
        originalError: outerError
      }
    };
  }
};

// Get token balance for a specific address
export const getTokenBalance = async (tokenAddress: string, address: string) => {
  try {
    const tokenContract = await getTokenContract(tokenAddress);
    const balance = await tokenContract.balanceOf(address);
    return balance.toString();
  } catch (error) {
    console.error(`Failed to get token balance for ${address}:`, error);
    throw error;
  }
};

// Format currency values for display
export const formatCurrency = (value: string, decimals = 18) => {
  const formatted = ethers.formatUnits(value, decimals);
  // Remove trailing zeros
  return formatted.replace(/\.0+$|(\.\d*[1-9])0+$/, '$1');
};

// Convert IPFS URL to HTTP gateway URL if needed
export const tryConvertIpfsUrl = (url: string): string => {
  if (!url) return '/property-placeholder.jpg';
  
  // Check if the URL is an IPFS URL (ipfs:// or ipfs/...)
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    // Try gateway.pinata.cloud first
    return `${CONTRACT_CONFIG.IPFS_GATEWAY}${cid}`;
  }
  
  // Handle URLs that have ipfs/ in them
  if (url.includes('ipfs/')) {
    const ipfsPath = url.split('ipfs/')[1];
    return `${CONTRACT_CONFIG.IPFS_GATEWAY}${ipfsPath}`;
  }
  
  // Return the original URL if not an IPFS URL
  return url;
};