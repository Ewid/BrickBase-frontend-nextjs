'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming you have Textarea
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';
import CONTRACT_CONFIG from '@/config/contracts';
import PropertyDAOABI from '@/abis/PropertyDAO.json';
import { toast } from '@/components/ui/use-toast';
import { PropertyDto } from '@/types/dtos'; // Import PropertyDto
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Import Select components

interface CreateProposalFormProps {
  ownedTokens: PropertyDto[]; // Add prop to accept owned tokens
  onSuccess?: () => void; // Callback on successful proposal creation
  onClose?: () => void;   // Callback to close the modal/form
}

const CreateProposalForm = ({ ownedTokens, onSuccess, onClose }: CreateProposalFormProps) => {
  const { account } = useAccount();
  const [description, setDescription] = useState('');
  const [targetContract, setTargetContract] = useState('');
  const [functionCallData, setFunctionCallData] = useState('0x'); // Default to empty call data
  const [propertyTokenAddress, setPropertyTokenAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getDaoContract = async (signer: ethers.Signer) => {
    const daoAddress = CONTRACT_CONFIG.PROPERTY_DAO_ADDRESS;
    if (!daoAddress) throw new Error("DAO Contract address not configured.");
    return new ethers.Contract(daoAddress, PropertyDAOABI, signer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!description || !targetContract || !propertyTokenAddress) {
      setError('Please fill in all required fields: Description, Target Contract, and Property Token Address.');
      return;
    }

    // Basic validation for addresses
    if (!ethers.isAddress(targetContract) || !ethers.isAddress(propertyTokenAddress)) {
        setError('Invalid address format for Target Contract or Property Token Address.');
        return;
    }
    
    // Basic validation for call data (must start with 0x)
    if (!functionCallData.startsWith('0x')) {
        setError('Function Call Data must start with 0x.');
        return;
    }

    setIsSubmitting(true);

    try {
      if (!window.ethereum) throw new Error("No Ethereum provider found.");
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = await getDaoContract(signer);

      console.log(`Creating proposal: 
        Description: ${description}
        Target: ${targetContract}
        Call Data: ${functionCallData}
        Token Address: ${propertyTokenAddress}`);

      const tx = await contract.createProposal(
          description,
          targetContract,
          functionCallData,
          propertyTokenAddress
      );

      toast({ title: "Transaction Submitted", description: "Waiting for confirmation..." });
      await tx.wait();

      setSuccess(true);
      toast({ title: "Proposal Created Successfully!" });
      setDescription('');
      setTargetContract('');
      setFunctionCallData('0x');
      setPropertyTokenAddress('');
      if (onSuccess) onSuccess(); // Call success callback
      if (onClose) onClose(); // Close modal on success

    } catch (err: any) {
      console.error("Proposal creation failed:", err);
      const errorMsg = err.reason || err.message || "An error occurred while creating the proposal.";
      setError(errorMsg);
      toast({
          title: "Proposal Creation Failed",
          description: errorMsg,
          variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('CreateProposalForm received ownedTokens:', ownedTokens); // <-- Log received props

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description" className="text-gray-300">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Clearly describe the purpose of the proposal..."
          className="mt-1 text-white placeholder:text-gray-500 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={3}
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Property Token Address Dropdown */}
      <div>
          <Label htmlFor="propertyTokenAddress" className="text-gray-300">Property Token Address</Label>
          <Select 
              value={propertyTokenAddress} 
              onValueChange={(value) => {
                  console.log('Selected Token Address in Dropdown:', value); // <-- Log selected value
                  setPropertyTokenAddress(value);
              }}
              disabled={isSubmitting || ownedTokens.length === 0}
              required
          >
              <SelectTrigger className="w-full mt-1 text-white bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Select a property token..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  {ownedTokens.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500 italic">No owned property tokens found.</div>
                  ) : (
                      ownedTokens.map((token) => {
                          // Ensure we have a valid address for the value
                          const tokenAddr = token.tokenAddress || token.propertyDetails?.associatedPropertyToken;
                          if (!tokenAddr) return null; // Skip if no address
                          return (
                              <SelectItem key={tokenAddr} value={tokenAddr} className="hover:bg-gray-700">
                                  {token.metadata?.name || `Token (${shortenAddress(tokenAddr)})`}
                              </SelectItem>
                          );
                      })
                  )}
              </SelectContent>
          </Select>
          <p className="text-xs text-gray-400 mt-1">Select the token contract used for voting weight on this proposal.</p>
      </div>

      <div>
        <Label htmlFor="targetContract" className="text-gray-300">Target Contract Address</Label>
        <Input
          id="targetContract"
          type="text"
          value={targetContract}
          onChange={(e) => setTargetContract(e.target.value)}
          placeholder="0x... (Contract to call if proposal passes)"
          className="mt-1 text-white placeholder:text-gray-500 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          disabled={isSubmitting}
          required
        />
      </div>
      
       <div>
        <Label htmlFor="functionCallData" className="text-gray-300">Function Call Data</Label>
        <Textarea
          id="functionCallData"
          value={functionCallData}
          onChange={(e) => setFunctionCallData(e.target.value)}
          placeholder="0x... (Encoded function call data)"
          className="mt-1 font-mono text-xs text-white placeholder:text-gray-500 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={3}
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-400 mt-1">Optional: Encoded data for the function call on the target contract. Leave as &apos;0x&apos; for simple proposals.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/20 text-green-300 border-green-500/30">
          <Check className="h-4 w-4" />
          <AlertDescription>Proposal submitted successfully!</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 pt-2">
         <Button 
            type="button" // Important: type="button" so it doesn't submit the form
            variant="outline" 
            onClick={onClose} // Use the onClose callback
            disabled={isSubmitting}
            className="border-gray-700 hover:bg-gray-800"
         >
            Cancel
        </Button>
        <Button 
          type="submit" 
          className="crypto-btn" // Use the main button style
          disabled={isSubmitting || !description || !targetContract || !propertyTokenAddress}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Create Proposal
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Helper function (can be moved to utils if used elsewhere)
function shortenAddress(address: string): string {
  if (!address || !address.startsWith('0x')) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default CreateProposalForm; 