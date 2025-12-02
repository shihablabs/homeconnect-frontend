'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { CategoriesManagementClient } from './CategoriesManagementClient';

export default function CategoriesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CategoriesManagementClient />
    </ProtectedRoute>
  );
}

