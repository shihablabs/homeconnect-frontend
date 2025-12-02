'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { LeaseAgreementsClient } from './LeaseAgreementsClient';

export default function LeaseAgreementsPage() {
  return (
    <ProtectedRoute requiredRole="tenant">
      <LeaseAgreementsClient />
    </ProtectedRoute>
  );
}

