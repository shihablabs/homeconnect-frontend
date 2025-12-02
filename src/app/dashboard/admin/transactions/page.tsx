'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TransactionsClient } from './TransactionsClient';

export default function TransactionsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <TransactionsClient />
    </ProtectedRoute>
  );
}

