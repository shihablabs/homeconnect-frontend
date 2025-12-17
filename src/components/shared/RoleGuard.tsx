/**
 * RoleGuard Component
 * 
 * এই component টি role-based conditional rendering এর জন্য ব্যবহার করা হয়
 * 
 * Usage Examples:
 * 
 * 1. শুধু landlord এর জন্য:
 *    <RoleGuard user={user} allowedRoles={['landlord']}>
 *      <Button>List Property</Button>
 *    </RoleGuard>
 * 
 * 2. Admin অথবা Landlord এর জন্য:
 *    <RoleGuard user={user} allowedRoles={['admin', 'landlord']}>
 *      <MenuItem>Manage Properties</MenuItem>
 *    </RoleGuard>
 * 
 * 3. Tenant ছাড়া সব role এর জন্য:
 *    <RoleGuard user={user} excludedRoles={['tenant']}>
 *      <MenuItem>Add Property</MenuItem>
 *    </RoleGuard>
 * 
 * 4. Complex condition (allowed + excluded):
 *    <RoleGuard 
 *      user={user} 
 *      allowedRoles={['admin', 'landlord']} 
 *      excludedRoles={['tenant']}
 *    >
 *      <MenuItem>Special Feature</MenuItem>
 *    </RoleGuard>
 * 
 * 5. Fallback content (যদি role match না করে):
 *    <RoleGuard 
 *      user={user} 
 *      allowedRoles={['admin']}
 *      fallback={<p>You don't have access</p>}
 *    >
 *      <AdminPanel />
 *    </RoleGuard>
 */

'use client';

import { AuthUser } from '@/redux/features/auth/authSlice';
import { UserRole, checkRoleAccess, hasRole } from '@/utils/roleAccess';
import { ReactNode } from 'react';

// Flexible User type that accepts AuthUser or any object with a role property
type User = AuthUser | {
  role: UserRole | string;
  [key: string]: unknown;
};

interface RoleGuardProps {
  user: User | null | undefined;
  children: ReactNode;
  /**
   * Allowed roles - user must have one of these roles
   * Example: ['landlord'] - শুধু landlord
   * Example: ['admin', 'landlord'] - admin অথবা landlord
   */
  allowedRoles?: UserRole[];
  /**
   * Excluded roles - user must NOT have any of these roles
   * Example: ['tenant'] - tenant ছাড়া সব
   */
  excludedRoles?: UserRole[];
  /**
   * Fallback content to show if role doesn't match
   * If not provided, nothing will be rendered
   */
  fallback?: ReactNode;
  /**
   * If true, component will render children even if user is null/undefined
   * Default: false
   */
  allowUnauthenticated?: boolean;
}

/**
 * RoleGuard Component for conditional rendering based on user roles
 */
export default function RoleGuard({
  user,
  children,
  allowedRoles,
  excludedRoles,
  fallback = null,
  allowUnauthenticated = false,
}: RoleGuardProps) {
  // If no user and not allowing unauthenticated, show fallback or nothing
  if (!user && !allowUnauthenticated) {
    return <>{fallback}</>;
  }

  // If no user but allowing unauthenticated, show children
  if (!user && allowUnauthenticated) {
    return <>{children}</>;
  }

  // If user exists, check role access
  if (user) {
    // Simple allowed roles check
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = hasRole(user as { role: UserRole }, allowedRoles);
      return hasAccess ? <>{children}</> : <>{fallback}</>;
    }

    // Simple excluded roles check
    if (excludedRoles && excludedRoles.length > 0 && !allowedRoles) {
      const userRole = user.role as UserRole;
      const hasAccess = !excludedRoles.includes(userRole);
      return hasAccess ? <>{children}</> : <>{fallback}</>;
    }

    // Complex check with both allowed and excluded
    if (allowedRoles && excludedRoles) {
      const hasAccess = checkRoleAccess(user as { role: UserRole }, {
        allowed: allowedRoles,
        excluded: excludedRoles,
      });
      return hasAccess ? <>{children}</> : <>{fallback}</>;
    }

    // If no conditions specified, show children
    return <>{children}</>;
  }

  // Default: show fallback
  return <>{fallback}</>;
}

/**
 * Convenience component for landlord-only content
 */
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

/**
 * Convenience component for admin-only content
 */
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

/**
 * Convenience component for tenant-only content
 */
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

/**
 * Convenience component for admin or support content
 */
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

/**
 * Convenience component for admin or landlord content
 */
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

/**
 * Convenience component - shows content for everyone EXCEPT tenant
 */
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


