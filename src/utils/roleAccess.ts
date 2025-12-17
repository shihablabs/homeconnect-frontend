/**
 * Role-based Access Control Utility
 * 
 * এই utility file টি role-based conditional rendering এর জন্য ব্যবহার করা হয়
 * 
 * Usage Examples:
 * 1. hasRole(user, ['landlord']) - শুধু landlord
 * 2. hasRole(user, ['admin', 'landlord']) - admin অথবা landlord
 * 3. hasAnyRole(user, ['admin', 'landlord']) - admin অথবা landlord (same as above)
 * 4. hasAllRoles(user, ['admin', 'landlord']) - admin এবং landlord দুটোই
 * 5. excludeRoles(user, ['tenant']) - tenant ছাড়া সব
 */

export type UserRole = 'tenant' | 'landlord' | 'admin' | 'support';

// Flexible User interface that accepts both UserRole and string for compatibility
export interface User {
  role: UserRole | string;
  [key: string]: unknown;
}

/**
 * Check if user has any of the specified roles
 * @param user - Current user object (can be null/undefined)
 * @param roles - Array of roles to check
 * @returns true if user has any of the specified roles
 * 
 * Example: hasRole(user, ['landlord']) - শুধু landlord এর জন্য
 * Example: hasRole(user, ['admin', 'landlord']) - admin অথবা landlord এর জন্য
 */
export function hasRole(
  user: User | null | undefined,
  roles: UserRole[]
): boolean {
  if (!user || !user.role) return false;
  // Handle both string and UserRole types
  const userRole = user.role as string;
  return roles.some(role => role === userRole);
}

/**
 * Alias for hasRole - same functionality
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  user: User | null | undefined,
  roles: UserRole[]
): boolean {
  return hasRole(user, roles);
}

/**
 * Check if user has ALL of the specified roles
 * (Useful for multi-role scenarios, though rare)
 * @param user - Current user object
 * @param roles - Array of roles to check
 * @returns true if user has all specified roles
 */
export function hasAllRoles(
  user: User | null | undefined,
  roles: UserRole[]
): boolean {
  if (!user || !user.role) return false;
  const userRole = user.role as string;
  return roles.every(role => role === userRole);
}

/**
 * Check if user does NOT have any of the excluded roles
 * @param user - Current user object
 * @param excludedRoles - Array of roles to exclude
 * @returns true if user does NOT have any excluded role
 * 
 * Example: excludeRoles(user, ['tenant']) - tenant ছাড়া সব role এর জন্য
 */
export function excludeRoles(
  user: User | null | undefined,
  excludedRoles: UserRole[]
): boolean {
  if (!user || !user.role) return false;
  const userRole = user.role as string;
  return !excludedRoles.includes(userRole as UserRole);
}

/**
 * Check if user is specifically a landlord
 */
export function isLandlord(user: User | null | undefined): boolean {
  return hasRole(user, ['landlord']);
}

/**
 * Check if user is specifically an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  return hasRole(user, ['admin']);
}

/**
 * Check if user is specifically a tenant
 */
export function isTenant(user: User | null | undefined): boolean {
  return hasRole(user, ['tenant']);
}

/**
 * Check if user is support
 */
export function isSupport(user: User | null | undefined): boolean {
  return hasRole(user, ['support']);
}

/**
 * Check if user is admin or support (for admin panel access)
 */
export function isAdminOrSupport(user: User | null | undefined): boolean {
  return hasRole(user, ['admin', 'support']);
}

/**
 * Complex role checking with multiple conditions
 * 
 * @param user - Current user object
 * @param config - Configuration object with allowed and excluded roles
 * @returns true if user matches the criteria
 * 
 * Example:
 * checkRoleAccess(user, {
 *   allowed: ['admin', 'landlord'],
 *   excluded: ['tenant']
 * })
 * This means: admin বা landlord কিন্তু tenant নয়
 */
export function checkRoleAccess(
  user: User | null | undefined,
  config: {
    allowed?: UserRole[];
    excluded?: UserRole[];
  }
): boolean {
  if (!user || !user.role) return false;

  const userRole = user.role as string;

  // If excluded roles are specified and user has one, deny access
  if (config.excluded && config.excluded.includes(userRole as UserRole)) {
    return false;
  }

  // If allowed roles are specified, user must have one of them
  if (config.allowed && config.allowed.length > 0) {
    return config.allowed.includes(userRole as UserRole);
  }

  // If only excluded is specified and user doesn't have excluded role, allow
  if (config.excluded && !config.excluded.includes(userRole as UserRole)) {
    return true;
  }

  return false;
}


