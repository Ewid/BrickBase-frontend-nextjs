'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

// Create an error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in components:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Create a simple fallback component
const Web3Fallback = () => (
  <div className="text-center py-4">
    <p className="text-sm text-gray-500">Web3 features are currently unavailable.</p>
  </div>
);

// Lazy load the web3 components
const Web3Wrapper = React.lazy(() => import('./Web3Wrapper'));

// Initialize QueryClient only once
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary fallback={<Web3Fallback />}>
          <Suspense fallback={<div>Loading web3 components...</div>}>
            {mounted ? (
              <Web3Wrapper>{children}</Web3Wrapper>
            ) : (
              // Render a placeholder or the children without web3 features
              <>{children}</>
            )}
          </Suspense>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
} 