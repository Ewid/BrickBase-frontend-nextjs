import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import { createListing, getTokenBalance, formatCurrency, getUsdcBalance, approveTokens } from '@/services/marketplace';
import { PropertyDto } from '@/types/dtos';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';

interface CreateListingFormProps {
  property: PropertyDto;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onApprovalStart?: () => void;
  onApprovalComplete?: () => void;
  onListingStart?: () => void;
}

const CreateListingForm = ({ 
  property, 
  onSuccess, 
  onError, 
  onApprovalStart, 
  onApprovalComplete, 
  onListingStart 
}: CreateListingFormProps) => {
  const { account } = useAccount();
  // Use readable token amounts in the form (without decimals)
  const [amount, setAmount] = useState<string>('');
  const [priceUsdc, setPriceUsdc] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [formattedBalance, setFormattedBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [isLoadingUsdcBalance, setIsLoadingUsdcBalance] = useState(false);
  // Add new states for two-step process
  const [step, setStep] = useState<'approve' | 'listing'>('approve');
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  
  const propertyTokenAddress = property?.tokenAddress || property?.propertyDetails?.associatedPropertyToken || '';
  
  // Load token balance for the user
  useEffect(() => {
    const loadBalances = async () => {
      if (!account) return;
      
      // Load property token balance
      if (propertyTokenAddress) {
        setIsLoadingBalance(true);
        try {
          // Get the raw balance in wei
          const userBalance = await getTokenBalance(propertyTokenAddress, account);
          setBalance(userBalance);
          
          // Format it to a human-readable number
          const readableBalance = formatCurrency(userBalance);
          setFormattedBalance(readableBalance);
        } catch (err) {
          console.error('Failed to load token balance:', err);
          setBalance('0');
          setFormattedBalance('0');
        } finally {
          setIsLoadingBalance(false);
        }
      }
      
      // Load USDC balance
      setIsLoadingUsdcBalance(true);
      try {
        const balance = await getUsdcBalance(account);
        setUsdcBalance(balance);
      } catch (err) {
        console.error('Failed to load USDC balance:', err);
        setUsdcBalance('0');
      } finally {
        setIsLoadingUsdcBalance(false);
      }
    };
    
    loadBalances();
  }, [account, propertyTokenAddress]);
  
  // Handle setting max amount (convert to human readable format)
  const handleSetMax = () => {
    // Just set the formatted/human-readable balance
    setAmount(formattedBalance);
  };
  
  const validateAmount = (value: string) => {
    if (!value) return true; // Empty is handled elsewhere
    
    // Ensure it's a valid number
    const numberValue = Number(value);
    if (isNaN(numberValue)) return false;
    if (numberValue <= 0) return false;
    
    // Ensure it's not more than available balance
    const maxBalance = Number(formattedBalance);
    return numberValue <= maxBalance;
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty value for UX
    if (!value) {
      setAmount('');
      return;
    }
    
    // Only allow numeric input with decimals
    if (!/^\d*\.?\d*$/.test(value)) return;
    
    // Ensure amount doesn't exceed available balance
    const numValue = Number(value);
    const maxBalance = Number(formattedBalance);
    
    if (numValue > maxBalance) {
      setAmount(formattedBalance);
    } else {
      setAmount(value);
    }
  };
  
  // Calculate total value in USDC
  const calculateTotalValueUsdc = (): string => {
    if (!amount || !priceUsdc) return '';
    const total = Number(amount) * Number(priceUsdc);
    return total.toFixed(2);
  };
  
  // Handle token approval
  const handleApproveTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || Number(amount) <= 0) {
      setApprovalError('Please enter a valid token amount');
      return;
    }
    
    if (!validateAmount(amount)) {
      setApprovalError(`You can only list up to ${formattedBalance} tokens`);
      return;
    }
    
    setIsApproving(true);
    setApprovalError(null);
    
    // Call the onApprovalStart callback if provided
    if (onApprovalStart) onApprovalStart();
    
    try {
      // Convert human readable amount to wei for the smart contract
      const amountInWei = ethers.parseUnits(amount, 18).toString();
      
      console.log(`Approving ${amount} tokens (${amountInWei} wei) for marketplace`);
      
      // Call the approveTokens function from marketplace service
      const result = await approveTokens(propertyTokenAddress, amountInWei);
      
      if (result.success) {
        setIsApproved(true);
        setStep('listing');
        
        // Call the onApprovalComplete callback if provided
        if (onApprovalComplete) onApprovalComplete();
      } else {
        setApprovalError(result.error?.message || 'Failed to approve tokens');
        if (onError) onError(result.error);
      }
    } catch (err: any) {
      setApprovalError(err.message || 'An unexpected error occurred during approval');
      if (onError) onError(err);
    } finally {
      setIsApproving(false);
    }
  };
  
  // Create listing after approval
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!priceUsdc || Number(priceUsdc) <= 0) {
      setError('Please enter a valid price per token');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    // Call the onListingStart callback if provided
    if (onListingStart) onListingStart();
    
    try {
      // Convert human readable amount to wei for the smart contract
      const amountInWei = ethers.parseUnits(amount, 18).toString();
      
      console.log(`Creating listing for ${amount} tokens (${amountInWei} wei) at $${priceUsdc} USDC per token`);
      
      // Create listing directly with USDC price
      const result = await createListing(propertyTokenAddress, amountInWei, priceUsdc);
      
      if (result.success) {
        setSuccess(true);
        setAmount('');
        setPriceUsdc('');
        // Reset the process for next time
        setStep('approve');
        setIsApproved(false);
        if (onSuccess) onSuccess();
      } else {
        setError(result.error?.message || 'Failed to create listing');
        if (onError) onError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      if (onError) onError(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Approval Step */}
      <form onSubmit={step === 'approve' ? handleApproveTokens : handleCreateListing} className="space-y-4">
        <div>
          <Label htmlFor="amount" className="text-gray-200 font-medium flex items-center">
            <span className="bg-blue-500/20 p-1 rounded-md mr-2">
              <svg className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            Amount of tokens to sell
          </Label>
          <div className="flex items-center mt-1.5">
            <div className="relative flex-1">
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount..."
                className="flex-1 text-white placeholder:text-gray-500 bg-gray-900/50 border-blue-500/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-16"
                disabled={isSubmitting || isLoadingBalance || isApproved || step === 'listing'}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-xs text-blue-400 font-medium">TOKENS</span>
              </div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="ml-2 text-blue-400 border-blue-500/30 hover:bg-blue-900/30 hover:text-blue-300"
              onClick={handleSetMax}
              disabled={isSubmitting || isLoadingBalance || balance === '0' || isApproved || step === 'listing'}
            >
              Max
            </Button>
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <p className="text-gray-400">
              {isLoadingBalance ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Loading balance...
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="text-gray-500">Your balance:</span>
                  <span className="ml-1 text-blue-400 font-medium">{formattedBalance} tokens</span>
                </span>
              )}
            </p>
            {amount && (
              <p className="text-green-400 font-medium">{(Number(amount) / Number(formattedBalance) * 100).toFixed(1)}% of your tokens</p>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="price" className="text-gray-200 font-medium flex items-center">
            <span className="bg-green-500/20 p-1 rounded-md mr-2">
              <DollarSign className="h-3.5 w-3.5 text-green-400" />
            </span>
            Price per token (USDC)
          </Label>
          <div className="relative mt-1.5">
            <Input
              id="price"
              type="text"
              value={priceUsdc}
              onChange={(e) => {
                // Only allow numeric input with decimals
                if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) {
                  setPriceUsdc(e.target.value);
                }
              }}
              placeholder="10.00"
              className="text-white placeholder:text-gray-500 bg-gray-900/50 border-blue-500/30 focus:border-green-500 focus:ring-1 focus:ring-green-500 pl-8 pr-16"
              disabled={isSubmitting || step === 'approve' && !isApproved}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-xs text-green-400 font-medium">USDC</span>
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-gray-400">Set your price in USDC per token</span>
            <span className="flex items-center">
              <span className="text-gray-500">Your USDC balance:</span>
              {isLoadingUsdcBalance ? (
                <span className="flex items-center ml-1">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  <span className="text-gray-400">Loading...</span>
                </span>
              ) : (
                <span className="ml-1 text-green-400 font-medium">{usdcBalance} USDC</span>
              )}
            </span>
          </div>
        </div>
        
        {amount && Number(amount) > 0 && priceUsdc && Number(priceUsdc) > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-lg border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="bg-blue-500/20 p-1 rounded-full mr-2">
                  <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 12H8M12 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="text-sm text-gray-200 font-medium">Total listing value:</span>
              </div>
              <div className="flex items-center bg-gray-900/50 px-3 py-1 rounded-full border border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                <DollarSign className="h-4 w-4 mr-1 text-green-400" />
                <span className="font-medium text-green-400">${calculateTotalValueUsdc()} USDC</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Error and success messages - Enhanced with web3 styling */}
        {approvalError && step === 'approve' && (
          <Alert className="bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] rounded-lg">
            <div className="flex items-center">
              <div className="bg-red-500/20 p-2 rounded-full mr-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-1">Approval Error</h4>
                <AlertDescription className="text-red-300/90 text-sm">{approvalError}</AlertDescription>
              </div>
            </div>
          </Alert>
        )}
        
        {error && step === 'listing' && (
          <Alert className="bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] rounded-lg">
            <div className="flex items-center">
              <div className="bg-red-500/20 p-2 rounded-full mr-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-1">Listing Error</h4>
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
                <AlertDescription className="text-green-300/90 text-sm">Listing created successfully! Your tokens are now available on the marketplace.</AlertDescription>
              </div>
            </div>
          </Alert>
        )}
        
        {/* Submit button changes based on step - Enhanced with web3 styling */}
        {step === 'approve' ? (
          <Button 
            type="submit" 
            className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-500/30 py-6"
            disabled={isApproving || isApproved || isLoadingBalance || balance === '0' || !validateAmount(amount) || !amount}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></span>
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-200" />
                <span className="font-medium">Approving tokens...</span>
              </>
            ) : isApproved ? (
              <>
                <Check className="mr-2 h-5 w-5 text-green-300" />
                <span className="font-medium">Tokens Approved</span>
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5 text-blue-200 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-medium">Approve Tokens</span>
              </>
            )}
          </Button>
        ) : (
          <Button 
            type="submit" 
            className="w-full relative overflow-hidden group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(74,222,128,0.5)] border border-green-500/30 py-6"
            disabled={isSubmitting || success || !priceUsdc}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/30 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></span>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-green-200" />
                <span className="font-medium">Creating listing...</span>
              </>
            ) : success ? (
              <>
                <Check className="mr-2 h-5 w-5 text-green-300" />
                <span className="font-medium">Listing Created</span>
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-5 w-5 text-green-200" />
                <span className="font-medium">Create Listing</span>
              </>
            )}
          </Button>
        )}
      </form>
    </div>
  );
};

export default CreateListingForm;
