'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { ethers } from 'ethers';
import CONTRACT_CONFIG from '@/config/contracts';
import PropertyDAOABI from '@/abis/PropertyDAO.json';
import { toast } from '@/components/ui/use-toast';
import { PropertyDto } from '@/types/dtos';
import Image from 'next/image';
import { tryConvertIpfsUrl } from '@/services/marketplace';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Define Proposal Categories ---
const proposalCategories = [
    { key: 'rent', label: 'Rent Price Adjustment' },
    { key: 'renovation', label: 'Property Renovation/Maintenance' },
    { key: 'management', label: 'Update Property Management' },
    { key: 'reserve', label: 'DAO Reserve Fund Allocation' },
    { key: 'other', label: 'Other (Specify in Description)' },
];
// --- End Proposal Categories ---

interface CreateProposalFormProps {
  ownedTokens: PropertyDto[];
  onSuccess?: () => void;
  onClose?: () => void;
}

// Helper function (can be moved to utils if used elsewhere)
function shortenAddress(address: string): string {
  if (!address || !address.startsWith('0x')) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper function to format token IDs (copied from marketplace/page.tsx)
const formatTokenId = (tokenId: string | number | undefined): string => {
  if (tokenId === undefined) return 'Unknown';
  const idStr = typeof tokenId === 'number' ? tokenId.toString() : tokenId;
  if (idStr && idStr.length > 10) {
    return `${idStr.substring(0, 8)}...`;
  }
  return idStr || 'Unknown';
};

// Simplify steps back to 3
type Step = 'selectProperty' | 'enterDetails' | 'submit';

const CreateProposalForm = ({ ownedTokens, onSuccess, onClose }: CreateProposalFormProps) => {
  const { account } = useAccount();
  const [step, setStep] = useState<Step>('selectProperty');
  const [selectedProperty, setSelectedProperty] = useState<PropertyDto | null>(null);
  const [proposalType, setProposalType] = useState<string>(''); // New state for category
  const [description, setDescription] = useState('');
  const [targetContract, setTargetContract] = useState(CONTRACT_CONFIG.PROPERTY_DAO_ADDRESS || '0x0000000000000000000000000000000000000000'); // Default to DAO itself or zero address
  const [functionCallData, setFunctionCallData] = useState('0x'); // Default to empty call
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePropertySelect = (property: PropertyDto) => {
    setSelectedProperty(property);
    setStep('enterDetails'); // Go directly to details after property selection
    setError(null); // Clear errors when moving step
  };

  const handleBack = () => {
    if (step === 'enterDetails') {
      setStep('selectProperty'); // Go back to property selection
      setSelectedProperty(null);
      setProposalType('');
      setDescription('');
      setTargetContract(CONTRACT_CONFIG.PROPERTY_DAO_ADDRESS || '0x0000000000000000000000000000000000000000');
      setFunctionCallData('0x');
      setError(null);
    } 
    // Removed else if for 'selectAction' step
  };

  const getDaoContract = async (signer: ethers.Signer) => {
    const daoAddress = CONTRACT_CONFIG.PROPERTY_DAO_ADDRESS;
    if (!daoAddress) throw new Error("DAO Contract address not configured.");
    return new ethers.Contract(daoAddress, PropertyDAOABI, signer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Simplified validation
    if (!selectedProperty) {
      setError('Please select the property this proposal relates to.');
      setStep('selectProperty');
      return;
    }

    const propertyTokenAddress = selectedProperty.tokenAddress || selectedProperty.propertyDetails?.associatedPropertyToken;
    if (!propertyTokenAddress) {
        setError('Selected property does not have a valid token address.');
        return;
    }

    if (!proposalType) {
        setError('Please select a proposal type/category.');
        return;
    }

    if (!description) {
      setError('Please enter a description for the proposal.');
      return;
    }

    // Basic validation for optional fields if they are filled
    if (targetContract && !ethers.isAddress(targetContract)) {
        setError('Invalid address format for Target Contract.');
        return;
    }
    if (functionCallData && !functionCallData.startsWith('0x')) {
        setError('Function Call Data must start with 0x if provided.');
        return;
    }

    setStep('submit'); // Keep submit step for final confirmation/loading state
    setIsSubmitting(true);

    try {
      if (!window.ethereum) throw new Error("No Ethereum provider found.");
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const daoContract = await getDaoContract(signer);

      // --- Use manually entered target and calldata ---
      const finalTarget = targetContract || ethers.ZeroAddress; // Use ZeroAddress if empty
      const finalCalldata = functionCallData || '0x';
      // --- End --- 

      console.log(`Creating proposal:
        Type: ${proposalType}
        Description: ${description}
        Target: ${finalTarget}
        Call Data: ${finalCalldata}
        Token Address (for voting): ${propertyTokenAddress}`);

      const tx = await daoContract.createProposal(
          description, // Pass full description
          finalTarget,
          finalCalldata,
          propertyTokenAddress
      );

      toast({ title: "Transaction Submitted", description: "Waiting for confirmation..." });
      await tx.wait();

      setSuccess(true);
      toast({ title: "Proposal Created Successfully!" });
      // Optionally reset form fields here or let onClose handle it
      if (onSuccess) onSuccess();
      setTimeout(() => { // Delay closing slightly to show success
        if (onClose) onClose();
      }, 1500);

    } catch (err: any) {
      console.error("Proposal creation failed:", err);
      const errorMsg = err.reason || err.message || "An error occurred while creating the proposal.";
      setError(errorMsg);
      setStep('enterDetails'); // Go back to details step on error
      toast({
          title: "Proposal Creation Failed",
          description: errorMsg,
          variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step Indicator Logic - Simplify back to 3 steps
  const renderStepIndicator = () => {
      const stepsConfig = [
          { key: 'selectProperty', label: 'Select Property', description: 'Choose the property token for voting', completed: step !== 'selectProperty' },
          // Remove 'Select Action' step
          { key: 'enterDetails', label: 'Enter Details', description: 'Describe your proposal', completed: step === 'submit' },
          { key: 'submit', label: 'Submit Proposal', description: 'Confirm transaction in your wallet', completed: success }
      ];
      const currentStepIndex = stepsConfig.findIndex(s => s.key === step);

      return (
          <div className="bg-blue-900/10 rounded-xl p-4 border border-blue-900/20 backdrop-blur-md mb-6">
              <div className="space-y-1 mb-3">
                  <h4 className="text-sm font-medium text-blue-300">Proposal Creation Steps</h4> 
                  <p className="text-xs text-gray-400">
                      Follow the steps to create and submit your governance proposal.
                  </p>
              </div>
              {stepsConfig.map((s, index) => (
                  <React.Fragment key={s.key}>
                      <div className="flex items-center gap-3">
                          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${index <= currentStepIndex || s.completed ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-800 text-gray-500'}`}>
                              {index + 1}
                          </div>
                          <div className="flex-1">
                              <p className="text-sm font-medium text-gray-200">{s.label}</p>
                              <p className="text-xs text-gray-400">{s.description}</p>
                          </div>
                          {index < stepsConfig.length - 1 && (
                              <div className="h-6 flex justify-center ml-[15px] w-px"><div className="border-l border-blue-800/30 h-full"></div></div>
                          )}
                      </div>
                  </React.Fragment>
              ))}
          </div>
      );
  };

  // --- Step 1: Select Property - Updated Styles ---
  if (step === 'selectProperty') {
    return (
      <div className="space-y-6">
        {renderStepIndicator()}
        <h3 className="text-lg font-medium text-gray-100">Select Property for Proposal</h3>
        {/* Use marketplace list item styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
          {ownedTokens.length === 0 ? (
             <div className="col-span-full text-center text-gray-400 py-4">No owned property tokens found.</div>
          ) : (ownedTokens.map((property, index) => {
            const imageUrl = property.metadata?.image ? tryConvertIpfsUrl(property.metadata.image) : null;
            const tokenAddress = property.tokenAddress || property.propertyDetails?.associatedPropertyToken;
            const key = `${property.id}-${property.tokenId || 0}-${index}`;
            
            if (!tokenAddress) return null;

            return (
              // Use marketplace style for list items
              <div 
                key={key}
                onClick={() => handlePropertySelect(property)}
                className="border border-gray-800 hover:border-blue-600/40 rounded-xl p-4 cursor-pointer transition-all bg-gray-900/50 hover:bg-blue-900/30"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-md bg-gray-800 overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <Image 
                        src={imageUrl} 
                        alt={property.metadata?.name || 'Property'} 
                        width={48} // Use size consistent with marketplace modal
                        height={48} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate text-gray-100">{property.metadata?.name || 'Unnamed Property'}</h4>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Token ID: {formatTokenId(property.tokenId)}</span>
                      {/* Maybe add balance here if useful? Requires fetching */}
                    </div>
                    <p className="text-xs text-gray-500 break-words mt-1">Addr: {shortenAddress(tokenAddress)}</p>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
         {/* Keep cancel button styling consistent */}
         <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
             <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="border-gray-700 hover:bg-gray-800"
             >
                Cancel
            </Button>
        </div>
      </div>
    );
  }

  // --- Step 2 & 3: Enter Details & Submit (combined Type selection here) ---
  if ((step === 'enterDetails' || step === 'submit') && selectedProperty) { // Removed selectedAction check
    const imageUrl = selectedProperty.metadata?.image ? tryConvertIpfsUrl(selectedProperty.metadata.image) : null;
    const tokenAddress = selectedProperty.tokenAddress || selectedProperty.propertyDetails?.associatedPropertyToken;

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderStepIndicator()}
        {/* Selected Property Info - Keep styling */}
        <div className="flex items-center gap-4 border-b border-gray-700/50 pb-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-gray-300 hover:text-white -ml-2"
            onClick={handleBack}
            type="button"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
               {imageUrl ? (
                  <Image 
                    src={imageUrl} 
                    alt={selectedProperty.metadata?.name || ''} 
                    width={40} 
                    height={40} 
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-gray-600" />
                  </div>
                )}
            </div>
            <div>
                <h3 className="text-base font-medium text-gray-100">{selectedProperty.metadata?.name || 'Selected Property'}</h3>
                <p className="text-xs text-gray-400">Voting Token: {shortenAddress(tokenAddress || '')}</p>
            </div>
          </div>
        </div>

        {/* Add Proposal Type Dropdown */}
        <div>
            <Label htmlFor="proposalType" className="text-sm mb-2 block font-medium text-gray-200">Proposal Type *</Label>
            <Select onValueChange={setProposalType} value={proposalType} disabled={isSubmitting}>
                <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Select proposal category..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {proposalCategories.map(cat => (
                        <SelectItem key={cat.key} value={cat.key} className="hover:bg-gray-700 focus:bg-gray-700">
                            {cat.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* Form Fields - Use consistent input/textarea styling */}
        <div>
          <Label htmlFor="description" className="text-sm mb-2 block font-medium text-gray-200">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Clearly describe the purpose of the proposal..."
            className="mt-1 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder:text-gray-500"
            rows={3}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Re-introduce optional/advanced Target Contract and Calldata inputs */}
        <div className="border-t border-gray-700/50 pt-4 mt-4 space-y-4">
             <p className="text-xs text-gray-400">Optional: For proposals involving direct contract calls (advanced users).</p>
             <div>
                 <Label htmlFor="targetContract" className="text-sm mb-2 block font-medium text-gray-300">Target Contract Address (Optional)</Label>
                 <Input
                     id="targetContract"
                     type="text"
                     value={targetContract}
                     onChange={(e) => setTargetContract(e.target.value)}
                     placeholder="0x... (Defaults to DAO contract)"
                     className="mt-1 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder:text-gray-500"
                     disabled={isSubmitting}
                 />
             </div>
             <div>
                 <Label htmlFor="functionCallData" className="text-sm mb-2 block font-medium text-gray-300">Function Call Data (Optional)</Label>
                 <Textarea
                     id="functionCallData"
                     value={functionCallData}
                     onChange={(e) => setFunctionCallData(e.target.value)}
                     placeholder="0x... (Defaults to empty call)"
                     className="mt-1 font-mono text-xs bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder:text-gray-500"
                     rows={2}
                     disabled={isSubmitting}
                 />
             </div>
        </div>

        {/* Error Alert - Keep styling */}
        {error && (
          <Alert variant="destructive" className="bg-red-900/30 border border-red-800 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit/Back Buttons - Use consistent button styles */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleBack} 
            disabled={isSubmitting}
             className="border-gray-700 hover:bg-gray-800"
          >
            Back
          </Button>
          <Button 
            type="submit" 
            className="crypto-btn"
            disabled={isSubmitting || success || !description || !proposalType || !selectedProperty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : success ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Proposal Submitted
              </>
            ) : (
              <>
                Submit Proposal
              </>
            )}
          </Button>
        </div>
      </form>
    );
  }

  // Fallback - Keep styling
  return (
     <div className="text-center text-gray-400 py-4">
        Please select a property to start creating a proposal.
        <Button variant="outline" onClick={onClose} className="mt-4 border-gray-700 hover:bg-gray-800">Close</Button>
     </div>
  );
};

export default CreateProposalForm; 