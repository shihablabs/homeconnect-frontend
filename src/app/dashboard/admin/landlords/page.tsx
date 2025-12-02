'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { LandlordsManagementClient } from './LandlordsManagementClient';

export default function LandlordsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <LandlordsManagementClient />
    </ProtectedRoute>
  );
}

