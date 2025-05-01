'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Landmark, TrendingUp, Clock, Zap } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { formatCurrency } from '@/services/marketplace';

interface PortfolioSummaryProps {
  totalValue?: string;
  totalRentClaimed?: string;
  totalProperties?: number;
  averageReturn?: string;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalValue: propTotalValue,
  totalRentClaimed: propTotalRentClaimed,
  totalProperties: propTotalProperties,
  averageReturn: propAverageReturn
}) => {
  const { account, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(propTotalValue || '$0');
  const [totalRentClaimed, setTotalRentClaimed] = useState(propTotalRentClaimed || '$0');
  const [totalProperties, setTotalProperties] = useState(propTotalProperties || 0);
  const [averageReturn, setAverageReturn] = useState(propAverageReturn || '0%');

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (!isConnected || !account || 
          (propTotalValue && propTotalRentClaimed && propTotalProperties && propAverageReturn)) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        
        // Fetch owned properties
        const ownedResponse = await fetch(`${apiUrl}/properties/owned/${account}`, {
          signal: AbortSignal.timeout(30000),
          next: { revalidate: 120 }
        });
        
        if (!ownedResponse.ok) {
          throw new Error(`Failed to fetch owned properties: ${ownedResponse.statusText}`);
        }
        
        const ownedProperties = await ownedResponse.json();
        
        if (!ownedProperties || ownedProperties.length === 0) {
          setIsLoading(false);
          return;
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
            const annualRent = totalRent * (12 / transactions.length); // Extrapolate to annual
            const returnRate = (annualRent / portfolioValue) * 100;
            setAverageReturn(`${returnRate.toFixed(1)}%`);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching portfolio summary:", err);
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, [account, isConnected, propTotalValue, propTotalRentClaimed, propTotalProperties, propAverageReturn]);

  // Use props values if provided, otherwise use the fetched values
  const displayTotalValue = propTotalValue || totalValue;
  const displayTotalRentClaimed = propTotalRentClaimed || totalRentClaimed;
  const displayTotalProperties = propTotalProperties || totalProperties;
  const displayAverageReturn = propAverageReturn || averageReturn;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Portfolio Value */}
      <Card className="glass-card-vibrant glow-effect">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-crypto-light">{displayTotalValue}</p>
            </div>
            <div className="bg-gradient-to-br from-[#9b87f533] to-[#50fadc33] p-2 rounded-lg">
              <Wallet className="h-6 w-6 text-crypto-light" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="text-xs text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Tokenized Real Estate</span>
            </div>
            <div className="ml-auto blockchain-badge">
              <span>Blockchain Verified</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Rent Claimed */}
      <Card className="glass-card-vibrant glow-effect">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Rent Claimed</p>
              <p className="text-2xl font-bold text-crypto-light">{displayTotalRentClaimed}</p>
            </div>
            <div className="bg-gradient-to-br from-[#9b87f533] to-[#50fadc33] p-2 rounded-lg">
              <Landmark className="h-6 w-6 text-crypto-light" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="text-xs text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Passive Income</span>
            </div>
            <div className="ml-auto usdc-badge">
              <Wallet className="h-3 w-3 mr-1" />
              <span>USDC</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Properties */}
      <Card className="glass-card-vibrant glow-effect">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Properties Owned</p>
              <p className="text-2xl font-bold text-crypto-light">{displayTotalProperties}</p>
            </div>
            <div className="bg-gradient-to-br from-[#9b87f533] to-[#50fadc33] p-2 rounded-lg">
              <Landmark className="h-6 w-6 text-crypto-light" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="text-xs text-crypto-teal flex items-center">
              <span>Each represented by 1 NFT</span>
            </div>
            <div className="ml-auto nft-badge">
              <span>NFT</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Return */}
      <Card className="glass-card-vibrant glow-effect">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Average Annual Return</p>
              <p className="text-2xl font-bold text-crypto-light">{displayAverageReturn}</p>
            </div>
            <div className="bg-gradient-to-br from-[#9b87f533] to-[#50fadc33] p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-crypto-light" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="text-xs text-crypto-teal flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Calculated over 12 months</span>
            </div>
            <div className="ml-auto instant-badge">
              <Zap className="h-3 w-3 mr-1" />
              <span>Instant Settlements</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
