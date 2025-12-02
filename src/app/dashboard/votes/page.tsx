'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { MyVotesClient } from './MyVotesClient';

export default function MyVotesPage() {
  return (
    <ProtectedRoute requiredRole="tenant">
      <MyVotesClient />
    </ProtectedRoute>
  );
}

