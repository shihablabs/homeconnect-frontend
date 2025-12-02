'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { FinancialReportsClient } from './FinancialReportsClient';

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredRole="landlord">
      <FinancialReportsClient />
    </ProtectedRoute>
  );
}

