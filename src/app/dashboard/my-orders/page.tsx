'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { MyOrdersClient } from './MyOrdersClient';

export default function MyOrdersPage() {
  return (
    <ProtectedRoute>
      <MyOrdersClient />
    </ProtectedRoute>
  );
}

