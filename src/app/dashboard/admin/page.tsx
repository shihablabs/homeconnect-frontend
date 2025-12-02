'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminDashboardClient } from './AdminDashboardClient';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardClient />
    </ProtectedRoute>
  );
}

