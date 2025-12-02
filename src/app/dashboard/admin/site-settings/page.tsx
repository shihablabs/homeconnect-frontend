'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { SiteSettingsClient } from './SiteSettingsClient';

export default function SiteSettingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SiteSettingsClient />
    </ProtectedRoute>
  );
}

