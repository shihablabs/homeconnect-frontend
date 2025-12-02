'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { ExpensesClient } from './ExpensesClient';

export default function ExpensesPage() {
  return (
    <ProtectedRoute requiredRole="landlord">
      <ExpensesClient />
    </ProtectedRoute>
  );
}

