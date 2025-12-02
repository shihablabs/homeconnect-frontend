'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TenantSupportClient } from './TenantSupportClient';
import { SupportDashboardClient } from './SupportDashboardClient';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';

export default function SupportPage() {
  const user = useAppSelector(selectCurrentUser);

  // Show support dashboard for support role, tenant support for tenants
  if (user?.role === 'support') {
    return (
      <ProtectedRoute requiredRole="support">
        <SupportDashboardClient />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="tenant">
      <TenantSupportClient />
    </ProtectedRoute>
  );
}

