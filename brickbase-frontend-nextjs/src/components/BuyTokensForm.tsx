import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, Loader2, Info, DollarSign } from 'lucide-react';
import { buyTokensFromListing, formatCurrency } from '@/services/marketplace';
import { ListingDto } from '@/types/dtos';
import { ethers } from 'ethers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BuyTokensFormProps {
  listing: any; // Support both ListingDto and enhanced listing with ethUsdPrice
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
  
  // Convert user-friendly amount to actual token amount (with 18 decimals)
  const actualAmount = userFriendlyAmount && inputValid
    ? ethers.parseUnits(userFriendlyAmount, 18).toString()
    : '0';
  
  // Calculate the total price based on amount
  const totalPrice = userFriendlyAmount && inputValid
    ? formatCurrency((BigInt(actualAmount) * BigInt(listing.pricePerToken) / BigInt(10**18)).toString()) 
    : '0';
    
  // Calculate USD value if ethUsdPrice is available
  const usdValue = (listing.ethUsdPrice && userFriendlyAmount && inputValid)
    ? (parseFloat(totalPrice) * listing.ethUsdPrice).toFixed(2)
    : undefined;
  
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
      
      // Validate against max amount
      const maxAmount = parseFloat(ethers.formatUnits(listing.tokenAmount, 18));
      if (amount > maxAmount) {
        setInputValid(false);
        return;
      }
      
      // Input is valid
      setInputValid(true);
    } catch (e) {
      setInputValid(false);
    }
  }, [userFriendlyAmount, listing.tokenAmount]);
  
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
        if (result.error?.code === 'CALL_EXCEPTION' || result.error?.message?.includes('estimateGas')) {
          setEstimatedGasError('Transaction would fail. You may have insufficient funds or the contract rejected the transaction.');
        }
        
        setError(result.error?.message || 'Failed to complete purchase');
        if (onError) onError(result.error);
      }
    } catch (err: any) {
      if (err.message?.includes('user rejected transaction')) {
        setError('Transaction was cancelled by user');
      } else if (err.message?.includes('insufficient funds')) {
        setError('Insufficient ETH balance to complete this transaction');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
      
      if (onError) onError(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Display max amount in user-friendly format
  const maxUserFriendlyAmount = ethers.formatUnits(listing.tokenAmount, 18);
  const maxAmount = formatCurrency(listing.tokenAmount);
  
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
        <div className="flex justify-between items-center">
          <Label htmlFor="amount" className="flex items-center">
            Amount of tokens to buy
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-1 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Enter the amount of tokens you want to buy. For example, enter 0.5 for half a token.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <span className="text-xs text-gray-400">Available: {maxAmount}</span>
        </div>
        <div className="flex items-center mt-1.5">
          <div className="relative flex-1">
            <Input
              id="amount"
              type="text"
              value={userFriendlyAmount}
              onChange={handleInputChange}
              placeholder="0.00"
              className={`flex-1 pr-16 ${!inputValid && userFriendlyAmount ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-sm text-gray-400">tokens</span>
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="ml-2"
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
        
        <div className="grid grid-cols-4 gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSetPercentage(25)}
            disabled={isSubmitting}
            className="text-xs py-1"
          >
            25%
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSetPercentage(50)}
            disabled={isSubmitting}
            className="text-xs py-1"
          >
            50%
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSetPercentage(75)}
            disabled={isSubmitting}
            className="text-xs py-1"
          >
            75%
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSetPercentage(100)}
            disabled={isSubmitting}
            className="text-xs py-1"
          >
            100%
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-800/50 p-3 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Price per token:</span>
          <span>{formatCurrency(listing.pricePerToken)} ETH</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-gray-300">Total price:</span>
          <div className="text-right">
            <span className="font-bold">{totalPrice} ETH</span>
            {usdValue && (
              <div className="text-xs text-gray-400 flex items-center justify-end mt-0.5">
                <DollarSign className="h-3 w-3 mr-0.5" />
                <span>${usdValue} USD</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {estimatedGasError && (
        <Alert variant="destructive" className="bg-amber-600/20 border-amber-500/30 text-amber-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{estimatedGasError}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-500/20 text-green-300 border-green-500/30">
          <Check className="h-4 w-4" />
          <AlertDescription>Purchase successful!</AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="submit" 
        className="w-full crypto-btn"
        disabled={isSubmitting || success || !inputValid || !userFriendlyAmount}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : success ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Completed
          </>
        ) : (
          'Buy Tokens'
        )}
      </Button>
    </form>
  );
};

export default BuyTokensForm; 