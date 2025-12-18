'use client';

import { ProtectedRoute } from '@/components/protected-route';
import NewsletterSubscribersClient from './NewsletterSubscribersClient';

export default function NewsletterSubscribersPage() {
  return (
    <ProtectedRoute requiredRole={['admin', 'support']}>
      <NewsletterSubscribersClient />
    </ProtectedRoute>
  );
}
