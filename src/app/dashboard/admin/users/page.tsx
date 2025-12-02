'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { UsersManagementClient } from './UsersManagementClient';

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UsersManagementClient />
    </ProtectedRoute>
  );
}

