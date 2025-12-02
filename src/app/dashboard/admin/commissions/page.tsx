'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { CommissionsClient } from './CommissionsClient';

export default function CommissionsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CommissionsClient />
    </ProtectedRoute>
  );
}

