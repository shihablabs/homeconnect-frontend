'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { NotificationsDashboardClient } from './NotificationsDashboardClient';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsDashboardClient />
    </ProtectedRoute>
  );
}

