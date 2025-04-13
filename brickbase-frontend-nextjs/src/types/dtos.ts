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
  id: string; // Changed from nftAddress to id to match backend data
  tokenId: number;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: any;
    }>;
  };
  totalSupply?: string; // Added as it's in the backend response
  tokenUri?: string; // Made optional as it's not in the backend response
  owner?: string; // Made optional as it's not in the backend response
  propertyDetails?: {
    physicalAddress: string;
    sqft: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    propertyType: string;
    associatedPropertyToken: string;
  };
}

// --- DAO DTOs ---

export interface ProposalDto {
  id: number; // Corresponds to proposal index
  proposer: string;
  description: string;
  targetContract: string;
  functionCallData: string;
  createdAt: Date;
  startBlock: string; // BigInt as string
  endBlock: string; // BigInt as string
  forVotes: string; // BigInt as string
  againstVotes: string; // BigInt as string
  abstainVotes: string; // BigInt as string
  isExecuted: boolean;
  isCancelled: boolean;
  currentState?: string; // Optional: Populate with getProposalState
  // Add other fields from backend entity if needed
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