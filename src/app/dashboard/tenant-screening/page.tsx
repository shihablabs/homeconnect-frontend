'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TenantScreeningClient } from './TenantScreeningClient';

export default function TenantScreeningPage() {
  return (
    <ProtectedRoute requiredRole="landlord">
      <TenantScreeningClient />
    </ProtectedRoute>
  );
}

