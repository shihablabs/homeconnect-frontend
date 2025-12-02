'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { LiveChatClient } from './LiveChatClient';

export default function LiveChatPage() {
  return (
    <ProtectedRoute requiredRole={['support', 'admin']}>
      <LiveChatClient />
    </ProtectedRoute>
  );
}

