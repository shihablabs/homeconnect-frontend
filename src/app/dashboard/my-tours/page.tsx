'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { MyToursClient } from './MyToursClient';

export default function MyToursPage() {
  return (
    <ProtectedRoute requiredRole="tenant">
      <MyToursClient />
    </ProtectedRoute>
  );
}
