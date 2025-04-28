'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // Replace with your actual error logging (e.g., Sentry, Bugsnag)
    console.error('Global Error Boundary Caught:', error);
  }, [error]);

  return (
    // global-error must include html and body tags
    <html>
      <body className="bg-crypto-dark text-white flex flex-col items-center justify-center min-h-screen">
        <div className="text-center p-8 rounded-lg bg-gray-800/50 border border-red-500/50 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-300 mb-6">
            An unexpected error occurred in the application. Please try again.
          </p>
          {/* Optional: Display error digest in development */}
          {process.env.NODE_ENV === 'development' && error?.digest && (
            <p className="text-xs text-gray-500 mb-4 font-mono">Digest: {error.digest}</p>
          )}
          <Button
            onClick={() => reset()}
            variant="destructive"
            className="crypto-btn"
          >
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}