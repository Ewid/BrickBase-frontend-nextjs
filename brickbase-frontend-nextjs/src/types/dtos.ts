// src/types/dtos.ts
// Based on backend DTO definitions and context

// --- Marketplace DTOs ---

export interface ListingDto {
  id: number; // Corresponds to listing index in contract array
  nftAddress: string;
  tokenId: number; // Note: Backend determines this, might be 0 if multiple NFTs share token
  seller: string;
  propertyTokenAddress: string;
  amount: string; // Use string for BigInt representation
  pricePerToken: string; // Use string for BigInt representation
  isActive: boolean;
  createdAt: Date;
  // Add other fields from backend entity if needed
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
  nftAddress: string;
  tokenId: number;
  tokenUri: string;
  owner: string; // Owner of the NFT (contract likely)
  propertyDetails: {
    physicalAddress: string;
    sqft: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    propertyType: string; // e.g., "Residential", "Commercial"
    associatedPropertyToken: string; // Address of the ERC20 token
  };
  metadata?: Record<string, any>; // To store fetched IPFS metadata
  // Add other fields from backend entity if needed
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