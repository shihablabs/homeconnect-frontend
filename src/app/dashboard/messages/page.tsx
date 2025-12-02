'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { MessagesDashboardClient } from './MessagesDashboardClient';

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesDashboardClient />
    </ProtectedRoute>
  );
}
