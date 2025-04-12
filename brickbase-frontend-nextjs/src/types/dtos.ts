// src/types/dtos.ts
// Based on backend DTO definitions and context

// --- Marketplace DTOs ---

export interface ListingDto {
  listingId: number; 
  nftAddress: string;
  tokenId: string; // Changed from number to string to match backend data
  seller: string;
  tokenAddress: string; // Changed from propertyTokenAddress to match backend
  amount: string; // Use string for BigInt representation
  pricePerToken: string; // Use string for BigInt representation
  active: boolean; // Changed from isActive to match backend
  createdAt?: Date; // Made optional as it's not in the backend response
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