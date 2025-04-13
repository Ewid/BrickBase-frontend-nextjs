import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { createListing, getTokenBalance, formatCurrency } from '@/services/marketplace';
import { PropertyDto } from '@/types/dtos';
import { useAccount } from '@/hooks/useAccount';

interface CreateListingFormProps {
  property: PropertyDto;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const CreateListingForm = ({ property, onSuccess, onError }: CreateListingFormProps) => {
  const { account } = useAccount();
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  const propertyTokenAddress = property?.propertyDetails?.associatedPropertyToken || '';
  
  // Load token balance for the user
  useEffect(() => {
    const loadBalance = async () => {
      if (!account || !propertyTokenAddress) return;
      
      setIsLoadingBalance(true);
      try {
        const userBalance = await getTokenBalance(propertyTokenAddress, account);
        setBalance(userBalance);
      } catch (err) {
        console.error('Failed to load token balance:', err);
        setBalance('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };
    
    loadBalance();
  }, [account, propertyTokenAddress]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid token amount');
      return;
    }
    
    if (!price || Number(price) <= 0) {
      setError('Please enter a valid price per token');
      return;
    }
    
    // Convert price to wei (assuming 18 decimals)
    const priceInWei = (BigInt(Math.floor(Number(price) * 10**18))).toString();
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await createListing(propertyTokenAddress, amount, priceInWei);
      
      if (result.success) {
        setSuccess(true);
        setAmount('');
        setPrice('');
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
  
  const displayBalance = formatCurrency(balance);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount of tokens to sell</Label>
        <div className="flex items-center mt-1.5">
          <Input
            id="amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            className="flex-1"
            disabled={isSubmitting || isLoadingBalance}
          />
          <Button 
            type="button" 
            variant="outline" 
            className="ml-2"
            onClick={() => setAmount(balance)}
            disabled={isSubmitting || isLoadingBalance || balance === '0'}
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
            <>Your balance: {displayBalance} tokens</>
          )}
        </p>
      </div>
      
      <div>
        <Label htmlFor="price">Price per token (ETH)</Label>
        <Input
          id="price"
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.01"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-400 mt-1">Set your price in ETH per token</p>
      </div>
      
      {error && (
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
      
      <Button 
        type="submit" 
        className="w-full crypto-btn"
        disabled={isSubmitting || success || isLoadingBalance || balance === '0'}
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
          'Create Listing'
        )}
      </Button>
    </form>
  );
};

export default CreateListingForm; 