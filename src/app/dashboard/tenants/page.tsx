'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TenantsManagementClient } from './TenantsManagementClient';

export default function TenantsPage() {
  return (
    <ProtectedRoute requiredRole="landlord">
      <TenantsManagementClient />
    </ProtectedRoute>
  );
}

