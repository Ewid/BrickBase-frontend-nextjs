'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle, Landmark, Wallet, Layers, Percent, PlusCircle } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';
import { PropertyDto, RentDto } from '@/types/dtos';
import { getTokenBalance, formatCurrency, tryConvertIpfsUrl } from '@/services/marketplace';
import { getClaimableRent, claimRent } from '@/services/property';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ClaimRentForm from '@/components/ClaimRentForm';
import PortfolioTabs from '@/components/PortfolioTabs';


interface PortfolioProperty extends PropertyDto {
    formattedBalance: string;
    ownershipPercentage: number;
    claimableRentAmount: string;
    claimableRentFormatted: string;
    tokenAddress: string;
    isClaimingRent: boolean;
}


interface ClaimablePropertyForForm extends PortfolioProperty {
    
}


interface ToastMessage {
    type: 'success' | 'error' | 'info';
    title: string;
    description?: string;
}


function shortenAddress(address: string): string {
  if (!address || !address.startsWith('0x')) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default function PortfolioPage() {
    const { account, isConnected } = useAccount();
    const [portfolio, setPortfolio] = useState<PortfolioProperty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [claimingStates, setClaimingStates] = useState<Record<string, boolean>>({});
    const [showClaimRentModal, setShowClaimRentModal] = useState(false);
    
    const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

    const fetchPortfolio = async () => {
        if (!account) {
            setPortfolio([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

        try {
            
            const ownedResponse = await fetch(`${apiUrl}/properties/owned/${account}`, {
                signal: AbortSignal.timeout(30000),
                next: { revalidate: 120 } 
            });
            if (!ownedResponse.ok) {
                throw new Error(`Failed to fetch owned properties: ${ownedResponse.statusText}`);
            }
            const ownedProperties: PropertyDto[] = await ownedResponse.json();

            if (!ownedProperties || ownedProperties.length === 0) {
                setPortfolio([]);
                setIsLoading(false);
                return; 
            }

            
            const enrichedPortfolioPromises = ownedProperties.map(async (prop) => {
                const tokenAddr = prop.tokenAddress || prop.propertyDetails?.associatedPropertyToken;
                if (!tokenAddr || !ethers.isAddress(tokenAddr)) {
                    console.warn(`Skipping property ${prop.id || 'N/A'} due to missing or invalid token address.`);
                    return null;
                }

                try {
                    const balanceWei = await getTokenBalance(tokenAddr, account);
                    const formattedBalance = formatCurrency(balanceWei, 18);

                    
                    const totalSupply = ethers.getBigInt(prop.totalSupply || '0');
                    const balance = ethers.getBigInt(balanceWei);
                    const ownershipPercentage = totalSupply > BigInt(0) ?
                        parseFloat(((balance * BigInt(10000)) / totalSupply).toString()) / 100 : 0;

                    
                    let claimableRentAmount: string = '0';
                    let claimableRentFormatted: string = '$0.00';
                    try {
                        const rentData: RentDto = await getClaimableRent(account, tokenAddr);
                        const rentAmountBigInt = ethers.getBigInt(rentData.claimableAmount || '0');
                        if (rentAmountBigInt > 0) {
                            claimableRentAmount = rentData.claimableAmount;
                            claimableRentFormatted = `$${formatCurrency(rentData.claimableAmount, 6)}`;
                        }
                    } catch (rentError) {
                        console.warn(`Could not fetch claimable rent for ${tokenAddr}:`, rentError);
                    }

                    
                    const metadata = prop.metadata || { name: 'Unnamed Property', description: '', image: '', attributes: [] };

                    const enrichedProperty: PortfolioProperty = {
                        ...prop,
                        metadata: metadata,
                        formattedBalance,
                        ownershipPercentage,
                        claimableRentAmount,
                        claimableRentFormatted,
                        tokenAddress: tokenAddr,
                        isClaimingRent: false
                    };

                    return enrichedProperty;
                } catch (propError) {
                    console.error(`Failed to enrich property ${prop.id} (${tokenAddr}):`, propError);
                    return null;
                }
            });

            const enrichedResults = await Promise.all(enrichedPortfolioPromises);
            const validPortfolio = enrichedResults.filter((p): p is PortfolioProperty => p !== null);
            setPortfolio(validPortfolio);

        } catch (err: any) {
            console.error("Error fetching portfolio:", err);
            setError(err.message || "Could not load your portfolio.");
            setPortfolio([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected && account) {
            fetchPortfolio();
        } else {
            
            setPortfolio([]);
            setIsLoading(false);
            setError(null);
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

    // Handle claiming rent for a property token
    const handleClaimRent = async (tokenAddress: string): Promise<void> => { 
        if (!tokenAddress || claimingStates[tokenAddress]) return;

        setClaimingStates(prev => ({ ...prev, [tokenAddress]: true }));
        let claimSuccessful = false; 

        try {
            try {
                const result = await claimRent(tokenAddress);
                if (result.success) {
                    setToastMessage({ 
                        type: 'success', 
                        title: "Rent Claimed!", 
                        description: `Rent for ${shortenAddress(tokenAddress)} claimed successfully.` 
                    });
                    claimSuccessful = true;
                } else {
                    throw result.error || new Error("Failed to claim rent.");
                }
            } catch (claimErr: any) {
                let errorMessage = claimErr.reason || claimErr.message || "Could not claim rent.";
                let errorTitle = "Claim Failed";
                
                if (errorMessage.includes("No new rent to claim")) {
                    errorMessage = "There is currently no rent available to claim for this property.";
                } else if (claimErr.code === 4001 || claimErr.message?.includes('User rejected') || claimErr.message?.includes('User denied')) {
                    errorTitle = "Transaction Rejected";
                    errorMessage = "You rejected the transaction in your wallet.";
                }
                
                setToastMessage({ type: 'error', title: errorTitle, description: errorMessage });
            }

            if (claimSuccessful) {
                await fetchPortfolio();
            }
        } catch (outerErr: any) {
            console.error("Unexpected error during claim process:", outerErr);
            setToastMessage({ type: 'error', title: "Error", description: "An unexpected error occurred." });
        } finally {
            setTimeout(() => setClaimingStates(prev => ({ ...prev, [tokenAddress]: false })), 0);
        }
    };
    
    const renderPortfolioContent = () => {
        if (!isConnected) {
            return (
                <div className="text-center py-20 text-gray-400">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                    <p>Please connect your wallet to view your portfolio.</p>
                </div>
            );
        }

        return <PortfolioTabs properties={portfolio} isLoading={isLoading} />;
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-blue-950 to-gray-950 text-white">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                {/* Enhanced header with web3 elements */}
                <div className="relative mb-8">
                    {/* Decorative blockchain elements */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-3xl md:text-4xl font-bold">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                                    Your Portfolio
                                </span>
                            </h1>
                            <p className="text-gray-400 mt-1">Tokenized real estate with instant global access</p>
                        </div>
                        
                        <Button
                            onClick={() => setShowClaimRentModal(true)}
                            className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium py-2 px-4 rounded-lg"
                            disabled={!isConnected}
                        >
                            {/* Animated glow effect */}
                            <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                            <Landmark className="h-4 w-4 mr-2 inline-block" />
                            Claim Available Rent
                        </Button>
                    </div>
                    
                    {/* Web3 benefits banner */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 flex items-center">
                            <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                                <Wallet className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">USDC Payments</h3>
                                <p className="text-xs text-gray-400">Stable, secure rent payments</p>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 flex items-center">
                            <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                                <svg className="h-5 w-5 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 16L7 13.5V8.5L12 6L17 8.5V13.5L12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 6V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 8.5L12 11L17 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">Blockchain Verified</h3>
                                <p className="text-xs text-gray-400">Transparent ownership records</p>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 flex items-center">
                            <div className="bg-green-500/20 p-2 rounded-full mr-3">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 12H21M3 12C3 16.9706 7.02944 21 12 21M3 12C3 7.02944 7.02944 3 12 3M21 12C21 16.9706 16.9706 21 12 21M21 12C21 7.02944 16.9706 3 12 3M12 3C14.5 8 15 12 12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">Global Access</h3>
                                <p className="text-xs text-gray-400">Invest from anywhere, anytime</p>
                            </div>
                        </div>
                    </div>
                </div>

                {renderPortfolioContent()}
            </main>
            <Footer />
            
            {/* Claim Rent Modal */}
            <Dialog open={showClaimRentModal} onOpenChange={setShowClaimRentModal}>
                <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900 to-gray-950 border-blue-900/50 rounded-xl backdrop-blur-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Claim Property Rent</DialogTitle>
                        <DialogDescription className="text-gray-300 pt-1">
                            Select a property below to claim your available USDC rent payout.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <ClaimRentForm
                            portfolioProperties={portfolio}
                            onClose={() => setShowClaimRentModal(false)}
                            handleClaimRent={handleClaimRent}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
