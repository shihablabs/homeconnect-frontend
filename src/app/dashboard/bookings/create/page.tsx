'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { CreateBookingClient } from './CreateBookingClient';

export default function CreateBookingPage() {
  return (
    <ProtectedRoute requiredRole="tenant">
      <CreateBookingClient />
    </ProtectedRoute>
  );
}

