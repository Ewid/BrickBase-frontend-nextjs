'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useWriteContract } from 'wagmi';
import DAO_ABI from '@/abis/PropertyDAO.json'; 
import { toast } from "sonner";
import { useRouter } from 'next/navigation';


interface ToastMessage {
    type: 'success' | 'error' | 'info' | 'loading';
    title: string;
    description?: string;
    id?: string; 
}


const DAO_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS as `0x${string}` | undefined;


const proposalFormSchema = z.object({
  targetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, { message: "Invalid Ethereum address" }),
  
  
  callData: z.string().regex(/^0x[a-fA-F0-9]*$/, { message: "Invalid hex data (must start with 0x)" }).min(4, { message: "Call data seems too short" }), 
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(5000, { message: "Description cannot exceed 5000 characters." }),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;


const CreateProposalPage = () => {
  const { address: userAddress, isConnected } = useAccount();
  const router = useRouter(); 
  
  const { writeContract, data: hash, isPending, isSuccess, isError, error: writeError } = useWriteContract(); 
  
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); 
  
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      targetAddress: "",
      callData: "0x",
      description: "",
    },
    mode: "onChange",
  });

  
  const onSubmit = async (data: ProposalFormValues) => {
    console.log("Form submitted:", data);
    setToastMessage(null); 
    
    if (!isConnected || !userAddress) {
        setToastMessage({ type: 'error', title: "Connect Wallet", description: "Please connect your wallet to create a proposal." });
        return;
    }
    if (!DAO_CONTRACT_ADDRESS || !DAO_ABI) {
        setToastMessage({ type: 'error', title: "Configuration Error", description: "DAO interaction is not configured correctly." });
        console.error("Missing DAO Contract address or ABI");
        return;
    }

    
    writeContract({
        address: DAO_CONTRACT_ADDRESS,
        abi: DAO_ABI,
        functionName: 'propose',
        args: [
            [data.targetAddress as `0x${string}`],
            [BigInt(0)], 
            [data.callData as `0x${string}`],
            data.description,
        ],
    });
  };

  
  useEffect(() => {
    if (toastMessage) {
        switch (toastMessage.type) {
            case 'success':
                toast.success(toastMessage.title, { id: toastMessage.id, description: toastMessage.description, duration: toastMessage.id === 'propose-toast' ? 5000 : undefined });
                break;
            case 'error':
                toast.error(toastMessage.title, { id: toastMessage.id, description: toastMessage.description, duration: toastMessage.id === 'propose-toast' ? 5000 : undefined });
                break;
            case 'info':
                toast.info(toastMessage.title, { id: toastMessage.id, description: toastMessage.description });
                break;
            case 'loading':
                toast.loading(toastMessage.title, { id: toastMessage.id, description: toastMessage.description });
                break;
        }
        
        if (toastMessage.type !== 'loading') {
           setTimeout(() => setToastMessage(null), 0); 
        }
    }
  }, [toastMessage]);

   
   useEffect(() => {
        if (isPending) {
            setIsSubmittingForm(true);
            setToastMessage({ type: 'loading', title: "Submitting proposal transaction...", id: 'propose-toast' });
        }
        if (isSuccess) {
            setTimeout(() => setIsSubmittingForm(false), 0); 
            setToastMessage({ 
                type: 'success', 
                title: "Proposal submitted successfully!", 
                id: 'propose-toast', 
                description: `Transaction: ${hash?.substring(0,10)}...`
            });
            form.reset();
            setTimeout(() => router.push('/dao'), 2000);
        }
        if (isError) {
            setTimeout(() => setIsSubmittingForm(false), 0); 
            
            let toastTitle = "Proposal failed";
            let toastDescription = writeError?.message || 'An unknown error occurred.';
            let isHandledError = false; 

            
            
            if (writeError?.message?.includes('User rejected') || writeError?.message?.includes('User denied')) {
                 toastTitle = "Transaction Rejected";
                 toastDescription = "You rejected the transaction in your wallet.";
                 isHandledError = true;
            
            } else if (writeError?.message?.includes('You Must Own At Least 10% of a property to create a proposal')) {
                toastTitle = "Insufficient Tokens";
                toastDescription = "You do not hold enough governance tokens to create a proposal.";
                isHandledError = true;
            }

            
            if (!isHandledError) {
                console.error("Proposal Error:", writeError); 
            }

            setToastMessage({ 
                type: 'error', 
                title: toastTitle, 
                id: 'propose-toast', 
                description: toastDescription
            });
        }
    }, [isPending, isSuccess, isError, hash, writeError, form, router]); 

  
  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Navbar />
      <main className="flex-grow pt-24 pb-10 px-6 w-full">
         <div className="max-w-2xl mx-auto mb-6">
             <Link href="/dao" className="inline-flex items-center text-sm text-crypto-light hover:text-crypto-purple mb-8 group">
                 <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                 Back to Governance
             </Link>
             <h1 className="text-3xl font-bold mb-2">Create <span className="text-gradient">Proposal</span></h1>
             <p className="text-gray-400">Draft a new proposal for the DAO to vote on.</p>
         </div>

        <Card className="glass-card border-0 overflow-hidden w-full max-w-2xl mx-auto">
            <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                    <CardContent className="pt-6 pb-6 space-y-6">
                       <FormField
                          control={form.control}
                          name="targetAddress"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel>Target Contract Address</FormLabel>
                              <FormControl>
                                <Input placeholder="0x..." {...field} className="input-glass font-mono" />
                              </FormControl>
                              <FormDescription>The address of the contract to interact with.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="callData"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel>Function Call Data (Hex)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="0x..." {...field} className="input-glass font-mono min-h-[80px]" />
                              </FormControl>
                              <FormDescription>The encoded function call data (including function selector).</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                         <FormField
                          control={form.control}
                          name="description"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Explain your proposal clearly..." {...field} className="input-glass min-h-[120px]" />
                              </FormControl>
                              <FormDescription>A clear description of what the proposal does and why.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </CardContent>
                    <CardFooter className="bg-gray-800/30 px-6 py-4 flex justify-end">
                        <Button type="submit" className="crypto-btn" disabled={isPending || isSubmittingForm || !isConnected}>
                           {(isPending || isSubmittingForm) ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                           ) : (
                            <><Send className="mr-2 h-4 w-4" /> Submit Proposal</>
                           )}
                        </Button>
                    </CardFooter>
                 </form>
            </Form>
        </Card>

      </main>
      <Footer />
    </div>
  );
};

export default CreateProposalPage; 