'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from './ui/spinner';

import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';

type UserRole = 'tenant' | 'landlord' | 'admin' | 'support';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();

  // Check if user role matches required role(s)
  const hasAccess = () => {
    if (!requiredRole) return true; // No role requirement
    if (!user) return false;
    
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return allowedRoles.includes(user.role as UserRole);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only redirect if user is loaded and role doesn't match
    if (user && requiredRole && !hasAccess()) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, requiredRole, router]);

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Redirecting to signin...</span>
      </div>
    );
  }

  // Show loading while user data is being loaded
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Check role only after user is loaded
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