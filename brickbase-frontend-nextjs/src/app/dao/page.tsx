'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // Assuming you have a Progress component
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, ThumbsUp, ThumbsDown, ExternalLink, Landmark, PlusCircle } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';
import CONTRACT_CONFIG from '@/config/contracts'; // Assuming DAO address is in config
import PropertyDAOABI from '@/abis/PropertyDAO.json'; // Assuming you have the DAO ABI
import { toast } from '@/components/ui/use-toast'; // For notifications
import { PropertyDto } from '@/types/dtos'; // Import PropertyDto
import { getPropertyByTokenAddress } from '@/services/property'; // Import property service function
import { tryConvertIpfsUrl } from '@/services/marketplace'; // For image URLs
import Image from 'next/image'; // For displaying images
import CreateProposalForm from '@/components/CreateProposalForm'; // Import the new form
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"; // Assuming shadcn dialog components
import { getTokenBalance, formatCurrency } from "@/services/marketplace"; // For fallback balance check

// Interface based on the provided API response
interface Proposal {
    id: number;
    proposer: string;
    description: string;
    targetContract: string; // Might not be displayed directly but needed for context/execution
    functionCall: string;   // Might not be displayed directly
    propertyTokenAddress?: string; // Added optional field for associated property
    votesFor: string;       // BigInt as string
    votesAgainst: string;   // BigInt as string
    startTime: number;      // Unix timestamp
    endTime: number;        // Unix timestamp
    executed: boolean;
    passed: boolean;
    state: string;          // e.g., "Active", "Succeeded", "Defeated", "Executed"
}

// Helper function to shorten addresses
function shortenAddress(address: string): string {
  if (!address || !address.startsWith('0x')) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper function to format dates
function formatTimestamp(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
  });
}

// Helper function to get status badge styles
function getStatusVariant(state: string): "default" | "secondary" | "destructive" | "outline" {
    switch (state?.toLowerCase()) {
        case 'active': return 'default'; // Blue/Primary
        case 'succeeded':
        case 'executed': return 'secondary'; // Green (using secondary for now, adjust if you have a green variant)
        case 'defeated': return 'destructive'; // Red
        case 'queued': return 'outline'; // Gray/Outline
        default: return 'outline';
    }
}

