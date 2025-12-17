# Role Access Control - Quick Guide

## 📁 Files Created

1. **`src/utils/roleAccess.ts`** - Utility functions for role checking
2. **`src/components/shared/RoleGuard.tsx`** - React component for conditional rendering
3. **`src/utils/roleAccess.examples.md`** - Detailed examples

## 🚀 Quick Start

### Method 1: Using RoleGuard Component (Recommended)

```tsx
import { LandlordOnly } from "@/components/shared/RoleGuard";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";

function MyComponent() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <LandlordOnly user={user}>
      <Button>List Property</Button>
    </LandlordOnly>
  );
}
```

### Method 2: Using Utility Functions

```tsx
import { hasRole, isLandlord } from "@/utils/roleAccess";

function MyComponent() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <>
      {hasRole(user, ["landlord"]) && <Button>List Property</Button>}
      {isLandlord(user) && <Link href="/properties">My Properties</Link>}
    </>
  );
}
```

## 📋 Common Use Cases

### 1. শুধু Landlord এর জন্য

```tsx
<LandlordOnly user={user}>
  <Button>List Property</Button>
</LandlordOnly>
```

### 2. Admin অথবা Landlord এর জন্য

```tsx
<RoleGuard user={user} allowedRoles={["admin", "landlord"]}>
  <MenuItem>Manage Properties</MenuItem>
</RoleGuard>
```

### 3. Tenant ছাড়া সব role এর জন্য

```tsx
<NotTenant user={user}>
  <MenuItem>Add Property</MenuItem>
</NotTenant>
```

### 4. Admin Panel (Admin বা Support)

```tsx
<AdminOrSupport user={user}>
  <Link href="/dashboard/admin">Admin Panel</Link>
</AdminOrSupport>
```

## 🎯 Available Convenience Components

- `LandlordOnly` - শুধু landlord
- `AdminOnly` - শুধু admin
- `TenantOnly` - শুধু tenant
- `AdminOrSupport` - admin বা support
- `AdminOrLandlord` - admin বা landlord
- `NotTenant` - tenant ছাড়া সব

## 🔧 Available Utility Functions

- `hasRole(user, roles)` - Check if user has any of the roles
- `hasAnyRole(user, roles)` - Same as hasRole
- `hasAllRoles(user, roles)` - Check if user has all roles
- `excludeRoles(user, roles)` - Check if user doesn't have excluded roles
- `isLandlord(user)` - Check if user is landlord
- `isAdmin(user)` - Check if user is admin
- `isTenant(user)` - Check if user is tenant
- `isSupport(user)` - Check if user is support
- `isAdminOrSupport(user)` - Check if admin or support
- `checkRoleAccess(user, config)` - Advanced role checking

## 💡 Tips

1. **Always use `useAppSelector(selectCurrentUser)`** to get the current user
2. **RoleGuard component** is best for conditional rendering
3. **Utility functions** are best for complex logic or filtering arrays
4. **Convenience components** make code more readable

## ✅ Example in Header (Already Implemented)

The header component now uses `LandlordOnly` for the "List Property" button:

```tsx
<LandlordOnly user={user}>
  <Link href="/dashboard/add-property">
    <Button>List Property</Button>
  </Link>
</LandlordOnly>
```

This button will only show to users with the `landlord` role!
