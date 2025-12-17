'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { UsersDashboardClient } from './UsersDashboardClient';

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole={["admin", "support"]}>
      <UsersDashboardClient />
    </ProtectedRoute>
  );
}

