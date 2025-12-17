# Role Access Utility - Usage Examples

এই file টি role-based conditional rendering এর বিভিন্ন example দেখায়।

## 1. Basic Usage with RoleGuard Component

### শুধু Landlord এর জন্য:
```tsx
import RoleGuard from '@/components/shared/RoleGuard';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';

function Header() {
  const user = useAppSelector(selectCurrentUser);
  
  return (
    <RoleGuard user={user} allowedRoles={['landlord']}>
      <Link href="/dashboard/add-property">
        <Button>List Property</Button>
      </Link>
    </RoleGuard>
  );
}
```

### Admin অথবা Landlord এর জন্য:
```tsx
<RoleGuard user={user} allowedRoles={['admin', 'landlord']}>
  <MenuItem>Manage Properties</MenuItem>
</RoleGuard>
```

### Tenant ছাড়া সব role এর জন্য:
```tsx
<RoleGuard user={user} excludedRoles={['tenant']}>
  <MenuItem>Add Property</MenuItem>
</RoleGuard>
```

### Complex Condition (allowed + excluded):
```tsx
<RoleGuard 
  user={user} 
  allowedRoles={['admin', 'landlord']} 
  excludedRoles={['tenant']}
>
  <MenuItem>Special Feature</MenuItem>
</RoleGuard>
```

## 2. Using Convenience Components

### LandlordOnly:
```tsx
import { LandlordOnly } from '@/components/shared/RoleGuard';

<LandlordOnly user={user}>
  <Button>List Property</Button>
</LandlordOnly>
```

### AdminOnly:
```tsx
import { AdminOnly } from '@/components/shared/RoleGuard';

<AdminOnly user={user}>
  <AdminPanel />
</AdminOnly>
```

### AdminOrLandlord:
```tsx
import { AdminOrLandlord } from '@/components/shared/RoleGuard';

<AdminOrLandlord user={user}>
  <MenuItem>Property Management</MenuItem>
</AdminOrLandlord>
```

### NotTenant:
```tsx
import { NotTenant } from '@/components/shared/RoleGuard';

<NotTenant user={user}>
  <MenuItem>Add Property</MenuItem>
</NotTenant>
```

## 3. Using Utility Functions Directly

### In conditional rendering:
```tsx
import { hasRole, isLandlord, excludeRoles } from '@/utils/roleAccess';

function MyComponent() {
  const user = useAppSelector(selectCurrentUser);
  
  return (
    <>
      {hasRole(user, ['landlord']) && (
        <Button>List Property</Button>
      )}
      
      {isLandlord(user) && (
        <Link href="/dashboard/properties">My Properties</Link>
      )}
      
      {excludeRoles(user, ['tenant']) && (
        <MenuItem>Admin Features</MenuItem>
      )}
    </>
  );
}
```

### In menu items array:
```tsx
import { hasRole } from '@/utils/roleAccess';

const menuItems = [
  { label: 'Home', href: '/', show: true },
  { 
    label: 'List Property', 
    href: '/dashboard/add-property',
    show: hasRole(user, ['landlord'])
  },
  {
    label: 'Admin Panel',
    href: '/dashboard/admin',
    show: hasRole(user, ['admin', 'support'])
  }
].filter(item => item.show);
```

## 4. Real World Examples

### Header Menu Items:
```tsx
import RoleGuard, { LandlordOnly, AdminOnly } from '@/components/shared/RoleGuard';

function Header() {
  const user = useAppSelector(selectCurrentUser);
  
  return (
    <nav>
      <Link href="/">Home</Link>
      
      <LandlordOnly user={user}>
        <Link href="/dashboard/add-property">
          <Button>List Property</Button>
        </Link>
      </LandlordOnly>
      
      <AdminOnly user={user}>
        <Link href="/dashboard/admin">
          <Button>Admin Panel</Button>
        </Link>
      </AdminOnly>
      
      <RoleGuard user={user} allowedRoles={['admin', 'landlord']}>
        <Link href="/dashboard/properties">My Properties</Link>
      </RoleGuard>
    </nav>
  );
}
```

### Dropdown Menu:
```tsx
import RoleGuard from '@/components/shared/RoleGuard';

function UserDropdown() {
  const user = useAppSelector(selectCurrentUser);
  
  return (
    <DropdownMenu>
      <DropdownMenuItem>
        <Link href="/dashboard">Dashboard</Link>
      </DropdownMenuItem>
      
      <RoleGuard user={user} allowedRoles={['landlord']}>
        <DropdownMenuItem>
          <Link href="/dashboard/properties">My Properties</Link>
        </DropdownMenuItem>
      </RoleGuard>
      
      <RoleGuard user={user} allowedRoles={['admin', 'support']}>
        <DropdownMenuItem>
          <Link href="/dashboard/admin">Admin Panel</Link>
        </DropdownMenuItem>
      </RoleGuard>
      
      <RoleGuard user={user} excludedRoles={['tenant']}>
        <DropdownMenuItem>
          <Link href="/dashboard/add-property">Add Property</Link>
        </DropdownMenuItem>
      </RoleGuard>
    </DropdownMenu>
  );
}
```

### With Fallback:
```tsx
<RoleGuard 
  user={user} 
  allowedRoles={['admin']}
  fallback={<p className="text-gray-500">You need admin access</p>}
>
  <AdminPanel />
</RoleGuard>
```

## 5. Advanced Patterns

### Multiple Conditions:
```tsx
// Admin বা Landlord কিন্তু Tenant নয়
<RoleGuard 
  user={user}
  allowedRoles={['admin', 'landlord']}
  excludedRoles={['tenant']}
>
  <SpecialFeature />
</RoleGuard>
```

### In Array Filtering:
```tsx
import { hasRole } from '@/utils/roleAccess';

const allMenuItems = [
  { id: 1, label: 'Home', roles: [] }, // সবাই দেখবে
  { id: 2, label: 'List Property', roles: ['landlord'] },
  { id: 3, label: 'Admin Panel', roles: ['admin', 'support'] },
];

const visibleMenuItems = allMenuItems.filter(item => 
  item.roles.length === 0 || hasRole(user, item.roles as UserRole[])
);
```

## Summary

1. **RoleGuard Component**: Conditional rendering এর জন্য সবচেয়ে সহজ
2. **Convenience Components**: LandlordOnly, AdminOnly, etc. - আরো সহজ
3. **Utility Functions**: hasRole, isLandlord, etc. - direct conditional check
4. **Complex Logic**: checkRoleAccess function - advanced scenarios

Choose based on your needs!


