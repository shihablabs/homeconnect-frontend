'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { LeaseTemplatesClient } from './LeaseTemplatesClient';

export default function LeaseTemplatesPage() {
  return (
    <ProtectedRoute requiredRole="landlord">
      <LeaseTemplatesClient />
    </ProtectedRoute>
  );
}

