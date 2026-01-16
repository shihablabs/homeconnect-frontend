
"use client";

import { useAuthState } from '@/hooks/useAuthState';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        Swal.fire({
          icon: 'warning',
          title: 'Access Denied',
          text: 'You must be logged in to view this page.',
          confirmButtonColor: '#0f172a',
        }).then(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          router.push(`/login?from=${returnUrl}`);
        });
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: `You do not have permission to view this page. Required: ${allowedRoles.join(' or ')}`,
          confirmButtonColor: '#0f172a',
        }).then(() => {
          router.push('/');
        });
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
};
