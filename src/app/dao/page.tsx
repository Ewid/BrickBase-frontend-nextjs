'use client';

import React, { useState, useEffect, CSSProperties } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Loader2, AlertCircle, ThumbsUp, ThumbsDown, ExternalLink, PlusCircle, 
  Building2, Hexagon, Shield, Clock, BarChart3, Activity, Landmark, 
  Users, Lock, Zap, Globe, RefreshCcw,
  PauseCircle, Hourglass, XCircle, PlayCircle, CheckCircle
} from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


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


function getStatusColor(state: string): string {
    switch (state?.toLowerCase()) {
        case 'active': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'; 
        case 'succeeded': return 'text-green-400 bg-green-500/20 border-green-500/30';
        case 'executed': return 'text-green-400 bg-green-500/20 border-green-500/30'; 
        case 'defeated': return 'text-red-400 bg-red-500/20 border-red-500/30'; 
        case 'queued': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'; 
        case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
        case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
        case 'ready': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
        default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
}


function getStatusIcon(state: string): React.ReactNode {
    switch (state?.toLowerCase()) {
        case 'active': return <Clock className="h-3 w-3 mr-1" />; 
        case 'succeeded': return <ThumbsUp className="h-3 w-3 mr-1" />;
        case 'executed': return <Shield className="h-3 w-3 mr-1" />; 
        case 'defeated': return <ThumbsDown className="h-3 w-3 mr-1" />; 
        case 'queued': return <Clock className="h-3 w-3 mr-1" />; 
        case 'pending': return <Hourglass className="h-3 w-3 mr-1" />;
        case 'rejected': return <XCircle className="h-3 w-3 mr-1" />;
        case 'ready': return <PlayCircle className="h-3 w-3 mr-1" />;
        default: return <Activity className="h-3 w-3 mr-1" />;
    }
}


interface ToastMessage {
    type: 'success' | 'error' | 'info';
    title: string;
    description?: string;
}


interface ProposalCardProps {
  proposal: Proposal;
  propertyDetailsCache: Record<string, PropertyDto | null>;
  isLoadingDetails: boolean;
  votingStates: Record<number, boolean>;
  handleVote: (proposalId: number, support: boolean) => Promise<void>;
  isConnected: boolean;
}


// Particle animation component for background effects
const ParticleBackground = () => {
  const [particles, setParticles] = useState<CSSProperties[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [...Array(30)].map((_, i) => ({
        width: `${Math.random() * 4 + 1}px`,
        height: `${Math.random() * 4 + 1}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.5 + 0.3,
        animation: `float ${Math.random() * 10 + 10}s linear infinite`,
        animationDelay: `${Math.random() * 5}s`
      }));
      setParticles(newParticles);
    };

    // Generate particles only on the client side
    if (typeof window !== 'undefined') {
      generateParticles();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none -z-20">
      <div className="absolute w-full h-full">
        {particles.map((style, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-400"
            style={style}
          />
        ))}
      </div>
    </div>
  );
};


// Animated network nodes for the empty state
const NetworkNodes = () => {
  return (
    <div className="relative w-full h-40 my-6">
      {[...Array(6)].map((_, i) => {
        const size = Math.random() * 20 + 10;
        const x = 20 + (i * 60) % 300;
        const y = 20 + Math.random() * 80;
        
        return (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-500/30 border border-blue-500/50 flex items-center justify-center"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `calc(50% - 150px + ${x}px)`,
              top: `${y}px`,
              animation: `pulse-slow ${Math.random() * 3 + 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            {i % 2 === 0 && <Building2 className="h-3 w-3 text-blue-400" />}
            {i % 3 === 0 && <Hexagon className="h-3 w-3 text-purple-400" />}
            {i % 3 === 1 && <Landmark className="h-3 w-3 text-cyan-400" />}
          </div>
        );
      })}
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        <line x1="calc(50% - 130px)" y1="40" x2="calc(50% - 70px)" y2="60" className="stroke-blue-500/30 stroke-1" />
        <line x1="calc(50% - 70px)" y1="60" x2="calc(50% - 10px)" y2="30" className="stroke-blue-500/30 stroke-1" />
        <line x1="calc(50% - 10px)" y1="30" x2="calc(50% + 50px)" y2="70" className="stroke-blue-500/30 stroke-1" />
        <line x1="calc(50% + 50px)" y1="70" x2="calc(50% + 110px)" y2="40" className="stroke-blue-500/30 stroke-1" />
        <line x1="calc(50% - 130px)" y1="40" x2="calc(50% + 50px)" y2="70" className="stroke-blue-500/30 stroke-1" />
      </svg>
    </div>
  );
};


// Circular progress indicator
// Updated color prop type to be specific
const CircularProgress = ({ value = 0, size = 32, strokeWidth = 3, color: initialColor = "blue" }: { value?: number, size?: number, strokeWidth?: number, color?: 'blue' | 'green' | 'red' | 'purple' }) => { 
  // Ensure the local variable has the restricted type
  const color: 'blue' | 'green' | 'red' | 'purple' = initialColor;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  // Explicitly type the colorClasses object
  const colorClasses: {
      blue: string;
      green: string;
      red: string;
      purple: string;
  } = {
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    purple: "text-purple-500"
  };
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={colorClasses[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Now TS knows 'color' is a valid key for colorClasses */}
      <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${colorClasses[color]}`}>
        {Math.round(value)}%
      </div>
    </div>
  );
};


// Countdown timer component
const CountdownTimer = ({ endTime }: { endTime: number }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = endTime - now;
      
      if (difference <= 0) {
        setTimeLeft('Ended');
        return;
      }
      
      const days = Math.floor(difference / 86400);
      const hours = Math.floor((difference % 86400) / 3600);
      const minutes = Math.floor((difference % 3600) / 60);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [endTime]);
  
  return (
    <span className="text-xs font-medium flex items-center">
      <Clock className="h-3 w-3 mr-1 text-blue-400" />
      {timeLeft}
    </span>
  );
};


// ProposalCard component
const ProposalCard = ({ 
  proposal, 
  propertyDetailsCache, 
  isLoadingDetails, 
  votingStates, 
  handleVote, 
  isConnected 
}: ProposalCardProps) => {
    
    // Card tilt effect state and handlers (Now safe to use Hooks here)
    const [tiltStyle, setTiltStyle] = useState({});
    const [isHovering, setIsHovering] = useState(false);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 30;
      const rotateY = (centerX - x) / 30;
      
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: 'transform 0.1s ease'
      });
    };
    
    const handleMouseLeave = () => {
      setIsHovering(false);
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.5s ease'
      });
    };

    // Calculation logic moved from DaoPage's renderProposalCard
    const votesFor = ethers.getBigInt(proposal.votesFor);
    const votesAgainst = ethers.getBigInt(proposal.votesAgainst);
    const totalVotes = votesFor + votesAgainst;
    const forPercentage = totalVotes > 0 ? Number((votesFor * BigInt(100)) / totalVotes) : 0;
    const againstPercentage = totalVotes > 0 ? 100 - forPercentage : 0;

    const now = Date.now() / 1000; 
    const isExpired = proposal.endTime < now;
    const isActive = proposal.state.toLowerCase() === 'active' && !isExpired; // Ensure case-insensitive check
    
    const formattedVotesFor = parseFloat(ethers.formatUnits(votesFor, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 });
    const formattedVotesAgainst = parseFloat(ethers.formatUnits(votesAgainst, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 });
    
    const propertyDetails = proposal.propertyTokenAddress ? propertyDetailsCache[proposal.propertyTokenAddress] : null;
    const propertyImageUrl = propertyDetails?.metadata?.image ? tryConvertIpfsUrl(propertyDetails.metadata.image) : null;
    const propertyName = propertyDetails?.metadata?.name;

    // --- Add Logging --- 
    useEffect(() => {
      console.log(`ProposalCard ID ${proposal.id}: Using address ${proposal.propertyTokenAddress}. Found details:`, propertyDetails);
    }, [proposal.id, proposal.propertyTokenAddress, propertyDetails]);
    // --- End Logging ---

    return (
        <Card 
          key={proposal.id}
          className="bg-gray-800/40 backdrop-blur-md border border-blue-500/20 rounded-xl overflow-hidden flex flex-col group relative transition-all duration-300 hover:shadow-blue-500/20 hover:shadow-lg"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          style={tiltStyle}
        >
            <ParticleBackground />
            
            {/* Enhanced hover gradient border */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur opacity-0 transition-all duration-300 group-hover:opacity-75 -z-10`}></div>
            
            <CardHeader className="relative z-10 p-4"> 
                {/* Badges */} 
                <div className="flex justify-between items-start mb-3">
                    {/* Enhanced Proposal ID Badge */}
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900/70 border border-blue-400/30 text-blue-300 shadow-md transition-all duration-300 group-hover:shadow-blue-500/30 group-hover:border-blue-400/50">
                        <Hexagon className="h-3 w-3 mr-1.5 text-blue-400" />
                        Proposal #{proposal.id}
                    </div>
                    {/* Enhanced Status Badge */}
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.state)} border ${getStatusBorderColor(proposal.state)} shadow-md transition-all duration-300 group-hover:shadow-lg`}>
                        {getStatusIcon(proposal.state)}
                        {proposal.state}
                    </div>
                </div>
                
                {/* Property Info Section */}
                {proposal.propertyTokenAddress && (
                    <div className="mt-10 mb-3 p-3 bg-gray-800/40 rounded-lg border border-blue-500/20 flex items-center gap-3 backdrop-blur-sm shadow-inner">
                        {isLoadingDetails ? (
                            <div className="w-12 h-12 rounded-md bg-gray-700 animate-pulse flex-shrink-0"></div>
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
                            <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                                <Building2 className="h-6 w-6 text-gray-600" />
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-xs text-blue-400 mb-0.5 flex items-center">
                                <Landmark className="h-3 w-3 mr-1 flex-shrink-0" />
                                Related Property
                            </p>
                            <p className="text-sm font-semibold text-white line-clamp-1" title={propertyName || 'Loading...'}>
                                {isLoadingDetails ? 'Loading...' : (propertyName || 'Details unavailable')}
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Title and Proposer */}
                <div className="pt-2"> 
                    <CardTitle className="text-lg line-clamp-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                        {proposal.description}
                    </CardTitle>
                </div>
                
                <div className="flex justify-between items-center mt-2 text-xs">
                    <CardDescription className="text-gray-400 flex items-center">
                        <Users className="h-3 w-3 mr-1.5 text-blue-400" />
                        <span>Proposed by:</span> 
                        <a 
                          href={`https://basescan.org/address/${proposal.proposer}`} // Assuming BaseScan
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="blockchain-address ml-1.5 bg-gray-800/60 text-blue-300 hover:text-blue-200"
                        >
                          {shortenAddress(proposal.proposer)}
                          <ExternalLink className="inline-block h-3 w-3 ml-1" />
                        </a>
                    </CardDescription>
                    
                    <CountdownTimer endTime={proposal.endTime} />
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-2 space-y-4 relative z-10">
                <div className="space-y-3">
                     {/* Vote Circles & Numbers */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <CircularProgress value={forPercentage} color="green" size={36} strokeWidth={3}/>
                            <p className="text-xs text-gray-400">For</p>
                            <p className="text-sm font-medium text-green-400">{formattedVotesFor}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Against</p>
                                <p className="text-sm font-medium text-red-400">{formattedVotesAgainst}</p>
                            </div>
                            <CircularProgress value={againstPercentage} color="red" size={36} strokeWidth={3}/>
                        </div>
                    </div>
                    
                     {/* Enhanced Progress Bar */}
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative h-2.5 rounded-full bg-gray-800/70 overflow-hidden border border-gray-700/50 shadow-inner">
                              <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-l-full transition-all duration-500 ease-out shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                                style={{ width: `${forPercentage}%` }}
                              ></div>
                              <div 
                                className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-600 to-pink-500 rounded-r-full transition-all duration-500 ease-out shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                                style={{ width: `${againstPercentage}%`, left: `${forPercentage}%` }}
                              ></div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p>For: {formattedVotesFor} ({forPercentage.toFixed(1)}%) | Against: {formattedVotesAgainst} ({againstPercentage.toFixed(1)}%)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 p-4 relative z-10 border-t border-blue-500/20 mt-auto">
                {/* Target Contract Info (if applicable) */} 
                {proposal.targetContract && proposal.targetContract !== ethers.ZeroAddress && (
                    <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-xs backdrop-blur-sm shadow-inner">
                        <div className="flex items-center text-gray-400 mb-1">
                            <Landmark className="h-3 w-3 mr-1.5 text-blue-400" />
                            Target Contract
                        </div>
                        <p className="text-sm font-semibold text-white line-clamp-1" title={proposal.targetContract}>
                            {proposal.targetContract}
                        </p>
                    </div>
                )}
                
                {/* Footer: Proposer & Actions */} 
                {isActive ? (
                    <div className="flex gap-3 w-full">
                        {/* Updated Vote Against Button Style */}
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVote(proposal.id, false)}
                            disabled={!isConnected || votingStates[proposal.id]}
                            className="flex-1 bg-red-900/20 border-red-500/40 text-red-400 hover:bg-red-900/40 hover:text-red-300 hover:border-red-500/60 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] focus:outline-none transition-all duration-300 shadow-md group relative overflow-hidden"
                        >
                            {votingStates[proposal.id] ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ThumbsDown className="h-4 w-4 mr-2" />}
                            Vote Against
                            <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-focus:opacity-100"></span>
                        </Button>
                         {/* Updated Vote For Button Style */}
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleVote(proposal.id, true)}
                            disabled={!isConnected || votingStates[proposal.id]}
                            className="flex-1 bg-green-900/20 border-green-500/40 text-green-400 hover:bg-green-900/40 hover:text-green-300 hover:border-green-500/60 focus:shadow-[0_0_15px_rgba(34,197,94,0.5)] focus:outline-none transition-all duration-300 shadow-md group relative overflow-hidden"
                        >
                            {votingStates[proposal.id] ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
                            Vote For
                            <span className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-focus:opacity-100"></span>
                        </Button>
                    </div>
                ) : proposal.state.toLowerCase() === 'ready' ? (
                    <Button 
                        variant="outline"
                        disabled
                        className="w-full border-purple-500/30 bg-purple-950/20 text-purple-400 cursor-not-allowed shadow-inner hover:bg-purple-950/30 hover:text-purple-300 hover:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 cursor-pointer shadow-md"
                    >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Execute Proposal
                    </Button>
                ) : (
                    <div className="border border-gray-700/30 rounded-md p-2 bg-gray-800/20 backdrop-blur-sm w-full shadow-inner">
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span className="flex items-center">
                                <Activity className="h-3 w-3 mr-1 text-gray-500" />
                                Final Status:
                            </span>
                            <span className={`font-medium ${
                                proposal.state.toLowerCase() === 'executed' ? 'text-green-400' : 
                                proposal.state.toLowerCase() === 'rejected' ? 'text-red-400' : 
                                proposal.state.toLowerCase() === 'pending' ? 'text-yellow-400' : 
                                'text-gray-300'
                            }`}>
                                {proposal.state} 
                            </span>
                        </div>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

// Helper function to get border color based on status
const getStatusBorderColor = (state: string): string => {
     switch (state?.toLowerCase()) {
        case 'active': return 'border-blue-500/50'; 
        case 'succeeded': return 'border-green-500/50';
        case 'executed': return 'border-green-500/50'; 
        case 'defeated': return 'border-red-500/50'; 
        case 'queued': return 'border-yellow-500/50'; 
        case 'pending': return 'border-yellow-500/50';
        case 'rejected': return 'border-red-500/50';
        case 'ready': return 'border-purple-500/50';
        default: return 'border-gray-500/50';
    }
}

export default function DaoPage() {
    const { account, isConnected } = useAccount();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [propertyDetailsCache, setPropertyDetailsCache] = useState<Record<string, PropertyDto | null>>({});
    const [userOwnedTokens, setUserOwnedTokens] = useState<PropertyDto[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [isLoadingUserTokens, setIsLoadingUserTokens] = useState(false); 
    const [error, setError] = useState<string | null>(null);
    const [votingStates, setVotingStates] = useState<Record<number, boolean>>({});
    const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);
    const [activeProposals, setActiveProposals] = useState<number>(0);
    const [totalVotingPower, setTotalVotingPower] = useState<string>('0');
    
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
            
            // Count active proposals
            const activeCount = proposalsData.filter(p => p.state.toLowerCase() === 'active').length;
            setActiveProposals(activeCount);

            // Fetch property details for each proposal
            const tokenAddresses = Array.from(new Set(proposalsData.map(p => p.propertyTokenAddress).filter(Boolean))) as string[];
            if (tokenAddresses.length > 0) {
                // --- Add Logging ---
                console.log('DAO Page: Fetching details for token addresses:', tokenAddresses);
                // --- End Logging ---
                const detailsPromises = tokenAddresses.map(addr =>
                    getPropertyByTokenAddress(addr).catch(err => {
                        console.warn(`Failed to fetch details for token ${addr}:`, err);
                        return null;
                    })
                );
                const detailsResults = await Promise.all(detailsPromises);
                 // --- Add Logging ---
                console.log('DAO Page: Fetched property details results:', detailsResults);
                // --- End Logging ---
                const newDetailsCache: Record<string, PropertyDto | null> = {};
                tokenAddresses.forEach((addr, index) => { newDetailsCache[addr] = detailsResults[index]; });
                setPropertyDetailsCache(newDetailsCache);
            } else {
                 setPropertyDetailsCache({});
            }

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
            
            // Calculate total voting power
            let totalPower = ethers.getBigInt(0);
            for (const property of data) {
                const tokenAddress = property.tokenAddress || property.propertyDetails?.associatedPropertyToken;
                if (!tokenAddress) continue;
                try {
                    const balance = await getTokenBalance(tokenAddress, account);
                    totalPower += ethers.getBigInt(balance);
                } catch (error) {
                    console.error(`Error fetching balance for ${tokenAddress}:`, error);
                }
            }
            setTotalVotingPower(ethers.formatUnits(totalPower, 18));
            
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
                
                let totalPower = ethers.getBigInt(0);
                const ownedChecks = allProperties.map(async (property) => {
                    const tokenAddress = property.tokenAddress || property.propertyDetails?.associatedPropertyToken;
                    if (!tokenAddress) return null;
                    try {
                        const balance = await getTokenBalance(tokenAddress, account);
                        if (ethers.getBigInt(balance) > 0) {
                            totalPower += ethers.getBigInt(balance);
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
                setTotalVotingPower(ethers.formatUnits(totalPower, 18));
                
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
        } else {
             setUserOwnedTokens([]);
             setTotalVotingPower('0');
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
            fetchUserOwnedTokens();

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

    
    const handleCreateProposalClick = () => {
        if (!isConnected || !account) {
            setToastMessage({ type: 'error', title: "Connect Wallet", description: "Please connect your wallet to create a proposal." });
            return;
        }
         if (isLoadingUserTokens) {
             setToastMessage({ type: 'info', title: "Loading Tokens", description: "Please wait while we load your token balances." });
            return;
        }
        if (userOwnedTokens.length === 0) {
             setToastMessage({ type: 'info', title: "No Tokens", description: "You need to own property tokens to create a proposal." });
            return;
        }
        setShowCreateProposalModal(true); 
    };

    
    return (
        <TooltipProvider>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-gray-950 text-white">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 md:py-20 pt-48">
                     {/* Enhanced Header */}
                    <div className="relative mb-12">
                        <ParticleBackground />
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="mb-6 md:mb-0">
                                <h1 className="text-3xl md:text-4xl font-bold">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 drop-shadow-[0_2px_3px_rgba(56,189,248,0.3)]">
                                        DAO Governance
                                    </span>
                                </h1>
                                <p className="text-gray-400 mt-2">Participate in decisions shaping the platform's future.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Display Active Proposals and Voting Power */}
                                 <div className="flex items-center gap-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 shadow-md w-full sm:w-auto">
                                    <div className="bg-blue-500/20 p-2 rounded-full border border-blue-500/30"><Activity className="h-5 w-5 text-blue-400" /></div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white">Active Proposals</h3>
                                        <p className="text-xs text-gray-400 font-semibold">{activeProposals}</p>
                                    </div>
                                </div>
                                 <div className="flex items-center gap-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 shadow-md w-full sm:w-auto">
                                    <div className="bg-purple-500/20 p-2 rounded-full border border-purple-500/30"><Shield className="h-5 w-5 text-purple-400" /></div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white">Your Voting Power</h3>
                                        <p className="text-xs text-gray-400 font-semibold">{totalVotingPower} Tokens</p>
                                    </div>
                                </div>
                                 <div className="w-full sm:w-auto">
                                   <Tooltip>
                                     <TooltipTrigger asChild className="w-full">
                                       <Button 
                                         onClick={handleCreateProposalClick} 
                                         className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] border border-blue-500/30 transition-all duration-300"
                                         disabled={!isConnected || isLoadingUserTokens}
                                       >
                                           <span className="absolute top-0 left-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                                           {isLoadingUserTokens ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <PlusCircle className="h-4 w-4 mr-2" />}
                                           <span className="relative z-10">Create Proposal</span>
                                       </Button>
                                     </TooltipTrigger>
                                     <TooltipContent side="bottom" className="text-xs bg-gray-800 border-gray-700 text-gray-300">
                                       <p>Requires holding governance tokens to create proposals.</p>
                                     </TooltipContent>
                                   </Tooltip>
                                 </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading/Error/Empty States */} 
                    {isLoading ? (
                         <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
                            <div className="relative w-24 h-24">
                               {/* Advanced Loader */}
                               <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                               <div className="absolute inset-2 rounded-full border-t-2 border-purple-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <Hexagon className="h-8 w-8 text-blue-400 animate-pulse" />
                               </div>
                            </div>
                           <h3 className="mt-6 text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Loading Proposals</h3>
                           <p className="mt-2 text-gray-400 max-w-md text-center">Fetching governance data...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center py-12 bg-red-900/10 border border-red-800/30 rounded-xl p-6">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                               <AlertCircle className="h-10 w-10 text-red-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-red-400">Failed to Load Proposals</h3>
                            <p className="text-gray-400 max-w-md">{error}</p>
                            <Button 
                               variant="outline"
                               onClick={fetchProposalsAndDetails} 
                               className="mt-4 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:text-white"
                            >
                               <RefreshCcw className="h-4 w-4 mr-2" />
                               Retry
                            </Button>
                        </div>
                    ) : proposals.length === 0 ? (
                         <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center py-12 bg-gray-800/20 border border-gray-700/30 rounded-xl p-6">
                            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                               <Lock className="h-10 w-10 text-blue-400" /> 
                            </div>
                            <h3 className="text-xl font-semibold">No Proposals Found</h3>
                            <p className="text-gray-400 max-w-md">
                                There are currently no active or past governance proposals.
                            </p>
                            <NetworkNodes />
                             <Button 
                                onClick={handleCreateProposalClick} 
                                className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                                disabled={!isConnected || isLoadingUserTokens}
                            >
                                {isLoadingUserTokens ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <PlusCircle className="h-4 w-4 mr-2" />}
                                Create First Proposal
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {proposals.map(proposal => (
                                <ProposalCard 
                                    key={proposal.id}
                                    proposal={proposal}
                                    propertyDetailsCache={propertyDetailsCache}
                                    isLoadingDetails={isLoadingDetails}
                                    votingStates={votingStates}
                                    handleVote={handleVote}
                                    isConnected={isConnected}
                                />
                            ))}
                        </div>
                    )}
                </main>
                <Footer />

                {/* Create Proposal Modal */}
                <Dialog open={showCreateProposalModal} onOpenChange={setShowCreateProposalModal}>
                    <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-blue-900/50 rounded-xl backdrop-blur-lg shadow-xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Create New Proposal</DialogTitle>
                            <DialogDescription className="text-gray-300 pt-1">
                               Select a governance token you own and outline your proposal.
                            </DialogDescription>
                        </DialogHeader>
                        <CreateProposalForm 
                            ownedTokens={userOwnedTokens} 
                            onSuccess={() => {
                               setShowCreateProposalModal(false);
                               setToastMessage({ type: 'success', title: 'Proposal Created', description: 'Your proposal has been submitted.' });
                               fetchProposalsAndDetails();
                            }}
                            onClose={() => setShowCreateProposalModal(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
