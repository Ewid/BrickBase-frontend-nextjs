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
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Loader2, AlertTriangle, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useWriteContract } from 'wagmi';
import DAO_ABI from '@/abis/PropertyDAO.json'; // Import the ABI
import { toast } from "sonner";
import { parseEther } from 'ethers'; // For handling ETH values if needed
import { useRouter } from 'next/navigation'; // Import useRouter for redirect

// --- Constants --- TODO: Move to config/env
const DAO_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS as `0x${string}` | undefined;

// --- Zod Schema for Form Validation ---
const proposalFormSchema = z.object({
  targetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, { message: "Invalid Ethereum address" }),
  // Assuming value is always 0 for now, can add field if needed
  // value: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, { message: "Invalid value" }),
  callData: z.string().regex(/^0x[a-fA-F0-9]*$/, { message: "Invalid hex data (must start with 0x)" }).min(4, { message: "Call data seems too short" }), // Basic hex validation
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(5000, { message: "Description cannot exceed 5000 characters." }),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

// --- Component --- 
const CreateProposalPage = () => {
  const { address: userAddress, isConnected } = useAccount();
  const router = useRouter(); // Initialize router
  // Add useWriteContract setup for proposal creation
  const { writeContract, data: hash, isPending, isSuccess, isError, error: writeError } = useWriteContract(); 
  // Rename state to avoid conflict with isPending from hook
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); 

  // React Hook Form setup
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      targetAddress: "",
      callData: "0x",
      description: "",
    },
    mode: "onChange",
  });

  // --- Form Submission Handler ---
  const onSubmit = async (data: ProposalFormValues) => {
    // Use isPending from the hook to manage loading state related to transaction
    // setIsSubmittingForm(true); // We'll rely on isPending now
    console.log("Form submitted:", data);
    
    if (!isConnected || !userAddress) {
        toast.error("Please connect your wallet to create a proposal.");
        // setIsSubmittingForm(false);
        return;
    }
    // Ensure ABI and Address are present before attempting write
    if (!DAO_CONTRACT_ADDRESS || !DAO_ABI) {
        toast.error("DAO interaction is not configured correctly.");
        console.error("Missing DAO Contract address or ABI");
        // setIsSubmittingForm(false);
        return;
    }

    // --- Implement writeContract call for 'propose' function ---
    writeContract({
        address: DAO_CONTRACT_ADDRESS,
        abi: DAO_ABI,
        functionName: 'propose',
        args: [
            [data.targetAddress as `0x${string}`], // targets (array)
            [BigInt(0)], // values (array - Use BigInt(0) instead of 0n)
            [data.callData as `0x${string}`], // calldatas (array)
            data.description, // description (string)
        ],
    });
  };

   // --- Add useEffect to handle writeContract status ---
   useEffect(() => {
        if (isPending) {
            setIsSubmittingForm(true); // Show loading state on button
            toast.loading("Submitting proposal transaction...", { id: 'propose-toast' });
        }
        if (isSuccess) {
            setIsSubmittingForm(false);
            toast.success("Proposal submitted successfully!", { 
                id: 'propose-toast', 
                description: `Transaction: ${hash?.substring(0,10)}...`,
                duration: 5000
            });
            form.reset(); // Reset form on success
            // Redirect user back to DAO page after a short delay
            setTimeout(() => router.push('/dao'), 2000);
        }
        if (isError) {
            setIsSubmittingForm(false);
            console.error("Proposal Error:", writeError);
            toast.error("Proposal failed", { 
                id: 'propose-toast', 
                description: writeError?.message || 'An unknown error occurred.',
                duration: 5000
            });
        }
    // Add router to dependency array if used inside effect
    }, [isPending, isSuccess, isError, hash, writeError, form, router]); 


  // --- Render Logic --- 
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
                         {/* Disable button based on transaction pending state or if wallet not connected */}
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