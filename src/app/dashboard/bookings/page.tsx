'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { BookingsDashboardClient } from './BookingsDashboardClient';

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingsDashboardClient />
    </ProtectedRoute>
  );
}

