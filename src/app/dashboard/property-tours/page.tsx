'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { PropertyToursClient } from './PropertyToursClient';

export default function PropertyToursPage() {
  return (
    <ProtectedRoute requiredRole="landlord">
      <PropertyToursClient />
    </ProtectedRoute>
  );
}

