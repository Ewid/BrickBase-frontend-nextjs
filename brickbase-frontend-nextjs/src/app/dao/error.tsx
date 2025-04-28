'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DaoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(`DAO Section Error (${error?.digest || 'no digest'}):`, error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="glass-card p-8 max-w-lg border border-red-500/30">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-red-300 mb-3">Error in Governance Section</h2>
        <p className="text-gray-400 mb-6">
          We encountered an issue while loading the DAO proposals or related data. Please try again or check back later.
        </p>
         {/* Optional: Display error message in development */}
        {process.env.NODE_ENV === 'development' && (
           <p className="text-xs text-red-400 mb-4 bg-red-900/20 p-2 rounded font-mono break-words">
             Error: {error.message} {error.digest ? `(Digest: ${error.digest})` : ''}
           </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
           <Link href="/dao" className="inline-block">
              <Button variant="outline" className="w-full sm:w-auto border-crypto-light/30 text-crypto-light hover:bg-crypto-light/10">
                 <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to DAO
              </Button>
           </Link>
           <Button
              onClick={() => reset()}
              variant="destructive"
              className="w-full sm:w-auto crypto-btn"
           >
             Try Again
           </Button>
        </div>
      </div>
    </div>
  );
}