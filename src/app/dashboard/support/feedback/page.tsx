'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { UserFeedbackClient } from './UserFeedbackClient';

export default function FeedbackPage() {
  return (
    <ProtectedRoute requiredRole={['support', 'admin']}>
      <UserFeedbackClient />
    </ProtectedRoute>
  );
}

