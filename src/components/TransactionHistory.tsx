'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, ArrowUpRight, ArrowDownLeft, Landmark } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';
import { formatCurrency } from '@/services/marketplace';
import CONTRACT_CONFIG from '@/config/contracts';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'claim';
  propertyName: string;
  tokenAddress: string;
  amount: string;
  usdcAmount: string;
  timestamp: number;
  txHash: string;
}

const TransactionHistory: React.FC = () => {
  const { account, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected || !account) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/transactions/history/${account}`, {
          signal: AbortSignal.timeout(30000),
          next: { revalidate: 120 }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch transaction history: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform the data to match our Transaction interface
        const transformedTransactions: Transaction[] = data.map((tx: any) => ({
          id: tx.id || tx.txHash,
          type: tx.type,
          propertyName: tx.propertyName,
          tokenAddress: tx.tokenAddress,
          amount: tx.amount || '0',
          usdcAmount: tx.usdcAmount,
          timestamp: new Date(tx.timestamp).getTime(),
          txHash: tx.txHash
        }));

        setTransactions(transformedTransactions);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching transaction history:", err);
        setError(err.message || "Could not load transaction history.");
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [account, isConnected]);

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case 'sell':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case 'claim':
        return <Landmark className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Bought';
      case 'sell':
        return 'Sold';
      case 'claim':
        return 'Claimed Rent';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getBlockExplorerUrl = (txHash: string) => {
    // Using Base Sepolia block explorer since the contracts are on Base Sepolia
    const explorerUrl = 'https://sepolia.basescan.org';
    return `${explorerUrl}/tx/${txHash}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-crypto-light" />
        <p className="ml-3 text-gray-400">Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass-card bg-red-900/10 border-red-500/20">
        <CardContent className="p-6 text-center">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Please connect your wallet to view your transaction history.</p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No transactions found for your account.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-vibrant glow-effect">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <span className="blockchain-text">Transaction History</span>
          <div className="ml-2 blockchain-badge">
            <span>Blockchain Verified</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 text-xs text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-2 text-xs text-gray-400 font-medium">Property</th>
                <th className="text-left py-3 px-2 text-xs text-gray-400 font-medium">Amount</th>
                <th className="text-left py-3 px-2 text-xs text-gray-400 font-medium">USDC</th>
                <th className="text-left py-3 px-2 text-xs text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 px-2 text-xs text-gray-400 font-medium">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-2">
                    <div className="flex items-center">
                      {getTransactionTypeIcon(tx.type)}
                      <span className="ml-2 text-sm">{getTransactionTypeText(tx.type)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col">
                      <span className="text-sm">{tx.propertyName}</span>
                      <span className="text-xs text-gray-500">{shortenAddress(tx.tokenAddress)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {tx.type !== 'claim' ? (
                      <span className="text-sm">{tx.amount} Tokens</span>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center">
                      <span className="text-sm usdc-badge">
                        ${tx.usdcAmount}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm">{formatDate(tx.timestamp)}</span>
                  </td>
                  <td className="py-3 px-2">
                    <a 
                      href={getBlockExplorerUrl(tx.txHash)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-crypto-light hover:text-white flex items-center text-sm"
                    >
                      {shortenAddress(tx.txHash)}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
