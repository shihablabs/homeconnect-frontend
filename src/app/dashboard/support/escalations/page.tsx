'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { EscalationsClient } from './EscalationsClient';

export default function EscalationsPage() {
  return (
    <ProtectedRoute requiredRole={['support', 'admin']}>
      <EscalationsClient />
    </ProtectedRoute>
  );
}

