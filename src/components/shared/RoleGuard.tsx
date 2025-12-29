

'use client';

import { AuthUser } from '@/redux/features/auth/authSlice';
import { UserRole, checkRoleAccess, hasRole } from '@/utils/roleAccess';
import { ReactNode } from 'react';


type User = AuthUser | {
  role: UserRole | string;
  [key: string]: unknown;
};

interface RoleGuardProps {
  user: User | null | undefined;
  children: ReactNode;
  
  allowedRoles?: UserRole[];
  
  excludedRoles?: UserRole[];
  
  fallback?: ReactNode;
  
  allowUnauthenticated?: boolean;
}


export default function RoleGuard({
  user,
  children,
  allowedRoles,
  excludedRoles,
  fallback = null,
  allowUnauthenticated = false,
}: RoleGuardProps) {
  
  if (!user && !allowUnauthenticated) {
    return <>{fallback}</>;
  }

  
  if (!user && allowUnauthenticated) {
    return <>{children}</>;
  }

  
  if (user) {
    
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = hasRole(user as { role: UserRole }, allowedRoles);
      return hasAccess ? <>{children}</> : <>{fallback}</>;
    }

    
    if (excludedRoles && excludedRoles.length > 0 && !allowedRoles) {
      const userRole = user.role as UserRole;
      const hasAccess = !excludedRoles.includes(userRole);
      return hasAccess ? <>{children}</> : <>{fallback}</>;
    }

    
    if (allowedRoles && excludedRoles) {
      const hasAccess = checkRoleAccess(user as { role: UserRole }, {
        allowed: allowedRoles,
        excluded: excludedRoles,
      });
      return hasAccess ? <>{children}</> : <>{fallback}</>;
    }

    
    return <>{children}</>;
  }

  
  return <>{fallback}</>;
}


export function LandlordOnly({
  user,
  children,
  fallback,
}: {
  user: User | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard user={user} allowedRoles={['landlord']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}


export function AdminOnly({
  user,
  children,
  fallback,
}: {
  user: User | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard user={user} allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}


export function TenantOnly({
  user,
  children,
  fallback,
}: {
  user: User | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard user={user} allowedRoles={['tenant']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}


export function AdminOrSupport({
  user,
  children,
  fallback,
}: {
  user: User | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard
      user={user}
      allowedRoles={['admin', 'support']}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}


export function AdminOrLandlord({
  user,
  children,
  fallback,
}: {
  user: User | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard
      user={user}
      allowedRoles={['admin', 'landlord']}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}


export function NotTenant({
  user,
  children,
  fallback,
}: {
  user: User | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard user={user} excludedRoles={['tenant']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}


