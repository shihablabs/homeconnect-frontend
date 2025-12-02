'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { StaffManagementClient } from './StaffManagementClient';

export default function StaffPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <StaffManagementClient />
    </ProtectedRoute>
  );
}

