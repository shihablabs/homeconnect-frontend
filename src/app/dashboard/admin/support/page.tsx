'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminSupportClient } from './AdminSupportClient';

export default function AdminSupportPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminSupportClient />
    </ProtectedRoute>
  );
}

