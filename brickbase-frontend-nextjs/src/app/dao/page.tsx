'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // Assuming you have a Progress component
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, ThumbsUp, ThumbsDown, ExternalLink, Landmark } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';
import CONTRACT_CONFIG from '@/config/contracts'; // Assuming DAO address is in config
import PropertyDAOABI from '@/abis/PropertyDAO.json'; // Assuming you have the DAO ABI
import { toast } from '@/components/ui/use-toast'; // For notifications

// Interface based on the provided API response
interface Proposal {
    id: number;
    proposer: string;
    description: string;
    targetContract: string; // Might not be displayed directly but needed for context/execution
    functionCall: string;   // Might not be displayed directly
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [votingStates, setVotingStates] = useState<Record<number, boolean>>({}); // Track voting status per proposal

    const fetchProposals = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Use the correct API base URL if it's defined elsewhere, otherwise default
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/dao/proposals`);
            if (!response.ok) {
                throw new Error(`Failed to fetch proposals: ${response.statusText}`);
            }
            const data: Proposal[] = await response.json();
            // Sort proposals, maybe newest first? (Optional)
            // data.sort((a, b) => b.id - a.id); 
            setProposals(data);
        } catch (err: any) {
            console.error("Error fetching proposals:", err);
            setError(err.message || "Could not load proposals.");
            setProposals([]); // Clear proposals on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, []);

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
            fetchProposals(); // Refresh proposals after voting

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

    // --- Render Logic ---

    const renderProposalCard = (proposal: Proposal) => {
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

        return (
            <Card key={proposal.id} className="glass-card overflow-hidden flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg line-clamp-2">Proposal #{proposal.id}: {proposal.description}</CardTitle>
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
                        {/* Basic Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-l-full" 
                                style={{ width: `${forPercentage}%` }}
                            ></div>
                             {/* Optional: Show against bar if needed, adjust styling carefully */}
                             {/* <div 
                                className="bg-gradient-to-r from-red-500 to-rose-400 h-2.5" 
                                style={{ width: `${againstPercentage}%`, marginLeft: `${forPercentage}%` }} 
                            ></div> */}
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
                     {/* Placeholder Claim Rent Button */}
                     <Button 
                        onClick={handleClaimRent} 
                        className="crypto-btn"
                    >
                         <Landmark className="h-4 w-4 mr-2" /> 
                         Claim Rent (Placeholder)
                    </Button>
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
                        <Button onClick={fetchProposals} variant="outline" className="mt-6">
                            Retry
                        </Button>
                    </div>
                ) : proposals.length === 0 ? (
                     <div className="text-center py-20 text-gray-400">
                        <p>No active or past proposals found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {proposals.map(renderProposalCard)}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
} 