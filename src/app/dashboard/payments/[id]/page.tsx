'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { PaymentDetailsClient } from './PaymentDetailsClient';

export default function PaymentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <PaymentDetailsClient paymentId={id} />
    </ProtectedRoute>
  );
}

