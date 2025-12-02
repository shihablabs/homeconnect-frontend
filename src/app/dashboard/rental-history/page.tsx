'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { RentalHistoryClient } from './RentalHistoryClient';

export default function RentalHistoryPage() {
  return (
    <ProtectedRoute requiredRole="tenant">
      <RentalHistoryClient />
    </ProtectedRoute>
  );
}

