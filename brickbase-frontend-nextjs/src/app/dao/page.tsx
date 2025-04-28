'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, ThumbsUp, ThumbsDown, ExternalLink, PlusCircle } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';
import CONTRACT_CONFIG from '@/config/contracts'; 
import PropertyDAOABI from '@/abis/PropertyDAO.json'; 
import { toast } from 'sonner'; 
import { PropertyDto } from '@/types/dtos'; 
import { getPropertyByTokenAddress } from '@/services/property'; 
import { tryConvertIpfsUrl } from '@/services/marketplace'; 
import Image from 'next/image'; 
import CreateProposalForm from '@/components/CreateProposalForm'; 
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"; 
import { getTokenBalance } from "@/services/marketplace"; 


interface Proposal {
    id: number;
    proposer: string;
    description: string;
    targetContract: string; 
    functionCall: string;   
    propertyTokenAddress?: string; 
    votesFor: string;       
    votesAgainst: string;   
    startTime: number;      
    endTime: number;        
    executed: boolean;
    passed: boolean;
    state: string;          
}


function shortenAddress(address: string): string {
  if (!address || !address.startsWith('0x')) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}


function formatTimestamp(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
  });
}


function getStatusVariant(state: string): "default" | "secondary" | "destructive" | "outline" {
    switch (state?.toLowerCase()) {
        case 'active': return 'default'; 
        case 'succeeded':
        case 'executed': return 'secondary'; 
        case 'defeated': return 'destructive'; 
        case 'queued': return 'outline'; 
        default: return 'outline';
    }
}


interface ToastMessage {
    type: 'success' | 'error' | 'info';
    title: string;
    description?: string;
}

