'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { PaymentsDashboardClient } from './PaymentsDashboardClient';

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <PaymentsDashboardClient />
    </ProtectedRoute>
  );
}

