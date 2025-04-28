import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, Wallet, Landmark, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { PropertyDto } from '@/types/dtos'; // Reuse PropertyDto
import { tryConvertIpfsUrl, formatCurrency } from '@/services/marketplace'; // Use existing helpers
import { claimRent } from '@/services/property'; // Use the claimRent service
import { toast } from '@/components/ui/use-toast';


interface ClaimableProperty {
    id: string;
    tokenId: number;
    claimableRentFormatted: string;
    tokenAddress: string;
    metadata: {
        name: string;
        image?: string;
        description?: string;
        attributes?: Array<{ trait_type: string; value: string | number; }>;
    };
    // Include other fields from PropertyDto if they might be needed by ClaimableProperty
    totalSupply?: string;
    propertyDetails?: PropertyDto['propertyDetails']; // Reuse type if needed
}

interface ClaimRentFormProps {
    portfolioProperties: ClaimableProperty[]; 
    onSuccess?: (tokenAddress: string) => void; 
    onClose: () => void; 
    handleClaimRent: (tokenAddress: string) => Promise<void>; 
}

// Helper to shorten address
function shortenAddress(address: string): string {
  if (!address || !address.startsWith('0x')) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}


const ClaimRentForm = ({ 
    portfolioProperties, 
    onSuccess, 
    onClose,
    handleClaimRent
}: ClaimRentFormProps) => {
    const [step, setStep] = useState<'select' | 'confirm'>('select');
    const [selectedProperty, setSelectedProperty] = useState<ClaimableProperty | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const canConfirmClaim = selectedProperty ? 
        Number(selectedProperty.claimableRentFormatted.replace(/[^\d.-]/g, '')) > 0 : 
        false;

    const handlePropertySelect = (property: ClaimableProperty) => {
        setSelectedProperty(property);
        setError(null); 
        setSuccess(false); 
        setStep('confirm');
    };

    const handleConfirmClaim = async () => {
        if (!selectedProperty || isSubmitting || !canConfirmClaim) return;

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await handleClaimRent(selectedProperty.tokenAddress); 
            setSuccess(true); 
            if (onSuccess) {
                onSuccess(selectedProperty.tokenAddress);
            }
            setTimeout(() => {
                onClose(); 
            }, 2000); 
        } catch (err: any) {
            setError(err.reason || err.message || "An unexpected error occurred during the claim process.");
            console.error("Claim failed (in form):", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <h3 className="text-sm font-semibold mb-3 text-gray-200">Claim Rent Steps</h3>
            <ol className="flex items-center w-full text-xs text-gray-400 sm:text-sm">
                <li className={`flex items-center ${step === 'select' ? 'text-blue-400 font-semibold' : 'text-gray-500'}`}>
                    <span className={`flex items-center justify-center w-5 h-5 me-2 text-xs border ${step === 'select' ? 'border-blue-400' : 'border-gray-600'} rounded-full shrink-0`}>
                        1
                    </span>
                    Select Property
                    <svg className="w-3 h-3 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4"/>
                    </svg>
                </li>
                <li className={`flex items-center ${step === 'confirm' ? 'text-blue-400 font-semibold' : 'text-gray-500'} ${step !== 'select' ? 'ms-4' : 'ms-4'}`}>
                     <span className={`flex items-center justify-center w-5 h-5 me-2 text-xs border ${step === 'confirm' ? 'border-blue-400' : 'border-gray-600'} rounded-full shrink-0`}>
                        2
                    </span>
                    Confirm & Claim
                </li>
            </ol>
        </div>
    );

    const renderSelectStep = () => (
        <div>
            <h4 className="text-md font-semibold mb-4 text-gray-100">Select Property to Claim Rent From</h4>
            {portfolioProperties.length === 0 ? (
                <p className="text-center text-gray-400 py-6">You do not hold tokens for any properties.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                    {portfolioProperties.map((prop) => {
                        const imageUrl = prop.metadata?.image ? tryConvertIpfsUrl(prop.metadata.image) : '/property-placeholder.jpg';
                        const hasClaimableRent = Number(prop.claimableRentFormatted.replace(/[^\d.-]/g, '')) > 0;
                        return (
                            <Card 
                                key={prop.tokenAddress} 
                                className={`cursor-pointer hover:border-blue-500/70 transition-colors bg-gray-800/60 border ${hasClaimableRent ? 'border-green-700/30' : 'border-gray-700/50'}`}
                                onClick={() => handlePropertySelect(prop)}
                            >
                                <CardHeader className="flex flex-row items-center gap-3 p-3">
                                    <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                        <Image src={imageUrl} alt={prop.metadata.name} fill className="object-cover" sizes="40px"/>
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm line-clamp-1 text-white">{prop.metadata.name}</CardTitle>
                                        <CardDescription className="text-xs text-gray-300">
                                            Token: {shortenAddress(prop.tokenAddress)}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                     <div className={`text-sm flex justify-between items-center font-medium ${hasClaimableRent ? 'text-green-400' : 'text-gray-500'}`}>
                                         <span className="text-gray-300">Claimable:</span>
                                         <span>{prop.claimableRentFormatted}</span>
                                     </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
            <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
        </div>
    );

    const renderConfirmStep = () => {
        if (!selectedProperty) return null; 
        const imageUrl = selectedProperty.metadata?.image ? tryConvertIpfsUrl(selectedProperty.metadata.image) : '/property-placeholder.jpg';

        return (
            <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-100">Confirm Claim Details</h4>
                
                <Card className="bg-gray-800/60 border border-gray-700/50">
                     <CardHeader className="flex flex-row items-center gap-4 p-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={imageUrl} alt={selectedProperty.metadata.name} fill className="object-cover" sizes="64px"/>
                        </div>
                        <div>
                            <CardTitle className="text-lg text-white">{selectedProperty.metadata.name}</CardTitle>
                            <CardDescription className="text-sm text-gray-300">
                                Token: {shortenAddress(selectedProperty.tokenAddress)}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className={`text-lg flex justify-between items-center font-bold px-4 py-2 rounded-md ${canConfirmClaim ? 'text-green-300 bg-green-900/30' : 'text-gray-400 bg-gray-800/40'}`}>
                             <span className="flex items-center text-gray-200"><Wallet className="w-5 h-5 mr-2"/> Amount to Claim:</span>
                             <span>{selectedProperty.claimableRentFormatted}</span>
                         </div>
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert className="bg-green-500/20 text-green-300 border-green-500/30">
                        <Check className="h-4 w-4" />
                        <AlertDescription>Rent claimed successfully! Closing modal...</AlertDescription>
                    </Alert>
                )}

                {!canConfirmClaim && !isSubmitting && !success && (
                    <Alert variant="default" className="bg-yellow-900/20 border-yellow-700/30 text-yellow-300">
                         <AlertCircle className="h-4 w-4" />
                         <AlertDescription>Cannot claim $0.00 rent.</AlertDescription>
                    </Alert>
                )}

                <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setStep('select')} disabled={isSubmitting}>
                         <ArrowLeft className="h-4 w-4 mr-2"/> Back
                    </Button>
                    <Button 
                        className="crypto-btn" 
                        onClick={handleConfirmClaim} 
                        disabled={isSubmitting || success || !canConfirmClaim}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Claiming...
                            </>
                        ) : success ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Claimed
                            </>
                        ) : (
                             <>
                                <Landmark className="mr-2 h-4 w-4" />
                                {canConfirmClaim ? 'Confirm Claim' : 'Claim Rent'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-1"> {/* Add padding if needed */}
            {renderStepIndicator()}
            {step === 'select' ? renderSelectStep() : renderConfirmStep()}
        </div>
    );
};

export default ClaimRentForm; 