export default function DaoPage() {
    const { account, isConnected } = useAccount();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [propertyDetailsCache, setPropertyDetailsCache] = useState<Record<string, PropertyDto | null>>({});
    const [userOwnedTokens, setUserOwnedTokens] = useState<PropertyDto[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isLoadingUserTokens, setIsLoadingUserTokens] = useState(false); 
    const [error, setError] = useState<string | null>(null);
    const [votingStates, setVotingStates] = useState<Record<number, boolean>>({});
    const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);
    
    const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

    const fetchProposalsAndDetails = async () => {
      setIsLoading(true);
        setIsLoadingDetails(true);
      setError(null);
      try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
            
            const proposalsResponse = await fetch(`${apiUrl}/dao/proposals`);
            if (!proposalsResponse.ok) {
                throw new Error(`Failed to fetch proposals: ${proposalsResponse.statusText}`);
            }
            const proposalsData: Proposal[] = await proposalsResponse.json();
            setProposals(proposalsData);

            
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

    
    const fetchUserOwnedTokens = async () => {
        if (!account) return;
        setIsLoadingUserTokens(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
        try {
            
            console.log(`DAO Page: Fetching properties owned by ${account}...`);
            const response = await fetch(`${apiUrl}/properties/owned/${account}`, {
                signal: AbortSignal.timeout(30000),
                next: { revalidate: 300 } 
            });
        if (!response.ok) {
                throw new Error(`Failed to fetch user properties: ${response.status} ${response.statusText}`);
            }
            const data: PropertyDto[] = await response.json();
            console.log('DAO Page: Properties owned by user:', data);
            setUserOwnedTokens(data);
        } catch (apiError) {
            console.warn('DAO Page: API endpoint /properties/owned failed, falling back to manual balance check:', apiError);
            
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
                            return property; 
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
        fetchProposalsAndDetails(); 
        if (isConnected && account) {
            fetchUserOwnedTokens(); 
        }
    }, [account, isConnected]); 

    
    useEffect(() => {
        if (toastMessage) {
            switch (toastMessage.type) {
                case 'success':
                    toast.success(toastMessage.title, { description: toastMessage.description });
                    break;
                case 'error':
                    toast.error(toastMessage.title, { description: toastMessage.description });
                    break;
                case 'info':
                    toast.info(toastMessage.title, { description: toastMessage.description });
                    break;
            }
            setToastMessage(null); 
        }
    }, [toastMessage]);

    

    const getDaoContract = async (signer: ethers.Signer) => {
        const daoAddress = CONTRACT_CONFIG.PROPERTY_DAO_ADDRESS; 
        if (!daoAddress) throw new Error("DAO Contract address not configured.");
        return new ethers.Contract(daoAddress, PropertyDAOABI, signer);
    };

    const handleVote = async (proposalId: number, support: boolean) => {
        if (!isConnected || !account) {
            setToastMessage({ type: 'error', title: "Connect Wallet", description: "Please connect your wallet to vote." });
            return;
        }
        if (votingStates[proposalId]) return; 

        setVotingStates(prev => ({ ...prev, [proposalId]: true }));
        try {
            if (!window.ethereum) throw new Error("No Ethereum provider found.");
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const contract = await getDaoContract(signer);

            console.log(`Casting vote for proposal ${proposalId}, support: ${support}`);
            const tx = await contract.castVote(proposalId, support);

            setToastMessage({ type: 'info', title: "Transaction Submitted", description: "Waiting for confirmation..." });

            await tx.wait(); 

            setToastMessage({ type: 'success', title: "Vote Cast Successfully!", description: `Your vote on proposal #${proposalId} has been recorded.` });
            fetchProposalsAndDetails(); 

        } catch (err: any) {
            
            let toastTitle = "Voting Failed";
            let toastDescription = err.reason || err.message || "An error occurred while casting your vote.";

            
            if (err.code === 4001 || err.message?.includes('User rejected') || err.message?.includes('User denied')) {
                toastTitle = "Transaction Rejected";
                toastDescription = "You rejected the transaction in your wallet.";
            }

            setToastMessage({ type: 'error', title: toastTitle, description: toastDescription });
        } finally {
             
             setTimeout(() => setVotingStates(prev => ({ ...prev, [proposalId]: false })), 0);
        }
    };

    
    const handleClaimRent = () => {
         if (!isConnected || !account) {
            setToastMessage({ type: 'error', title: "Connect Wallet", description: "Please connect your wallet to claim rent." });
            return;
        }
        console.log("Claim Rent button clicked - Implement actual logic");
        
        
        
        setToastMessage({ type: 'info', title: "Claim Rent (Not Implemented)", description: "Rent claiming functionality needs implementation." });
    };

    
    const handleCreateProposalClick = () => {
        if (!isConnected || !account) {
            setToastMessage({ type: 'error', title: "Connect Wallet", description: "Please connect your wallet to create a proposal." });
            return;
        }
        setShowCreateProposalModal(true); 
    };

    

    const renderProposalCard = ({ proposal }: { proposal: Proposal }) => {
        const votesFor = ethers.getBigInt(proposal.votesFor);
        const votesAgainst = ethers.getBigInt(proposal.votesAgainst);
        const totalVotes = votesFor + votesAgainst;
        const forPercentage = totalVotes > 0 ? Number((votesFor * BigInt(100)) / totalVotes) : 0;
        const againstPercentage = totalVotes > 0 ? 100 - forPercentage : 0;

        const now = Date.now() / 1000; 
        const isExpired = proposal.endTime < now;
        const isActive = proposal.state === 'Active' && !isExpired;
        
        
        const formattedVotesFor = parseFloat(ethers.formatUnits(votesFor, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 });
        const formattedVotesAgainst = parseFloat(ethers.formatUnits(votesAgainst, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 });

        
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
                          href={`https://${process.env.NEXT_PUBLIC_APP_URL}/address/${proposal.proposer}`}
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

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                           <span className='text-green-400'>For: {formattedVotesFor} ({forPercentage.toFixed(1)}%)</span>
                           <span className='text-red-400'>Against: {formattedVotesAgainst} ({againstPercentage.toFixed(1)}%)</span>
                        </div>
                        <div className="flex w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                           <div 
                             className="bg-green-500 transition-all duration-300 ease-in-out"
                             style={{ width: `${forPercentage}%` }}
                             title={`For: ${forPercentage.toFixed(1)}%`}
                           ></div>
                           <div 
                             className="bg-red-500 transition-all duration-300 ease-in-out"
                             style={{ width: `${againstPercentage}%` }}
                             title={`Against: ${againstPercentage.toFixed(1)}%`}
                           ></div>
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

            <Dialog open={showCreateProposalModal} onOpenChange={setShowCreateProposalModal}>
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