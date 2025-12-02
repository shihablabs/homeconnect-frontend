'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { MyRentalsClient } from './MyRentalsClient';

export default function MyRentalsPage() {
  return (
    <ProtectedRoute requiredRole="tenant">
      <MyRentalsClient />
    </ProtectedRoute>
  );
}

