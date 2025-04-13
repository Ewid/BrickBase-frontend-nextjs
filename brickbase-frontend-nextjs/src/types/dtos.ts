// src/types/dtos.ts
// Based on backend DTO definitions and context

// --- Marketplace DTOs ---

export interface ListingDto {
  id?: string;
  listingId?: string; // API returns listingId instead of id
  seller: string;
  propertyToken?: string;
  tokenAmount?: string;
  amount?: string; // API uses amount field instead of tokenAmount
  pricePerToken: string;
  price?: string; // Alternative field name for pricePerToken
  isActive?: boolean;
  active?: boolean; // API uses active instead of isActive
  nftAddress?: string;
  tokenId?: string;
  tokenAddress?: string;
  // UI helper properties
  propertyMetadata?: {
    name: string;
    image: string;
    tokenSymbol?: string;
    propertyAddress?: string;
  };
  propertyDetails?: PropertyDto | null;  // Optional enriched property data
  formattedPrice?: string;  // Formatted price for display
  formattedAmount?: string; // Formatted amount for display
  usdPrice?: string;        // USD equivalent price
}

export interface PriceHistoryDto {
  id: number;
  nftAddress: string;
  tokenId: number;
  seller: string;
  buyer: string;
  amount: string; // BigInt as string
  pricePerToken: string; // BigInt as string
  totalPrice: string; // BigInt as string
  timestamp: Date;
}

// --- Properties DTOs ---

export interface PropertyDto {
  id: string;              // The NFT Contract Address
  tokenId: number;         // The NFT token ID
  tokenAddress?: string;   // Property's specific ERC20 token address
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  totalSupply: string;     // Total supply of tokens
  propertyDetails?: {
    physicalAddress?: string;
    sqft?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    propertyType?: string;
    associatedPropertyToken?: string;
  };
}

// --- DAO DTOs ---

export interface ProposalDto {
  id: number;
  proposer: string;         // Address of proposer
  description: string;      // Description of proposal
  targetContract: string;   // Contract to call if passed
  functionCall: string;     // Call data for the target contract
  votesFor: string;         // Total votes in favor (big number string)
  votesAgainst: string;     // Total votes against (big number string)
  startTime: number;        // When voting starts
  endTime: number;          // When voting ends
  executed: boolean;        // Whether executed yet
  passed: boolean;          // Whether passed or failed
}

export interface ExpenseRecordDto {
  id: number;
  propertyNftId: string; // NFT Contract Address
  description: string;
  amount: number; // Assuming number based on entity
  date: Date;
  category: string;
}

// --- Rent DTOs ---

export interface ClaimableRentDto {
  claimableAmount: string; // BigInt as string (in wei)
}

// --- Installments DTOs ---

// Based on backend definitions (replace with actual DTO code if provided)
export interface InstallmentDto {
  id: string;
  principal: number;
  interestRate: number;
  termMonths: number;
  paidAmount: number;
  dueDate: Date;
  status: string; // e.g., 'PENDING', 'PAID', 'OVERDUE'
}

export interface InstallmentPlanDto {
  id: string; // UUID
  userId: string;
  propertyNftAddress: string;
  totalAmount: number;
  downPayment: number;
  remainingBalance: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  startDate: Date;
  endDate: Date;
  status: string; // e.g., 'ACTIVE', 'COMPLETED', 'DEFAULTED'
  installments: InstallmentDto[];
}

export interface CreateInstallmentPlanDto {
  userId: string;
  propertyNftAddress: string;
  totalAmount: number;
  downPayment: number;
  interestRate: number;
  termMonths: number;
}

export interface TransactionResponse {
  success: boolean;
  transaction?: any;
  error?: any;
  listingId?: string;
}

// Rent Distribution DTO
export interface RentDto {
  propertyTokenAddress: string;  // Property token address
  userAddress: string;           // User address
  claimableAmount: string;       // Claimable rent amount (big number string)
  lastClaimTime: number;         // Last time rent was claimed
  formattedAmount?: string;      // Formatted amount for display
}

// User Token Balance DTO
export interface TokenBalanceDto {
  tokenAddress: string;      // Token contract address
  propertyName?: string;     // Property name for display
  propertyId?: string;       // NFT property ID
  balance: string;           // User's token balance (big number string)
  formattedBalance?: string; // Formatted balance for display
  percentage?: number;       // Ownership percentage
} 