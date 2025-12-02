'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AnalyticsClient } from './AnalyticsClient';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AnalyticsClient />
    </ProtectedRoute>
  );
}

