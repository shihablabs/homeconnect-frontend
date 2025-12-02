'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { MaintenanceDashboardClient } from './MaintenanceDashboardClient';

export default function MaintenancePage() {
  return (
    <ProtectedRoute>
      <MaintenanceDashboardClient />
    </ProtectedRoute>
  );
}

