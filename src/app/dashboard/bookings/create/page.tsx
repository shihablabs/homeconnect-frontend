'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { Suspense } from 'react';
import { CreateBookingClient } from './CreateBookingClient';

export default function CreateBookingPage() {
  return (
    <ProtectedRoute requiredRole="tenant">
      <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
        <CreateBookingClient />
      </Suspense>
    </ProtectedRoute>
  );
}

