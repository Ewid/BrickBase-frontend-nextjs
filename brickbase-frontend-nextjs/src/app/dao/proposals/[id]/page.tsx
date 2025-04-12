'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Loader2, AlertTriangle, ArrowLeft, Info, CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';
import { ProposalDto } from '@/types/dtos'; // Assuming ProposalDto covers all needed details
import { formatUnits } from 'ethers';
import Link from 'next/link';
import { useAccount, useWriteContract } from 'wagmi';
import DAO_ABI from '@/abis/PropertyDAO.json';
import { toast } from "sonner";

// --- Constants --- TODO: Move to config/env
const DAO_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS as `0x${string}` | undefined;

// Function to determine proposal status (can be shared or refined)
const getProposalStatus = (proposal: ProposalDto | null): { text: string; color: string; icon: React.ElementType } => {
    if (!proposal) return { text: 'Loading', color: 'text-gray-400', icon: Loader2 };
    // TODO: Refine status logic based on block numbers, timestamps, contract state() etc.
    if (proposal.isExecuted) return { text: 'Executed', color: 'text-green-400', icon: CheckCircle };
    if (proposal.isCancelled) return { text: 'Cancelled', color: 'text-red-400', icon: XCircle };
    // Placeholder for Active/Pending/Defeated etc.
    return { text: 'Active', color: 'text-blue-400', icon: Clock };
};

