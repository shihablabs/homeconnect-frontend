'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TenantApplicationsClient } from './TenantApplicationsClient';

export default function TenantApplicationsPage() {
  return (
    <ProtectedRoute requiredRole="landlord">
      <TenantApplicationsClient />
    </ProtectedRoute>
  );
}

