'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { BookingDetailsClient } from './BookingDetailsClient';

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <BookingDetailsClient bookingId={id} />
    </ProtectedRoute>
  );
}

