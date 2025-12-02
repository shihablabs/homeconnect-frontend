'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { UserGuidesClient } from './UserGuidesClient';

export default function GuidesPage() {
  return (
    <ProtectedRoute requiredRole={['support', 'admin']}>
      <UserGuidesClient />
    </ProtectedRoute>
  );
}

