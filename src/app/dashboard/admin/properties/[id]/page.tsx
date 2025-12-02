'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { PropertyReviewClient } from './PropertyReviewClient';

export default function PropertyReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute requiredRole="admin">
      <PropertyReviewClient propertyId={id} />
    </ProtectedRoute>
  );
}

