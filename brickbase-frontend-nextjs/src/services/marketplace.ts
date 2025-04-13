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

// Get the USDC token contract instance
export const getUsdcTokenContract = async (signer?: ethers.Signer) => {
  const usdcAddress = CONTRACT_CONFIG.USDC_TOKEN_ADDRESS;
  
  if (!usdcAddress) {
    throw new Error('USDC token address not configured');
  }
  
  if (!signer) {
    // Read-only provider
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    // Cast window.ethereum to any to avoid type issues
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    return new ethers.Contract(usdcAddress, ERC20ABI, provider);
  }
  
  return new ethers.Contract(usdcAddress, ERC20ABI, signer);
};

// Get ERC20 token contract instance (for property tokens)
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
      
      // Format listings with USDC prices (assuming 6 decimals for USDC)
      const formattedListings = listings.map((listing: any) => {
        const formattedPrice = formatCurrency(listing.pricePerToken, 6);
        const formattedAmount = formatCurrency(listing.amount, 18); // Tokens still use 18 decimals
        
        return {
          ...listing,
          formattedPrice,
          formattedAmount,
          currency: 'USDC'
        };
      });
      
      console.log('Received marketplace listings with USDC prices:', formattedListings);
      return formattedListings;
    } catch (apiError) {
      console.error('API call failed:', apiError);
      throw apiError; // Rethrow as we don't want to fall back to contract calls
    }
  } catch (error) {
    console.error('Failed to get active listings:', error);
    throw error;
  }
};

// Create a new listing with USDC price
export const createListing = async (propertyToken: string, tokenAmount: string, usdcPrice: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider available');
    }
    
    // Convert USDC price to wei (6 decimals)
    const priceInWei = ethers.parseUnits(usdcPrice, 6).toString();
    
    // Cast window.ethereum to any to avoid type issues
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    
    // First approve the marketplace to transfer tokens
    const tokenContract = await getTokenContract(propertyToken, signer);
    const marketplaceAddress = CONTRACT_CONFIG.PROPERTY_MARKETPLACE_ADDRESS;
    
    const approveTx = await tokenContract.approve(marketplaceAddress, tokenAmount);
    await approveTx.wait();
    
    // Create the listing with USDC price
    const contract = await getMarketplaceContract(signer);
    const tx = await contract.createListing(propertyToken, tokenAmount, priceInWei);
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
      transaction: tx,
      usdcPrice: usdcPrice
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

// Buy tokens from a listing using USDC
export const buyTokensFromListing = async (listingId: string, amount: string) => {
  try {
    try {
      // Get the listing details from the contract
      const contract = await getMarketplaceContract();
      const listing = await contract.listings(listingId);
      
      // Calculate total price (amount * pricePerToken)
      // For USDC: divide by 10^6 not 10^18
      const totalPrice = (BigInt(amount) * BigInt(listing.pricePerToken)) / BigInt(10**6);
      
      // Calculate USDC equivalent for user information
      const usdcAmount = formatCurrency(totalPrice.toString(), 6);
      
      console.log(`Purchasing tokens: ${amount} tokens at ${formatCurrency(listing.pricePerToken, 6)} USDC per token`);
      console.log(`Total price: ${usdcAmount} USDC`);
      
      // Get signer from the connected wallet
      if (!window.ethereum) {
        throw new Error('No ethereum provider available');
      }
      
      // Cast window.ethereum to any to avoid type issues
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      // Get USDC contract
      const usdcContract = await getUsdcTokenContract(signer);
      
      // Check if user has enough USDC for the transaction
      const usdcBalance = await usdcContract.balanceOf(signerAddress);
      if (usdcBalance < totalPrice) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_FUNDS',
            message: 'You do not have enough USDC to complete this purchase',
            usdcAmount
          }
        };
      }
      
      // First approve USDC transfer to marketplace
      const marketplaceAddress = CONTRACT_CONFIG.PROPERTY_MARKETPLACE_ADDRESS;
      
      // Approve USDC transfer
      const approveTx = await usdcContract.approve(marketplaceAddress, totalPrice.toString());
      await approveTx.wait();
      
      // Create marketplace contract instance with the signer
      const marketplaceWithSigner = await getMarketplaceContract(signer);
      
      // Execute the purchase transaction
      const tx = await marketplaceWithSigner.purchaseTokens(
        listingId,
        amount,
        { 
          // Add some extra gas limit to ensure transaction doesn't fail
          gasLimit: 500000
        }
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return { 
        success: true, 
        transaction: tx,
        receipt: receipt,
        usdcAmount
      };
    } catch (error: any) {
      console.error("Purchase failed:", error);
      
      // Extract useful information from the error
      let errorMessage = 'Transaction failed';
      let errorCode = 'UNKNOWN_ERROR';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by the user';
        errorCode = 'USER_REJECTED';
      } else if (error.message?.includes('insufficient funds') || error.message?.includes('exceed allowance')) {
        errorMessage = 'You do not have enough USDC to complete this transaction';
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

// Get USDC balance for a specific address
export const getUsdcBalance = async (address: string) => {
  try {
    const usdcContract = await getUsdcTokenContract();
    const balance = await usdcContract.balanceOf(address);
    return formatCurrency(balance.toString(), 6);
  } catch (error) {
    console.error(`Failed to get USDC balance for ${address}:`, error);
    throw error;
  }
};

// Format currency values for display based on decimals
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