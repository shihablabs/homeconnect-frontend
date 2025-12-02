'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { PropertyVerificationClient } from './PropertyVerificationClient';

export default function AdminPropertiesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PropertyVerificationClient />
    </ProtectedRoute>
  );
}