// --- Component --- 
const ProposalDetailPage = () => {
  const params = useParams();
  const proposalId = params.id as string; // Get ID from URL
  const { address: userAddress, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, isSuccess, isError, error: writeError } = useWriteContract();

  const [proposal, setProposal] = useState<ProposalDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteLoading, setVoteLoading] = useState(false); // Separate loading state for voting

  // Fetch proposal details
  useEffect(() => {
    if (!proposalId) return;
    // Ensure ABI is loaded, handle potential import error more gracefully if needed
    if (!DAO_ABI) {
        console.error("DAO ABI not found. Make sure src/abis/DAOABI.json exists.");
        setError("Application configuration error: Missing ABI.");
        setIsLoading(false);
        return;
    }
    if (!DAO_CONTRACT_ADDRESS) {
        console.error("DAO Contract Address not found. Make sure NEXT_PUBLIC_DAO_CONTRACT_ADDRESS is set.");
        setError("Application configuration error: Missing Contract Address.");
        setIsLoading(false);
        return;
    }

    const fetchProposalDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        // Assume an endpoint like /dao/proposals/:id exists
        const response = await fetch(`${apiUrl}/dao/proposals/${proposalId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Proposal not found.');
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ProposalDto = await response.json();
        setProposal(data);
      } catch (err: any) {
        console.error("Failed to fetch proposal details:", err);
        setError(err.message || 'Failed to load proposal details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposalDetails();
  }, [proposalId]);

  // Handle voting transaction submission
  const handleVote = async (support: 0 | 1 | 2) => { // 0: Against, 1: For, 2: Abstain
    if (!isConnected || !userAddress) {
        toast.error("Please connect your wallet to vote.");
        return;
    }
    // Double check config needed for the write operation
    if (!DAO_CONTRACT_ADDRESS || !DAO_ABI) {
        toast.error("DAO interaction is not configured correctly.");
        console.error("Missing DAO Contract address or ABI");
        return;
    }
    if (!proposal) return;

    console.log(`Attempting to vote ${support} on proposal ${proposalId} using contract ${DAO_CONTRACT_ADDRESS}`);

    writeContract({
        address: DAO_CONTRACT_ADDRESS,
        abi: DAO_ABI, // ABI should be loaded correctly here
        functionName: 'castVote',
        args: [BigInt(proposalId), support],
    });
  };

 useEffect(() => {
    if (isPending) {
        setVoteLoading(true);
        toast.loading("Submitting your vote...", { id: 'vote-toast' });
    }
     if (isSuccess) {
        setVoteLoading(false);
        toast.success("Vote submitted successfully!", { id: 'vote-toast', description: `Transaction: ${hash?.substring(0,10)}...` });
        // TODO: Optionally re-fetch proposal data or update UI optimistically
    }
    if (isError) {
        setVoteLoading(false);
        console.error("Voting Error:", writeError);
        // Use error.message instead of error.shortMessage
        toast.error("Vote failed", { id: 'vote-toast', description: writeError?.message || 'An unknown error occurred.' }); 
    }
  }, [isPending, isSuccess, isError, hash, writeError]);


  // --- Render Logic --- 
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-crypto-light" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20 text-red-500">
           <AlertTriangle className="h-12 w-12 mx-auto mb-2"/>
          <p>Error: {error}</p>
        </div>
      );
    }

    if (!proposal) {
        // This case should ideally be covered by the error state if fetch fails
      return <div className="text-center py-20 text-gray-400">Proposal data unavailable.</div>;
    }

    const status = getProposalStatus(proposal);
    const StatusIcon = status.icon;

    return (
         <Card className="glass-card border-0 overflow-hidden w-full max-w-3xl mx-auto">
              <CardHeader className="border-b border-gray-700/50 pb-4">
                <div className="flex justify-between items-start gap-4 mb-2">
                    {/* Use CardTitle as a component */}
                    <h2 className="text-2xl font-semibold leading-none tracking-tight text-white">Proposal #{proposal.id}</h2>
                    <span className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${status.color} bg-gray-800/60 whitespace-nowrap`}>
                        <StatusIcon className="h-4 w-4 mr-1.5" />
                        {status.text}
                    </span>
                </div>
                 {/* Use CardDescription as a component */}
                <p className="text-sm text-muted-foreground text-gray-300 pt-1">
                    Proposed by: <span className="font-mono text-xs bg-gray-800/50 px-1.5 py-0.5 rounded">{proposal.proposer}</span>
                </p>
              </CardHeader>
              <CardContent className="text-gray-300 pt-6 pb-6 space-y-4">
                <h4 className="font-semibold text-white mb-2">Description</h4>
                <p className="text-sm whitespace-pre-wrap">{proposal.description || "No description provided."}</p>

                <h4 className="font-semibold text-white mt-4 mb-2">Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <p>Target Contract: <span className="font-mono text-xs bg-gray-800/50 px-1.5 py-0.5 rounded">{proposal.targetContract}</span></p>
                     {/* TODO: Add more details like start/end blocks, eta, etc. if available in DTO */}
                     <p>Function Call Data: </p>
                     <pre className="font-mono text-xs bg-gray-800/50 p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap break-all col-span-full">{proposal.functionCallData}</pre>
                </div>

                 <h4 className="font-semibold text-white mt-4 mb-2">Current Votes</h4>
                 <div className="flex space-x-6 text-sm">
                     <span><ThumbsUp className="inline h-4 w-4 mr-1 text-green-400"/> For: {formatUnits(proposal.forVotes, 0)}</span>
                     <span><ThumbsDown className="inline h-4 w-4 mr-1 text-red-400"/> Against: {formatUnits(proposal.againstVotes, 0)}</span>
                     <span><MinusCircle className="inline h-4 w-4 mr-1 text-gray-400"/> Abstain: {formatUnits(proposal.abstainVotes, 0)}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-800/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <p className="text-sm text-gray-400">
                     {isConnected ? `Connected as: ${userAddress?.substring(0, 6)}...${userAddress?.substring(userAddress.length - 4)}` : "Connect wallet to vote"}
                 </p>
                <div className="flex gap-3">
                     {/* TODO: Check if user has already voted or if voting period is active */}
                     <Button 
                        variant="outline" 
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                        onClick={() => handleVote(0)} // 0 = Against
                        disabled={voteLoading || !isConnected || !proposal}
                    > 
                         {voteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsDown className="mr-2 h-4 w-4"/>}
                         Vote Against
                     </Button>
                     <Button 
                        variant="outline" 
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300 disabled:opacity-50"
                        onClick={() => handleVote(1)} // 1 = For
                        disabled={voteLoading || !isConnected || !proposal}
                    >
                         {voteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsUp className="mr-2 h-4 w-4"/>}
                         Vote For
                    </Button>
                     {/* Optional: Abstain Button */}
                     {/* <Button variant="outline" className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10 hover:text-gray-300">Vote Abstain</Button> */}
                </div>
              </CardFooter>
            </Card>
    );
  }

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Navbar />
      <main className="flex-grow pt-24 pb-10 px-6 w-full">
         <div className="max-w-3xl mx-auto mb-6">
             <Link href="/dao" className="inline-flex items-center text-sm text-crypto-light hover:text-crypto-purple mb-8 group">
                 <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                 Back to All Proposals
             </Link>
         </div>

        {renderContent()}

      </main>
      <Footer />
    </div>
  );
};

export default ProposalDetailPage; 