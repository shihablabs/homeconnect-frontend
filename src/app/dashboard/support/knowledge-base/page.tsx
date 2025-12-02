'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { KnowledgeBaseClient } from './KnowledgeBaseClient';

export default function KnowledgeBasePage() {
  return (
    <ProtectedRoute requiredRole={['support', 'admin']}>
      <KnowledgeBaseClient />
    </ProtectedRoute>
  );
}

