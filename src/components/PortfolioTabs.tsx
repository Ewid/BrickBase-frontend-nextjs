'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LayoutDashboard, History, BarChart3 } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import TransactionHistory from './TransactionHistory';
import PortfolioCharts from './PortfolioCharts';
import PortfolioSummary from './PortfolioSummary';
import { PropertyDto } from '@/types/dtos';
import PropertyCard from './PropertyCard';
import { formatCurrency } from '@/services/marketplace';

interface PortfolioTabsProps {
  properties?: PropertyDto[];
  isLoading?: boolean;
}

const PortfolioTabs: React.FC<PortfolioTabsProps> = ({ 
  properties = [], 
  isLoading = false 
}) => {
  const { account, isConnected } = useAccount();
  const [totalValue, setTotalValue] = useState<string>('$0');
  const [totalRentClaimed, setTotalRentClaimed] = useState<string>('$0');
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [averageReturn, setAverageReturn] = useState<string>('0%');
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (!isConnected || !account) {
        setSummaryLoading(false);
        return;
      }

      setSummaryLoading(true);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        
        // Fetch owned properties if not provided
        let ownedProperties = properties;
        if (ownedProperties.length === 0) {
          const ownedResponse = await fetch(`${apiUrl}/properties/owned/${account}`, {
            signal: AbortSignal.timeout(30000),
            next: { revalidate: 120 }
          });
          
          if (ownedResponse.ok) {
            ownedProperties = await ownedResponse.json();
          }
        }
        
        // Set total properties
        setTotalProperties(ownedProperties.length);
        
        // Calculate total portfolio value
        let portfolioValue = 0;
        
        for (const prop of ownedProperties) {
          const tokenAddr = prop.tokenAddress || prop.propertyDetails?.associatedPropertyToken;
          
          if (!tokenAddr) continue;
          
          // Get token balance
          const balanceResponse = await fetch(`${apiUrl}/properties/token/${tokenAddr}/balance/${account}`, {
            signal: AbortSignal.timeout(30000),
            next: { revalidate: 120 }
          });
          
          if (!balanceResponse.ok) continue;
          
          const balanceData = await balanceResponse.json();
          const formattedBalance = formatCurrency(balanceData.balance || '0', 18);
          const balance = parseFloat(formattedBalance);
          
          // Assume each token is worth $500 (mock value)
          const propertyValue = balance * 500;
          portfolioValue += propertyValue;
        }
        
        setTotalValue(`$${portfolioValue.toLocaleString()}`);
        
        // Fetch transaction history for rent claims
        const historyResponse = await fetch(`${apiUrl}/transactions/history/${account}`, {
          signal: AbortSignal.timeout(30000),
          next: { revalidate: 120 }
        });
        
        if (historyResponse.ok) {
          const transactions = await historyResponse.json();
          
          // Calculate total rent claimed
          let totalRent = 0;
          
          transactions.forEach((tx: any) => {
            if (tx.type === 'claim') {
              totalRent += parseFloat(tx.usdcAmount);
            }
          });
          
          setTotalRentClaimed(`$${totalRent.toLocaleString()}`);
          
          // Calculate average return (simplified)
          if (portfolioValue > 0) {
            const annualRent = totalRent * (12 / Math.max(1, transactions.filter((tx: any) => tx.type === 'claim').length)); // Extrapolate to annual
            const returnRate = (annualRent / portfolioValue) * 100;
            setAverageReturn(`${returnRate.toFixed(1)}%`);
          }
        }
        
        setSummaryLoading(false);
      } catch (err) {
        console.error("Error fetching portfolio summary:", err);
        setSummaryLoading(false);
      }
    };

    fetchSummaryData();
  }, [account, isConnected, properties]);

  const renderPropertyCards = () => {
    if (properties.length === 0) {
      return (
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">No properties found in your portfolio.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {properties.map((property) => {
          const tokenAddress = property.tokenAddress || property.propertyDetails?.associatedPropertyToken;
          if (!tokenAddress) return null;
          
          return (
            <PropertyCard
              key={tokenAddress}
              id={property.tokenId}
              tokenAddress={tokenAddress}
              title={property.metadata?.name || 'Unnamed Property'}
              location={property.propertyDetails?.physicalAddress || 'Location not available'}
              imageUrl={property.metadata?.image || ''}
              sqft={property.propertyDetails?.sqft || 0}
            />
          );
        })}
      </div>
    );
  };

  if (isLoading || summaryLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-crypto-light" />
        <p className="ml-3 text-gray-400">Loading portfolio data...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Please connect your wallet to view your portfolio.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      {/* Enhanced TabsList with futuristic web3 design */}
      <TabsList className="w-full bg-gradient-to-r from-gray-900/90 via-blue-950/60 to-gray-900/90 border border-blue-500/30 rounded-xl mb-8 p-1.5 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.15)]">
        <TabsTrigger 
          value="overview" 
          className="flex-1 py-3 text-gray-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/30 data-[state=active]:to-cyan-600/30 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)] data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-lg transition-all duration-300"
        >
          <div className="flex items-center justify-center">
            <div className="bg-blue-500/20 p-1.5 rounded-md mr-2">
              <LayoutDashboard className="h-4 w-4 text-blue-400" />
            </div>
            <span className="font-medium">Overview</span>
          </div>
        </TabsTrigger>
        <TabsTrigger 
          value="transactions" 
          className="flex-1 py-3 text-gray-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/30 data-[state=active]:to-blue-600/30 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(124,58,237,0.3)] data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-lg transition-all duration-300"
        >
          <div className="flex items-center justify-center">
            <div className="bg-purple-500/20 p-1.5 rounded-md mr-2">
              <History className="h-4 w-4 text-purple-400" />
            </div>
            <span className="font-medium">Transactions</span>
          </div>
        </TabsTrigger>
        <TabsTrigger 
          value="analytics" 
          className="flex-1 py-3 text-gray-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600/30 data-[state=active]:to-green-600/30 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(6,182,212,0.3)] data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-lg transition-all duration-300"
        >
          <div className="flex items-center justify-center">
            <div className="bg-cyan-500/20 p-1.5 rounded-md mr-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="font-medium">Analytics</span>
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 space-y-6">
        {/* Web3 benefits banner above summary */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 p-4 mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Web3 Real Estate Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-white">Instant Transactions</span>
                  <p className="text-xs text-gray-400">No lengthy closing processes</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 12H22" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-white">Global Accessibility</span>
                  <p className="text-xs text-gray-400">Invest from anywhere in the world</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-white">Fractional Ownership</span>
                  <p className="text-xs text-gray-400">Own exactly what you can afford</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <PortfolioSummary 
          totalValue={totalValue}
          totalRentClaimed={totalRentClaimed}
          totalProperties={totalProperties}
          averageReturn={averageReturn}
        />
        {renderPropertyCards()}
      </TabsContent>

      <TabsContent value="transactions">
        <TransactionHistory />
      </TabsContent>

      <TabsContent value="analytics">
        <PortfolioCharts />
      </TabsContent>
    </Tabs>
  );
};

export default PortfolioTabs;
