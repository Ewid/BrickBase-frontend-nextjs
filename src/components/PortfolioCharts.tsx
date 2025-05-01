'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, Wallet } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { formatCurrency, getTokenBalance as getTokenBalanceService } from '@/services/marketplace';

interface PortfolioValue {
  date: string;
  value: number;
}

interface AssetAllocation {
  name: string;
  value: number;
  color: string;
}

interface RentIncome {
  month: string;
  amount: number;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/90 p-3 border border-white/10 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-sm text-crypto-light">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/90 p-3 border border-white/10 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-white">{payload[0].name}</p>
        <p className="text-sm text-crypto-light">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const PortfolioCharts: React.FC = () => {
  const { account, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioValue, setPortfolioValue] = useState<PortfolioValue[]>([]);
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  const [rentIncome, setRentIncome] = useState<RentIncome[]>([]);
  const [totalValue, setTotalValue] = useState<string>('$0');
  const [totalRent, setTotalRent] = useState<string>('$0');
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [monthlyChange, setMonthlyChange] = useState<string>('+0%');

  useEffect(() => {
    const fetchChartData = async () => {
      if (!isConnected || !account) {
        setPortfolioValue([]);
        setAssetAllocation([]);
        setRentIncome([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

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
        
        // Calculate asset allocation
        const allocation: AssetAllocation[] = [];
        let totalPortfolioValue = 0;
        
        // Process each property for asset allocation
        for (let i = 0; i < ownedProperties.length; i++) {
          const prop = ownedProperties[i];
          const tokenAddr = prop.tokenAddress || prop.propertyDetails?.associatedPropertyToken;
          
          if (!tokenAddr) continue;
          
          // Calculate property value (simplified for demo)
          // In a real implementation, you would use market price data
          const balanceWei = await getTokenBalance(tokenAddr, account);
          const formattedBalance = formatCurrency(balanceWei, 18);
          const balance = parseFloat(formattedBalance);
          
          // Assume each token is worth $500 (mock value)
          const propertyValue = balance * 500;
          totalPortfolioValue += propertyValue;
          
          allocation.push({
            name: prop.metadata?.name || 'Unnamed Property',
            value: 0, // We'll calculate percentages after getting total
            color: CHART_COLORS[i % CHART_COLORS.length]
          });
        }
        
        // Calculate percentages for allocation
        // We need to use a for loop instead of forEach to use await
        for (let i = 0; i < allocation.length; i++) {
          const item = allocation[i];
          const prop = ownedProperties[i];
          const tokenAddr = prop.tokenAddress || prop.propertyDetails?.associatedPropertyToken;
          
          if (!tokenAddr) continue;
          
          const balanceWei = await getTokenBalance(tokenAddr, account);
          const formattedBalance = formatCurrency(balanceWei, 18);
          const balance = parseFloat(formattedBalance);
          const propertyValue = balance * 500;
          
          item.value = Math.round((propertyValue / totalPortfolioValue) * 100);
        }
        
        setAssetAllocation(allocation);
        setTotalProperties(ownedProperties.length);
        
        // Fetch transaction history for portfolio value and rent income
        const historyResponse = await fetch(`${apiUrl}/transactions/history/${account}`, {
          signal: AbortSignal.timeout(30000),
          next: { revalidate: 120 }
        });
        
        if (!historyResponse.ok) {
          throw new Error(`Failed to fetch transaction history: ${historyResponse.statusText}`);
        }
        
        const transactions = await historyResponse.json();
        
        // Process transactions for rent income by month
        const rentByMonth = new Map<string, number>();
        let totalRentAmount = 0;
        
        transactions.forEach((tx: any) => {
          if (tx.type === 'claim') {
            const date = new Date(tx.timestamp);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const monthName = date.toLocaleString('default', { month: 'short' });
            const amount = parseFloat(tx.usdcAmount);
            
            totalRentAmount += amount;
            
            if (rentByMonth.has(monthKey)) {
              rentByMonth.set(monthKey, rentByMonth.get(monthKey)! + amount);
            } else {
              rentByMonth.set(monthKey, amount);
            }
          }
        });
        
        // Convert rent data to chart format
        const rentData: RentIncome[] = Array.from(rentByMonth.entries())
          .map(([key, value]) => {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return {
              month: date.toLocaleString('default', { month: 'short' }),
              amount: Math.round(value)
            };
          })
          .sort((a, b) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months.indexOf(a.month) - months.indexOf(b.month);
          });
        
        setRentIncome(rentData);
        setTotalRent(`$${totalRentAmount.toLocaleString()}`);
        
        // Generate portfolio value data (simplified)
        // In a real implementation, you would use historical price data
        const portfolioData: PortfolioValue[] = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        // Generate mock portfolio value data with an upward trend
        for (let i = 0; i < 12; i++) {
          const monthIndex = (currentMonth - 11 + i) % 12;
          const monthName = months[monthIndex >= 0 ? monthIndex : monthIndex + 12];
          
          // Start with a base value and increase it over time
          // This is a simplified approach - in a real app, you would use actual historical data
          const baseValue = totalPortfolioValue * 0.4;
          const growthFactor = 1 + (i * 0.05);
          const value = Math.round(baseValue * growthFactor);
          
          portfolioData.push({
            date: monthName,
            value: value
          });
        }
        
        setPortfolioValue(portfolioData);
        setTotalValue(`$${totalPortfolioValue.toLocaleString()}`);
        
        // Calculate monthly change
        if (portfolioData.length >= 2) {
          const currentValue = portfolioData[portfolioData.length - 1].value;
          const previousValue = portfolioData[portfolioData.length - 2].value;
          const changePercent = ((currentValue - previousValue) / previousValue) * 100;
          setMonthlyChange(`+${changePercent.toFixed(1)}%`);
        }
        
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching chart data:", err);
        setError(err.message || "Could not load chart data.");
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [account, isConnected]);

  // Helper function to get token balance using the service
  const getTokenBalance = async (tokenAddress: string, address: string) => {
    try {
      // Use the service function instead of direct API call
      return await getTokenBalanceService(tokenAddress, address);
    } catch (error) {
      console.error(`Failed to get token balance for ${address}:`, error);
      return '0';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-crypto-light" />
        <p className="ml-3 text-gray-400">Loading portfolio analytics...</p>
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
          <p className="text-gray-400">Please connect your wallet to view your portfolio analytics.</p>
        </CardContent>
      </Card>
    );
  }

  if (portfolioValue.length === 0 && assetAllocation.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No portfolio data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Value Chart */}
      <Card className="glass-card-vibrant glow-effect">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <LineChartIcon className="h-5 w-5 mr-2 text-crypto-light" />
            <span className="blockchain-text">Portfolio Value</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={portfolioValue}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#9ca3af' }} 
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af' }} 
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--chart-2))" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-400">Total Portfolio Value</div>
            <div className="text-2xl font-bold text-crypto-light">{totalValue}</div>
            <div className="text-xs text-green-400">{monthlyChange} this month</div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation Chart */}
      <Card className="glass-card-vibrant glow-effect">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <PieChartIcon className="h-5 w-5 mr-2 text-crypto-light" />
            <span className="blockchain-text">Asset Allocation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value) => <span className="text-sm text-white">{value}</span>}
                />
                <RechartsTooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-400">Properties in Portfolio</div>
            <div className="text-2xl font-bold text-crypto-light">{totalProperties}</div>
            <div className="text-xs text-crypto-teal">Each represented by 1 NFT</div>
          </div>
        </CardContent>
      </Card>

      {/* Rent Income Chart */}
      <Card className="glass-card-vibrant glow-effect lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <BarChartIcon className="h-5 w-5 mr-2 text-crypto-light" />
            <span className="blockchain-text">Rent Income (USDC)</span>
            <div className="ml-2 usdc-badge">
              <Wallet className="h-3 w-3 mr-1" />
              <span>USDC Payments</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rentIncome}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#9ca3af' }} 
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af' }} 
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--chart-1))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-400">Total Rent Collected</div>
            <div className="text-2xl font-bold text-crypto-light">{totalRent}</div>
            <div className="text-xs text-green-400">Paid in USDC stablecoin</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioCharts;
