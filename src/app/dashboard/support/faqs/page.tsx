'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { FAQsManagementClient } from './FAQsManagementClient';

export default function FAQsPage() {
  return (
    <ProtectedRoute requiredRole={['support', 'admin']}>
      <FAQsManagementClient />
    </ProtectedRoute>
  );
}

