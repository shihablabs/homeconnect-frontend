'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { Spinner } from './ui/spinner';

import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsInitialized,
} from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';
import { usePathname } from 'next/navigation';

type UserRole = 'tenant' | 'landlord' | 'admin' | 'support';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();
  const pathname = usePathname();


  const hasAccess = useCallback(() => {
    if (!requiredRole) return true;
    if (!user) return false;

    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return allowedRoles.includes(user.role as UserRole);
  }, [requiredRole, user]);

  useEffect(() => {

    if (!isInitialized) return;


    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?from=${returnUrl}`);
      return;
    }


    if (user && !user.isPhoneVerified && pathname !== '/verify-phone') {
      router.push('/verify-phone');
      return;
    }

    if (user && requiredRole && !hasAccess()) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, user, requiredRole, router, hasAccess, pathname]);


  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Initializing...</span>
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Redirecting to signin...</span>
      </div>
    );
  }


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }


  if (requiredRole && !hasAccess()) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const rolesText = allowedRoles.length === 1
      ? allowedRoles[0] + 's'
      : allowedRoles.join('s, ') + 's';

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-lg font-semibold">Access Denied</p>
          <p className="mt-2 text-muted-foreground">
            This page is only accessible to {rolesText}. Your role: {user.role}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}