export default function DaoPage() {
    const { account, isConnected } = useAccount();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [propertyDetailsCache, setPropertyDetailsCache] = useState<Record<string, PropertyDto | null>>({});
    const [userOwnedTokens, setUserOwnedTokens] = useState<PropertyDto[]>([]); // State for user's owned tokens
  const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isLoadingUserTokens, setIsLoadingUserTokens] = useState(false); // Loading state for user tokens
  const [error, setError] = useState<string | null>(null);
    const [votingStates, setVotingStates] = useState<Record<number, boolean>>({});
    const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);

    const fetchProposalsAndDetails = async () => {
      setIsLoading(true);
        setIsLoadingDetails(true);
      setError(null);
      try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
            // Fetch proposals
            const proposalsResponse = await fetch(`${apiUrl}/dao/proposals`);
            if (!proposalsResponse.ok) {
                throw new Error(`Failed to fetch proposals: ${proposalsResponse.statusText}`);
            }
            const proposalsData: Proposal[] = await proposalsResponse.json();
            setProposals(proposalsData);

            // Fetch Property Details for proposals
            const tokenAddresses = Array.from(new Set(proposalsData.map(p => p.propertyTokenAddress).filter(Boolean))) as string[];
            const detailsPromises = tokenAddresses.map(addr =>
                getPropertyByTokenAddress(addr).catch(err => {
                    console.warn(`Failed to fetch details for token ${addr}:`, err);
                    return null;
                })
            );
            const detailsResults = await Promise.all(detailsPromises);
            const newDetailsCache: Record<string, PropertyDto | null> = {};
            tokenAddresses.forEach((addr, index) => {
                newDetailsCache[addr] = detailsResults[index];
            });
            setPropertyDetailsCache(newDetailsCache);

        } catch (err: any) {
            console.error("Error fetching proposals or details:", err);
            setError(err.message || "Could not load proposals.");
            setProposals([]);
            setPropertyDetailsCache({});
        } finally {
            setIsLoading(false);
            setIsLoadingDetails(false);
        }
    };

    // Fetch user's owned property tokens (similar to MarketplacePage)
    const fetchUserOwnedTokens = async () => {
        if (!account) return;
        setIsLoadingUserTokens(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        try {
            // Prefer the dedicated endpoint
            console.log(`DAO Page: Fetching properties owned by ${account}...`);
            const response = await fetch(`${apiUrl}/properties/owned/${account}`, {
                signal: AbortSignal.timeout(30000),
                next: { revalidate: 300 } // Revalidate cache every 5 minutes
            });
        if (!response.ok) {
                throw new Error(`Failed to fetch user properties: ${response.status} ${response.statusText}`);
            }
            const data: PropertyDto[] = await response.json();
            console.log('DAO Page: Properties owned by user:', data);
            setUserOwnedTokens(data);
        } catch (apiError) {
            console.warn('DAO Page: API endpoint /properties/owned failed, falling back to manual balance check:', apiError);
            // Fallback logic (might be less efficient)
            try {
                 const allPropertiesResponse = await fetch(`${apiUrl}/properties`, {
                    signal: AbortSignal.timeout(30000),
                    next: { revalidate: 300 }
                });
                if (!allPropertiesResponse.ok) {
                    throw new Error(`Fallback failed: Could not fetch all properties: ${allPropertiesResponse.statusText}`);
                }
                const allProperties: PropertyDto[] = await allPropertiesResponse.json();
                
                const ownedChecks = allProperties.map(async (property) => {
                    const tokenAddress = property.tokenAddress || property.propertyDetails?.associatedPropertyToken;
                    if (!tokenAddress) return null;
                    try {
                        const balance = await getTokenBalance(tokenAddress, account);
                        if (ethers.getBigInt(balance) > 0) {
                            return property; // Keep the original PropertyDto structure
                        }
                        return null;
                    } catch (balanceError) {
                        console.error(`Error checking balance for ${tokenAddress}:`, balanceError);
                        return null;
                    }
                });

                const ownedResults = await Promise.all(ownedChecks);
                const filteredOwned = ownedResults.filter((p): p is PropertyDto => p !== null);
                console.log('DAO Page: Properties owned by user (fallback method):', filteredOwned);
                setUserOwnedTokens(filteredOwned);
            } catch (fallbackError: any) {
                 console.error('DAO Page: Error fetching user properties (including fallback):', fallbackError);
                 setError(fallbackError.message || "Could not load your properties.");
                 setUserOwnedTokens([]);
            }
        }
        finally {
            setIsLoadingUserTokens(false);
        }
    };

    useEffect(() => {
        fetchProposalsAndDetails(); // Fetch proposals and their details
        if (isConnected && account) {
            fetchUserOwnedTokens(); // Fetch user tokens when connected
        }
    }, [account, isConnected]); // Add dependencies

    // --- Smart Contract Interactions (Stubs) ---

    const getDaoContract = async (signer: ethers.Signer) => {
        const daoAddress = CONTRACT_CONFIG.PROPERTY_DAO_ADDRESS; // Make sure this exists in your config
        if (!daoAddress) throw new Error("DAO Contract address not configured.");
        return new ethers.Contract(daoAddress, PropertyDAOABI, signer);
    };

    const handleVote = async (proposalId: number, support: boolean) => {
        if (!isConnected || !account) {
            toast({ title: "Connect Wallet", description: "Please connect your wallet to vote.", variant: "destructive" });
            return;
        }
        if (votingStates[proposalId]) return; // Prevent double voting while processing

        setVotingStates(prev => ({ ...prev, [proposalId]: true }));
        try {
            if (!window.ethereum) throw new Error("No Ethereum provider found.");
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const contract = await getDaoContract(signer);

            console.log(`Casting vote for proposal ${proposalId}, support: ${support}`);
            const tx = await contract.castVote(proposalId, support);
            
            toast({ title: "Transaction Submitted", description: "Waiting for confirmation..." });
            
            await tx.wait(); // Wait for transaction confirmation

            toast({ title: "Vote Cast Successfully!", description: `Your vote on proposal #${proposalId} has been recorded.` });
            fetchProposalsAndDetails(); // Use the renamed function

      } catch (err: any) {
            console.error("Voting failed:", err);
            toast({
                title: "Voting Failed",
                description: err.reason || err.message || "An error occurred while casting your vote.",
                variant: "destructive"
            });
      } finally {
             setVotingStates(prev => ({ ...prev, [proposalId]: false }));
        }
    };

    // Placeholder - Actual claim rent logic might belong elsewhere or need more context
    const handleClaimRent = () => {
         if (!isConnected || !account) {
            toast({ title: "Connect Wallet", description: "Please connect your wallet to claim rent.", variant: "destructive" });
            return;
        }
        console.log("Claim Rent button clicked - Implement actual logic");
        // TODO: Implement interaction with RentDistribution contract
        // Needs to know WHICH property token address to claim for.
        // This might involve fetching user's owned tokens and their claimable amounts separately.
        toast({ title: "Claim Rent (Not Implemented)", description: "Rent claiming functionality needs implementation.", variant: "default" });
    };

    // Placeholder - Needs implementation (modal or new page)
    const handleCreateProposalClick = () => {
        if (!isConnected || !account) {
            toast({ title: "Connect Wallet", description: "Please connect your wallet to create a proposal.", variant: "destructive" });
            return;
        }
        setShowCreateProposalModal(true); // Open the modal
    };

    // --- Render Logic ---

    const renderProposalCard = ({ proposal }: { proposal: Proposal }) => {
        const votesFor = ethers.getBigInt(proposal.votesFor);
        const votesAgainst = ethers.getBigInt(proposal.votesAgainst);
        const totalVotes = votesFor + votesAgainst;
        const forPercentage = totalVotes > 0 ? Number((votesFor * BigInt(100)) / totalVotes) : 0;
        const againstPercentage = totalVotes > 0 ? 100 - forPercentage : 0;

        const now = Date.now() / 1000; // Current time in seconds
        const isExpired = proposal.endTime < now;
        const isActive = proposal.state === 'Active' && !isExpired;
        
        // Format votes for display (using ethers utils)
        const formattedVotesFor = parseFloat(ethers.formatUnits(votesFor, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 });
        const formattedVotesAgainst = parseFloat(ethers.formatUnits(votesAgainst, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 });

        // Get property details from cache
        const propertyDetails = proposal.propertyTokenAddress ? propertyDetailsCache[proposal.propertyTokenAddress] : null;
        const propertyImageUrl = propertyDetails?.metadata?.image ? tryConvertIpfsUrl(propertyDetails.metadata.image) : null;
        const propertyName = propertyDetails?.metadata?.name;

    return (
            <Card key={proposal.id} className="glass-card bg-gray-900/70 border border-white/10 overflow-hidden flex flex-col">
                <CardHeader>
                    {/* Display Property Image and Name if available */} 
                    {proposal.propertyTokenAddress && (
                        <div className="mb-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50 flex items-center gap-3">
                            {isLoadingDetails ? (
                                <div className="w-12 h-12 rounded-md bg-gray-700 animate-pulse"></div>
                            ) : propertyImageUrl ? (
                                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                    <Image 
                                        src={propertyImageUrl} 
                                        alt={propertyName || 'Property Image'} 
                                        fill 
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                                    No Img
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Related Property:</p>
                                <p className="text-sm font-semibold text-white line-clamp-1" title={propertyName || 'Loading...'}>
                                    {isLoadingDetails ? 'Loading...' : (propertyName || 'Details unavailable')}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg line-clamp-2 text-white">Proposal #{proposal.id}: {proposal.description}</CardTitle>
                        <Badge variant={getStatusVariant(proposal.state)}>{proposal.state}</Badge>
                </div>
                    <CardDescription className="text-xs text-gray-400 pt-1">
                        Proposed by: 
                        <a 
                          href={`https://basescan.org/address/${proposal.proposer}`} // Assuming Base Sepolia explorer
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:underline ml-1"
                        >
                          {shortenAddress(proposal.proposer)}
                          <ExternalLink className="inline-block h-3 w-3 ml-1" />
                        </a>
                    </CardDescription>
                     <CardDescription className="text-xs text-gray-400 pt-1">
                        Voting ends: {formatTimestamp(proposal.endTime)}
                    </CardDescription>
              </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    {/* Optional: Display target contract/function if needed */}
                    {/* <div className="text-xs text-gray-500 break-all">
                        <p>Target: {proposal.targetContract}</p>
                        <p>Call Data: {proposal.functionCall.substring(0, 30)}...</p>
                    </div> */}

                    {/* Vote Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                           <span className='text-green-400'>For: {formattedVotesFor}</span>
                           <span className='text-red-400'>Against: {formattedVotesAgainst}</span>
                        </div>
                        {/* Basic Progress Bar - Styles updated in progress.tsx */}
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <Progress value={forPercentage} className="h-2.5" />
                        </div>
                    </div>
              </CardContent>
                <CardFooter className="flex justify-end gap-3">
                    {isActive ? (
                        <>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleVote(proposal.id, false)}
                                disabled={!isConnected || votingStates[proposal.id]}
                                className="border-red-500/50 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                            >
                                {votingStates[proposal.id] ? <Loader2 className="h-4 w-4 animate-spin"/> : <ThumbsDown className="h-4 w-4 mr-2" />}
                                Vote Against
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleVote(proposal.id, true)}
                                disabled={!isConnected || votingStates[proposal.id]}
                                className="border-green-500/50 text-green-400 hover:bg-green-900/30 hover:text-green-300"
                            >
                               {votingStates[proposal.id] ? <Loader2 className="h-4 w-4 animate-spin"/> : <ThumbsUp className="h-4 w-4 mr-2" />}
                                Vote For
                     </Button>
                        </>
                    ) : (
                        <span className="text-sm text-gray-500 italic">
                            {isExpired && proposal.state !== 'Executed' ? 'Voting Ended' : `Status: ${proposal.state}`}
                        </span>
                    )}
              </CardFooter>
            </Card>
          );
    };

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Navbar />
            <main className="pt-24 pb-10 px-6 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                    <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">DAO <span className="text-gradient">Governance</span></h1>
                        <p className="text-gray-400">Review and vote on proposals for the Property DAO.</p>
          </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Create Proposal Button */}
                        <Button 
                            onClick={handleCreateProposalClick} 
                            className="crypto-btn"
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                  Create Proposal
                </Button>
                    </div>
        </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-crypto-light" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-400 bg-red-900/20 rounded-lg p-6">
                        <AlertCircle className="h-10 w-10 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Failed to Load Proposals</h3>
                        <p>{error}</p>
                        <Button onClick={fetchProposalsAndDetails} variant="outline" className="mt-6">
                            Retry
                        </Button>
                    </div>
                ) : proposals.length === 0 ? (
                     <div className="text-center py-20 text-gray-400">
                        <p>No active or past proposals found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {proposals.map(proposal => renderProposalCard({ proposal }))}
                    </div>
                )}
      </main>
      <Footer />

            {/* Create Proposal Modal */}
            <Dialog open={showCreateProposalModal} onOpenChange={setShowCreateProposalModal}>
                {/* Apply EXACT className from marketplace modal */}
                <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-gray-900 to-gray-950 border-blue-900/50 rounded-xl backdrop-blur-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Create New Proposal</DialogTitle>
                        <DialogDescription className="text-gray-300">
                            Fill in the details below to submit a new governance proposal.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <CreateProposalForm
                            onSuccess={() => {
                                setShowCreateProposalModal(false);
                                fetchProposalsAndDetails();
                            }}
                            onClose={() => setShowCreateProposalModal(false)}
                            ownedTokens={userOwnedTokens}
                        />
                    </div>
                </DialogContent>
            </Dialog>
    </div>
  );
} 