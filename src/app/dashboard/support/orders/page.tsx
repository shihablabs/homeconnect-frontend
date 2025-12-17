'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { OrdersManagementClient } from './OrdersManagementClient';

export default function SupportOrdersPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'support']}>
      <OrdersManagementClient />
    </ProtectedRoute>
  );
}

