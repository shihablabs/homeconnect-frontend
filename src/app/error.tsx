'use client';
 
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
 
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Something went wrong!</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-md">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button
            onClick={() => reset()}
            variant="default"
        >
            Try again
        </Button>
        <Button
            onClick={() => window.location.reload()}
            variant="outline"
        >
            Reload Page
        </Button>
      </div>
    </div>
  );
}
