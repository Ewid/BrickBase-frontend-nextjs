'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Loader2, AlertTriangle, Vote, PlusCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ProposalDto } from '@/types/dtos';
import { formatUnits } from 'ethers';
import Link from 'next/link'; // Import Link

// Function to determine proposal status badge
const getProposalStatus = (proposal: ProposalDto): { text: string; color: string; icon: React.ElementType } => {
    // TODO: Replace with actual logic based on block numbers / contract state
    // This is placeholder logic
    if (proposal.isExecuted) return { text: 'Executed', color: 'text-green-400', icon: CheckCircle };
    if (proposal.isCancelled) return { text: 'Cancelled', color: 'text-red-400', icon: XCircle };
    // Assume active for now
    return { text: 'Active', color: 'text-blue-400', icon: Clock }; 
};

const DaoPage = () => {
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/dao/proposals`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ProposalDto[] = await response.json();
        setProposals(data);
      } catch (err: any) {
        console.error("Failed to fetch proposals:", err);
        setError(err.message || 'Failed to load proposals.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-crypto-light" />
          <p className="ml-4 text-lg text-gray-400">Loading Proposals...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20 text-red-500">
           <AlertTriangle className="h-12 w-12 mx-auto mb-2"/>
          <p>Error loading proposals: {error}</p>
        </div>
      );
    }

    if (proposals.length === 0) {
      return (
        <div className="text-center py-20 text-gray-400">
          <Vote className="h-12 w-12 mx-auto mb-4 opacity-50"/>
          <p>No proposals found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {proposals.map(proposal => {
          const status = getProposalStatus(proposal);
          const StatusIcon = status.icon;
          return (
            <Card key={proposal.id} className="glass-card border-0 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg text-white">Proposal #{proposal.id}: {proposal.description.substring(0, 100)}{proposal.description.length > 100 ? '...' : ''}</h3>
                    <span className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${status.color} bg-gray-800/60 whitespace-nowrap`}>
                        <StatusIcon className="h-4 w-4 mr-1.5" />
                        {status.text}
                    </span>
                </div>
                <p className="text-xs text-gray-400 pt-1">Proposed by: {proposal.proposer}</p>
              </CardHeader>
              <CardContent className="text-sm text-gray-300 pb-4">
                {/* Display simplified details, more on dedicated page */} 
                 <p className="mb-1">Target: {proposal.targetContract}</p>
                 <p>Function Data: {proposal.functionCallData.substring(0, 40)}...</p>
              </CardContent>
              <CardFooter className="bg-gray-800/30 px-6 py-3 flex justify-between items-center">
                <div className="text-xs text-gray-400 space-x-4">
                    <span>For: {formatUnits(proposal.forVotes, 0)}</span> {/* Assuming 0 decimals for vote counts */} 
                    <span>Against: {formatUnits(proposal.againstVotes, 0)}</span>
                    <span>Abstain: {formatUnits(proposal.abstainVotes, 0)}</span>
                </div>
                 {/* Use Link component to wrap the Button */}
                 <Link href={`/dao/proposals/${proposal.id}`} passHref>
                     <Button variant="outline" size="sm" className="border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10">
                         View / Vote
                     </Button>
                 </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Navbar />
      <main className="flex-grow pt-24 pb-10 px-6 max-w-4xl mx-auto w-full">
         <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">DAO <span className="text-gradient">Governance</span></h1>
            <p className="text-gray-400">Vote on proposals and shape the future of BrickBase</p>
          </div>
           {/* Link the Button to the creation page */}
           <Link href="/dao/proposals/create" passHref>
               <Button className="crypto-btn">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Proposal
                </Button>
           </Link>
        </div>

        {renderContent()}

      </main>
      <Footer />
    </div>
  );
};

export default DaoPage; 