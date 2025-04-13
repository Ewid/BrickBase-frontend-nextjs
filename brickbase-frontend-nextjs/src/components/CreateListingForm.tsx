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
          <Label htmlFor="amount">Amount of tokens to sell</Label>
          <div className="flex items-center mt-1.5">
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount..."
              className="flex-1"
              disabled={isSubmitting || isLoadingBalance || isApproved || step === 'listing'}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="ml-2"
              onClick={handleSetMax}
              disabled={isSubmitting || isLoadingBalance || balance === '0' || isApproved || step === 'listing'}
            >
              Max
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {isLoadingBalance ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Loading balance...
              </span>
            ) : (
              <>Your balance: {formattedBalance} tokens</>
            )}
          </p>
        </div>
        
        <div>
          <Label htmlFor="price" className="flex items-center">
            <DollarSign className="h-3.5 w-3.5 mr-1" />
            Price per token (USDC)
          </Label>
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
            disabled={isSubmitting || step === 'approve' && !isApproved}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Set your price in USDC per token</span>
            <span>Your USDC balance: {isLoadingUsdcBalance ? 'Loading...' : usdcBalance}</span>
          </div>
        </div>
        
        {amount && Number(amount) > 0 && priceUsdc && Number(priceUsdc) > 0 && (
          <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-900/30">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total listing value:</span>
              <div className="flex items-center">
                <DollarSign className="h-3.5 w-3.5 mr-0.5 text-green-400" />
                <span className="font-medium text-green-400">${calculateTotalValueUsdc()} USDC</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Error and success messages */}
        {approvalError && step === 'approve' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{approvalError}</AlertDescription>
          </Alert>
        )}
        
        {error && step === 'listing' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-500/20 text-green-300 border-green-500/30">
            <Check className="h-4 w-4" />
            <AlertDescription>Listing created successfully!</AlertDescription>
          </Alert>
        )}
        
        {/* Submit button changes based on step */}
        {step === 'approve' ? (
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
            disabled={isApproving || isApproved || isLoadingBalance || balance === '0' || !validateAmount(amount) || !amount}
          >
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving tokens...
              </>
            ) : isApproved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Tokens Approved
              </>
            ) : (
              <>
                Approve Tokens
              </>
            )}
          </Button>
        ) : (
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
            disabled={isSubmitting || success || !priceUsdc}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating listing...
              </>
            ) : success ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Listing Created
              </>
            ) : (
              <>
                Create Listing
              </>
            )}
          </Button>
        )}
      </form>
    </div>
  );
};

export default CreateListingForm; 