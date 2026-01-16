'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Something went wrong!</h2>
          <p className="mt-4 text-gray-500">We apologize for the inconvenience. A critical error occurred.</p>
          <div className="mt-8 flex gap-4">
            <Button onClick={() => reset()} variant="default">Try again</Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">Go Home</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
