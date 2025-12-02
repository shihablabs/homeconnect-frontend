'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { RentCollectionClient } from './RentCollectionClient';

export default function RentCollectionPage() {
  return (
    <ProtectedRoute requiredRole="landlord">
      <RentCollectionClient />
    </ProtectedRoute>
  );
}

