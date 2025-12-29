

export type UserRole = 'tenant' | 'landlord' | 'admin' | 'support';


export interface User {
  role: UserRole | string;
  [key: string]: unknown;
}


export function hasRole(
  user: User | null | undefined,
  roles: UserRole[]
): boolean {
  if (!user || !user.role) return false;
  
  const userRole = user.role as string;
  return roles.some(role => role === userRole);
}


export function hasAnyRole(
  user: User | null | undefined,
  roles: UserRole[]
): boolean {
  return hasRole(user, roles);
}


export function hasAllRoles(
  user: User | null | undefined,
  roles: UserRole[]
): boolean {
  if (!user || !user.role) return false;
  const userRole = user.role as string;
  return roles.every(role => role === userRole);
}


export function excludeRoles(
  user: User | null | undefined,
  excludedRoles: UserRole[]
): boolean {
  if (!user || !user.role) return false;
  const userRole = user.role as string;
  return !excludedRoles.includes(userRole as UserRole);
}


export function isLandlord(user: User | null | undefined): boolean {
  return hasRole(user, ['landlord']);
}


export function isAdmin(user: User | null | undefined): boolean {
  return hasRole(user, ['admin']);
}


export function isTenant(user: User | null | undefined): boolean {
  return hasRole(user, ['tenant']);
}


export function isSupport(user: User | null | undefined): boolean {
  return hasRole(user, ['support']);
}


export function isAdminOrSupport(user: User | null | undefined): boolean {
  return hasRole(user, ['admin', 'support']);
}


export function checkRoleAccess(
  user: User | null | undefined,
  config: {
    allowed?: UserRole[];
    excluded?: UserRole[];
  }
): boolean {
  if (!user || !user.role) return false;

  const userRole = user.role as string;

  
  if (config.excluded && config.excluded.includes(userRole as UserRole)) {
    return false;
  }

  
  if (config.allowed && config.allowed.length > 0) {
    return config.allowed.includes(userRole as UserRole);
  }

  
  if (config.excluded && !config.excluded.includes(userRole as UserRole)) {
    return true;
  }

  return false;
}


