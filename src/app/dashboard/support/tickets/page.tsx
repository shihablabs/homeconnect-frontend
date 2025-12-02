'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { SupportTicketsClient } from './SupportTicketsClient';

export default function SupportTicketsPage() {
  return (
    <ProtectedRoute requiredRole={['support', 'admin']}>
      <SupportTicketsClient />
    </ProtectedRoute>
  );
}

