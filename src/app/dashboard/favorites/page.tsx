'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { FavoritesClient } from './FavoritesClient';

export default function DashboardFavoritesPage() {
  return (
    <ProtectedRoute requiredRole={['tenant', 'landlord']}>
      <FavoritesClient />
    </ProtectedRoute>
  );
}
