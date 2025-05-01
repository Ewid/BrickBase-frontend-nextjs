import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, Loader2, Info, DollarSign } from 'lucide-react';
import { buyTokensFromListing, formatCurrency, getUsdcBalance } from '@/services/marketplace';
import { ListingDto } from '@/types/dtos';
import { ethers } from 'ethers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BuyTokensFormProps {
  listing: any; // Support both ListingDto and enhanced listing
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const BuyTokensForm = ({ listing, onSuccess, onError }: BuyTokensFormProps) => {
  const [userFriendlyAmount, setUserFriendlyAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inputValid, setInputValid] = useState(true);
  const [estimatedGasError, setEstimatedGasError] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [isLoadingUsdcBalance, setIsLoadingUsdcBalance] = useState(false);
  
  // Get USDC price per token
  const usdcPricePerToken = listing.formattedPrice || formatCurrency(listing.pricePerToken, 6);
  
  // Convert user-friendly amount to actual token amount (with 18 decimals)
  const actualAmount = userFriendlyAmount && inputValid
    ? ethers.parseUnits(userFriendlyAmount, 18).toString()
    : '0';
  
  // Calculate the total in USDC (assuming price is in USDC with 6 decimals)
  const totalUsdc = userFriendlyAmount && inputValid
    ? (parseFloat(userFriendlyAmount) * parseFloat(usdcPricePerToken)).toFixed(2)
    : '0.00';
  
  // Load USDC balance when the form loads
  useEffect(() => {
    const loadUsdcBalance = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;
      
      try {
        setIsLoadingUsdcBalance(true);
        
        // Connect to the wallet
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const account = accounts[0].address;
          const balance = await getUsdcBalance(account);
          setUsdcBalance(balance);
        }
      } catch (err) {
        console.error('Failed to load USDC balance:', err);
      } finally {
        setIsLoadingUsdcBalance(false);
      }
    };
    
    loadUsdcBalance();
  }, []);
  
  // Validate input when it changes
  useEffect(() => {
    if (!userFriendlyAmount) {
      setInputValid(true);
      return;
    }
    
    try {
      // Check if input is a valid number
      const amount = parseFloat(userFriendlyAmount);
      
      // Validate the input
      if (isNaN(amount) || amount <= 0) {
        setInputValid(false);
        return;
      }
      
      // Validate against max amount using listing.amount
      const maxAmount = parseFloat(ethers.formatUnits(listing.amount, 18));
      if (amount > maxAmount) {
        setInputValid(false);
        return;
      }
      
      // Input is valid
      setInputValid(true);
    } catch (e) {
      setInputValid(false);
    }
  }, [userFriendlyAmount, listing.amount]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userFriendlyAmount || !inputValid) {
      setError('Please enter a valid amount');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setEstimatedGasError(null);
    setSuccess(false);
    
    try {
      // Convert to full tokens with 18 decimals
      const result = await buyTokensFromListing(listing.id, actualAmount);
      
      if (result.success) {
        setSuccess(true);
        setUserFriendlyAmount('');
        if (onSuccess) onSuccess();
      } else {
        // Handle specific blockchain errors
        if (result.error?.code === 'CALL_EXCEPTION') {
          setEstimatedGasError('Transaction would fail. You may have insufficient USDC or the contract rejected the transaction.');
        }
        
        setError(result.error?.message || 'Failed to complete purchase');
        if (onError) onError(result.error);
      }
    } catch (err: any) {
      if (err.message?.includes('user rejected transaction')) {
        setError('Transaction was cancelled by user');
      } else if (err.message?.includes('insufficient funds') || err.message?.includes('exceed allowance')) {
        setError('Insufficient USDC balance to complete this transaction');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
      
      if (onError) onError(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Display max amount in user-friendly format using listing.amount
  const maxUserFriendlyAmount = ethers.formatUnits(listing.amount, 18);
  const maxAmount = formatCurrency(listing.amount);
  
  // Set max value in user-friendly format
  const handleSetMax = () => {
    // Convert the full token amount to user-friendly format
    setUserFriendlyAmount(maxUserFriendlyAmount);
  };

  // Set a percentage of the max tokens
  const handleSetPercentage = (percentage: number) => {
    const amount = (parseFloat(maxUserFriendlyAmount) * percentage / 100).toString();
    setUserFriendlyAmount(amount);
  };
  
  // Handle input change with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input or decimal numbers only
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setUserFriendlyAmount(value);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="amount" className="flex items-center text-gray-200 font-medium">
            <span className="bg-blue-500/20 p-1 rounded-md mr-2">
              <svg className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            Amount of tokens to buy
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-1 text-blue-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900/90 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <p className="max-w-xs text-sm text-gray-200">
                    Enter the amount of tokens you want to buy. For example, enter 0.5 for half a token.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <span className="text-xs bg-gray-900/50 px-2 py-1 rounded-md border border-blue-500/20 text-blue-300 font-medium">Available: {maxAmount}</span>
        </div>
        <div className="flex items-center mt-2">
          <div className="relative flex-1">
            <Input
              id="amount"
              type="text"
              value={userFriendlyAmount}
              onChange={handleInputChange}
              placeholder="0.00"
              className={`flex-1 pr-16 text-white placeholder:text-gray-500 bg-gray-900/50 border-blue-500/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${!inputValid && userFriendlyAmount ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-sm text-blue-400 font-medium">TOKENS</span>
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="ml-2 text-blue-400 border-blue-500/30 hover:bg-blue-900/30 hover:text-blue-300"
            onClick={handleSetMax}
            disabled={isSubmitting}
          >
            Max
          </Button>
        </div>
        {!inputValid && userFriendlyAmount && (
          <p className="text-xs text-red-500 mt-1">
            {parseFloat(userFriendlyAmount) > parseFloat(maxUserFriendlyAmount) 
              ? `Amount exceeds available tokens (max: ${maxAmount})` 
              : 'Please enter a valid positive number'}
          </p>
        )}
        
        <div className="grid grid-cols-4 gap-2 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSetPercentage(25)}
            disabled={isSubmitting}
            className="text-xs py-1.5 text-blue-400 border-blue-500/30 hover:bg-blue-900/30 hover:text-blue-300 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-blue-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <span className="relative z-10 font-medium">25%</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSetPercentage(50)}
            disabled={isSubmitting}
            className="text-xs py-1.5 text-purple-400 border-purple-500/30 hover:bg-purple-900/30 hover:text-purple-300 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-purple-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <span className="relative z-10 font-medium">50%</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSetPercentage(75)}
            disabled={isSubmitting}
            className="text-xs py-1.5 text-cyan-400 border-cyan-500/30 hover:bg-cyan-900/30 hover:text-cyan-300 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-cyan-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <span className="relative z-10 font-medium">75%</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSetPercentage(100)}
            disabled={isSubmitting}
            className="text-xs py-1.5 text-green-400 border-green-500/30 hover:bg-green-900/30 hover:text-green-300 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-green-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <span className="relative z-10 font-medium">100%</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-gray-900/80 to-blue-900/20 p-4 rounded-lg border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="bg-green-500/20 p-1 rounded-full mr-2">
              <DollarSign className="h-3.5 w-3.5 text-green-400" />
            </span>
            <span className="text-gray-200 font-medium">Price per token:</span>
          </div>
          <div className="text-right flex items-center bg-gray-900/50 px-3 py-1 rounded-full border border-green-500/30">
            <DollarSign className="h-3.5 w-3.5 mr-1 text-green-400" />
            <span className="font-bold text-green-400">${usdcPricePerToken} USDC</span>
          </div>
        </div>
        
        <div className="border-t border-blue-500/20 my-3"></div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="bg-blue-500/20 p-1 rounded-full mr-2">
              <svg className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8L8 16M8 8L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="text-gray-200 font-medium">Total cost:</span>
          </div>
          <div className="text-right flex items-center bg-gray-900/50 px-3 py-1 rounded-full border border-green-500/30">
            <DollarSign className="h-3.5 w-3.5 mr-1 text-green-400" />
            <span className="font-bold text-green-400">${totalUsdc} USDC</span>
          </div>
        </div>
        
        <div className="border-t border-blue-500/20 my-3 pt-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-medium">Your USDC balance:</span>
            <span className="bg-gray-900/50 px-2 py-1 rounded-md border border-blue-500/20">
              {isLoadingUsdcBalance ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1 text-blue-400" />
                  <span className="text-gray-300">Loading...</span>
                </span>
              ) : (
                <span className="text-blue-400 font-medium">{usdcBalance} USDC</span>
              )}
            </span>
          </div>
        </div>
      </div>
      
      {estimatedGasError && (
        <Alert className="bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] rounded-lg">
          <div className="flex items-center">
            <div className="bg-red-500/20 p-2 rounded-full mr-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-1">Transaction Error</h4>
              <AlertDescription className="text-red-300/90 text-sm">{estimatedGasError}</AlertDescription>
              <p className="text-xs mt-1 text-red-400/80">This usually means the transaction would fail if submitted. Please try a different amount or check your USDC balance.</p>
            </div>
          </div>
        </Alert>
      )}
      
      {error && (
        <Alert className="bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] rounded-lg">
          <div className="flex items-center">
            <div className="bg-red-500/20 p-2 rounded-full mr-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-1">Purchase Error</h4>
              <AlertDescription className="text-red-300/90 text-sm">{error}</AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-gradient-to-r from-green-900/30 to-green-900/10 border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.2)] rounded-lg">
          <div className="flex items-center">
            <div className="bg-green-500/20 p-2 rounded-full mr-3">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-1">Success</h4>
              <AlertDescription className="text-green-300/90 text-sm">Purchase completed successfully! The tokens have been added to your wallet.</AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      
      <Button 
        type="submit" 
        className="w-full relative overflow-hidden group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(74,222,128,0.5)] border border-green-500/30 py-6 mt-4"
        disabled={isSubmitting || success || !inputValid || !userFriendlyAmount}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/30 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></span>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-green-200" />
            <span className="font-medium">Processing purchase...</span>
          </>
        ) : success ? (
          <>
            <Check className="mr-2 h-5 w-5 text-green-300" />
            <span className="font-medium">Purchase Complete</span>
          </>
        ) : (
          <>
            <DollarSign className="mr-2 h-5 w-5 text-green-200" />
            <span className="font-medium">Buy for ${totalUsdc} USDC</span>
          </>
        )}
      </Button>
    </form>
  );
};

export default BuyTokensForm;
