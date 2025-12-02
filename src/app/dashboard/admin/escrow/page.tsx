'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { EscrowManagementClient } from './EscrowManagementClient';

export default function EscrowManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <EscrowManagementClient />
    </ProtectedRoute>
  );
}

