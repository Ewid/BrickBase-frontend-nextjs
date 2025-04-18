'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle, Landmark, Wallet, Layers, Percent } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';
import { PropertyDto, RentDto } from '@/types/dtos';
import { getTokenBalance, formatCurrency, tryConvertIpfsUrl } from '@/services/marketplace';
import { getClaimableRent, claimRent } from '@/services/property';
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';
import Link from 'next/link';

// Interface for enhanced property DTO including balance/rent details
interface PortfolioProperty extends PropertyDto {
    formattedBalance: string;
    ownershipPercentage: number;
    claimableRentFormatted: string | undefined;
    isClaimingRent: boolean;
}

// Helper function
function shortenAddress(address: string): string {
  if (!address || !address.startsWith('0x')) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default function PortfolioPage() {
    const { account, isConnected } = useAccount();
    const [portfolio, setPortfolio] = useState<PortfolioProperty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [claimingStates, setClaimingStates] = useState<Record<string, boolean>>({}); // Track claiming status per token address

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
            // 1. Fetch owned properties
            const ownedResponse = await fetch(`${apiUrl}/properties/owned/${account}`, {
                signal: AbortSignal.timeout(30000),
                next: { revalidate: 120 } // Cache for 2 minutes
            });
            if (!ownedResponse.ok) {
                throw new Error(`Failed to fetch owned properties: ${ownedResponse.statusText}`);
            }
            const ownedProperties: PropertyDto[] = await ownedResponse.json();

            if (!ownedProperties || ownedProperties.length === 0) {
                setPortfolio([]);
                setIsLoading(false);
                return; // No properties owned
            }

            // 2. Fetch balance, percentage, and claimable rent for each
            const enrichedPortfolioPromises = ownedProperties.map(async (prop) => {
                const tokenAddress = prop.tokenAddress || prop.propertyDetails?.associatedPropertyToken;
                if (!tokenAddress) return null;

                try {
                    const balanceWei = await getTokenBalance(tokenAddress, account);
                    const formattedBalance = formatCurrency(balanceWei, 18);

                    // Calculate ownership percentage (totalSupply should be in PropertyDto)
                    const totalSupply = ethers.getBigInt(prop.totalSupply || '0');
                    const balance = ethers.getBigInt(balanceWei);
                    const ownershipPercentage = totalSupply > BigInt(0) ? 
                        parseFloat(((balance * BigInt(10000)) / totalSupply).toString()) / 100 : 0;

                    // Fetch claimable rent
                    let claimableRentFormatted: string | undefined = undefined;
                    try {
                        const rentData: RentDto = await getClaimableRent(account, tokenAddress);
                        if (ethers.getBigInt(rentData.claimableAmount) > 0) {
                            claimableRentFormatted = formatCurrency(rentData.claimableAmount, 6);
                        }
                    } catch (rentError) {
                        console.warn(`Could not fetch claimable rent for ${tokenAddress}:`, rentError);
                    }

                    const enrichedProperty: PortfolioProperty = {
                        ...prop,
                        formattedBalance,
                        ownershipPercentage,
                        claimableRentFormatted,
                        isClaimingRent: false
                    };

                    return enrichedProperty;
                } catch (propError) {
                    console.error(`Failed to enrich property ${prop.id} (${tokenAddress}):`, propError);
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
            // Clear portfolio if disconnected or no account
            setPortfolio([]);
            setIsLoading(false);
            setError(null);
        }
    }, [account, isConnected]);

    // Handle claiming rent for a single property
    const handleClaimRent = async (tokenAddress: string) => {
        if (!tokenAddress || claimingStates[tokenAddress]) return;

        setClaimingStates(prev => ({ ...prev, [tokenAddress]: true }));
        try {
            const result = await claimRent(tokenAddress);
            if (result.success) {
                toast({ title: "Rent Claimed!", description: `Rent for ${shortenAddress(tokenAddress)} claimed successfully.` });
                // Refresh portfolio data to show updated claimable amounts
                fetchPortfolio();
            } else {
                throw result.error || new Error("Failed to claim rent.");
            }
        } catch (err: any) {
            console.error("Rent claim failed:", err);
            toast({
                title: "Claim Failed",
                description: err.reason || err.message || "Could not claim rent.",
                variant: "destructive"
            });
        } finally {
            setClaimingStates(prev => ({ ...prev, [tokenAddress]: false }));
        }
    };

    // Placeholder for claiming all rent
    const handleClaimAllRent = async () => {
        console.log("Claim All Rent clicked - Implement batch logic if possible, or sequential claims.");
        toast({ title: "Claim All (Not Implemented)", description: "Claiming rent for all properties needs implementation.", variant: "default" });
        // TODO: Iterate through portfolio, check claimableRentFormatted, call handleClaimRent for each
        // Consider potential issues with multiple simultaneous transactions.
    };

    // --- Render Logic ---
    const renderPortfolio = () => {
        if (!isConnected) {
            return (
                <div className="text-center py-20 text-gray-400">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                    <p>Please connect your wallet to view your portfolio.</p>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-crypto-light" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-20 text-red-400 bg-red-900/20 rounded-lg p-6">
                    <AlertCircle className="h-10 w-10 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Failed to Load Portfolio</h3>
                    <p>{error}</p>
                    <Button onClick={fetchPortfolio} variant="outline" className="mt-6">
                        Retry
                    </Button>
                </div>
            );
        }

        if (portfolio.length === 0) {
            return (
                <div className="text-center py-20 text-gray-400">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                    <p>You do not currently own tokens for any properties.</p>
                    <Link href="/marketplace" className="mt-4 inline-block">
                       <Button className="crypto-btn">Explore Marketplace</Button>
                    </Link>
                </div>
            );
        }

        // Display owned properties
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((prop) => {
                    const tokenAddress = prop.tokenAddress || prop.propertyDetails?.associatedPropertyToken;
                    const imageUrl = prop.metadata?.image ? tryConvertIpfsUrl(prop.metadata.image) : '/property-placeholder.jpg';
                    const isClaiming = tokenAddress ? claimingStates[tokenAddress] : false;
                    const canClaim = !!prop.claimableRentFormatted; // True if there is a formatted claimable amount

                    return (
                        <Card key={tokenAddress || prop.id} className="glass-card bg-gray-900/70 border border-white/10 overflow-hidden flex flex-col">
                            <CardHeader className="p-0">
                                <div className="relative aspect-video w-full">
                                    <Image
                                        src={imageUrl}
                                        alt={prop.metadata?.name || 'Property'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow flex flex-col justify-between">
                                <div>
                                    <CardTitle className="text-lg text-white mb-2 line-clamp-1" title={prop.metadata?.name}>{prop.metadata?.name || 'Unnamed Property'}</CardTitle>
                                    <CardDescription className="text-xs text-gray-400 mb-4">Token: {tokenAddress ? shortenAddress(tokenAddress) : 'N/A'}</CardDescription>

                                    {/* Balance and Ownership */}
                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 flex items-center"><Wallet className="w-4 h-4 mr-1.5"/> Your Balance:</span>
                                            <span className="font-medium text-white">{prop.formattedBalance}</span>
                                        </div>
                                         <div className="flex justify-between items-center">
                                            <span className="text-gray-400 flex items-center"><Percent className="w-4 h-4 mr-1.5"/> Ownership:</span>
                                            <span className="font-medium text-white">{prop.ownershipPercentage.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Claimable Rent */}
                                <div className="mt-auto pt-4 border-t border-white/10">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-gray-400 text-sm">Claimable Rent:</span>
                                        <span className={`font-medium text-lg ${prop.claimableRentFormatted ? 'text-green-400' : 'text-gray-500'}`}>
                                            ${prop.claimableRentFormatted || '0.00'}
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full crypto-btn"
                                        onClick={() => tokenAddress && handleClaimRent(tokenAddress)}
                                        disabled={!tokenAddress || !canClaim || isClaiming}
                                    >
                                        {isClaiming ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                        ) : (
                                            <Landmark className="h-4 w-4 mr-2"/>
                                        )}
                                        {isClaiming ? 'Claiming...' : 'Claim Rent'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-crypto-dark">
            <Navbar />
            <main className="flex-grow pt-24 pb-10 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold mb-2">My <span className="text-gradient">Portfolio</span></h1>
                        <p className="text-gray-400">Overview of your property token holdings and claimable rent.</p>
                    </div>
                     <Button
                        onClick={handleClaimAllRent}
                        className="crypto-btn"
                        disabled={portfolio.length === 0 || !portfolio.some(p => p.claimableRentFormatted)}
                    >
                         <Landmark className="h-4 w-4 mr-2" />
                         Claim All Rent (Placeholder)
                    </Button>
                </div>

                {renderPortfolio()}
            </main>
            <Footer />
        </div>
    );
} 