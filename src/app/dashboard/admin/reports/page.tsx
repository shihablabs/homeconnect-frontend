'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminReportsClient } from './AdminReportsClient';

export default function AdminReportsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminReportsClient />
    </ProtectedRoute>
  );
}

