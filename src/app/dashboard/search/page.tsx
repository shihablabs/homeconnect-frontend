'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { PropertySearchClient } from './PropertySearchClient';

export default function PropertySearchPage() {
  return (
    <ProtectedRoute requiredRole="tenant">
      <PropertySearchClient />
    </ProtectedRoute>
  );
}

