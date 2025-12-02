'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { UserDetailsClient } from './UserDetailsClient';

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute requiredRole="admin">
      <UserDetailsClient userId={id} />
    </ProtectedRoute>
  );
}

