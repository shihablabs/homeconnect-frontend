'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { confirmDelete, showError, showSuccess } from "@/lib/swal";
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';
import { Eye, Loader2, RefreshCw, Search, Shield, ShieldOff, Trash2, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export function UsersManagementClient() {
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'admin';
  const isSupport = currentUser?.role === 'support';
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'email' | 'lastLogin'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'status' | 'delete';
    userId?: string;
    userName?: string;
    userEmail?: string;
    currentStatus?: boolean;
  }>({ open: false, type: 'status' });

  const [createStaffDialog, setCreateStaffDialog] = useState({
    open: false,
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'support' as 'support' | 'admin',
  });

  const {
    users,
    pagination,
    isLoading,
    isFetching,
    error,
    refetch,
    updateStatusAsync,
    isUpdatingStatus,
    deleteUserAsync,
    isDeleting,
    createStaffAsync,
    isCreatingStaff,
  } = useAdminUsers({
    role: roleFilter === 'all' ? undefined : roleFilter as 'tenant' | 'landlord' | 'admin' | 'support',
    page,
    limit: 20,
    search: searchQuery || undefined,
    status: statusFilter === 'all' ? 'all' : (statusFilter as 'active' | 'blocked'),
    sortBy,
    sortOrder,
  });

  const handleStatusToggleClick = (userId: string, userName: string, userEmail: string, currentStatus: boolean) => {
    setConfirmDialog({
      open: true,
      type: 'status',
      userId,
      userName,
      userEmail,
      currentStatus,
    });
  };

  const handleStatusToggleConfirm = async () => {
    if (!confirmDialog.userId || confirmDialog.currentStatus === undefined) return;
    try {
      await updateStatusAsync({
        userId: confirmDialog.userId,
        isActive: !confirmDialog.currentStatus,
        reason: !confirmDialog.currentStatus ? 'Activated by admin' : 'Blocked by admin',
      });
      toast.success(`User ${!confirmDialog.currentStatus ? 'activated' : 'blocked'} successfully`);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to update status');
    }
  };

  const handleDeleteClick = async (userId: string, userName: string, userEmail: string) => {
    const result = await confirmDelete(
      "Delete User?",
      `Are you sure you want to delete ${userName} (${userEmail})? This action will soft-delete the user account. The user will not be able to access their account, but their data will be preserved.`
    );

    if (result) {
      try {
        await deleteUserAsync({ userId, reason: 'Deleted by admin' });
        showSuccess('Deleted!', 'User deleted successfully.');
      } catch (error: any) {
        showError('Error!', error.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    // This is no longer needed but kept empty to avoid breaking other logic if any
  };

  const handleCreateStaff = async () => {
    try {
      if (!createStaffDialog.name || !createStaffDialog.email || !createStaffDialog.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      await createStaffAsync({
        name: createStaffDialog.name,
        email: createStaffDialog.email,
        password: createStaffDialog.password,
        role: createStaffDialog.role,
        phoneNumber: createStaffDialog.phoneNumber,
      });

      toast.success(`${createStaffDialog.role === 'admin' ? 'Admin' : 'Support'} account created successfully`);
      setCreateStaffDialog({
        open: false,
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'support',
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to create staff account');
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      admin: 'default',
      landlord: 'secondary',
      tenant: 'outline',
      support: 'secondary',
    };
    return <Badge variant={variants[role] || 'outline'} className="capitalize">{role}</Badge>;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Failed to load users</h3>
              <p className="text-muted-foreground text-center">
                {(() => {
                  if (error && typeof error === 'object' && 'response' in error) {
                    const err = error as { response?: { data?: { message?: string } } };
                    return err.response?.data?.message || 'An error occurred while fetching users';
                  }
                  return 'An error occurred while fetching users';
                })()}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage all platform users - tenants, landlords, admins, and support staff
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          {(isAdmin) && (
            <Button
              onClick={() => setCreateStaffDialog({ ...createStaffDialog, open: true })}
              className="ml-2 gap-2"
            >
              <Users className="h-4 w-4" />
              Create Staff
            </Button>
          )}
        </div>

        { }
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="tenant">Tenants</SelectItem>
                  <SelectItem value="landlord">Landlords</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field as typeof sortBy);
                setSortOrder(order as typeof sortOrder);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                  <SelectItem value="lastLogin-desc">Last Login</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        { }
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${pagination.total} user${pagination.total !== 1 ? 's' : ''} found${isFetching ? ' (updating...)' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Email Verified</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <Image
                                  src={user.avatar}
                                  alt={user.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <Badge variant="default" className="gap-1">
                                <Shield className="h-3 w-3" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <ShieldOff className="h-3 w-3" />
                                Blocked
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isEmailVerified ? (
                              <Badge variant="outline" className="text-green-600">Verified</Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600">Unverified</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/admin/users/${user.slug || user.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </Link>
                              { }
                              {((isAdmin) || (isSupport && user.role !== 'admin' && user.role !== 'support')) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusToggleClick(user.id, user.name, user.email, user.isActive)}
                                  disabled={isUpdatingStatus}
                                >
                                  {user.isActive ? (
                                    <>
                                      <ShieldOff className="mr-2 h-4 w-4" />
                                      Block
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </Button>
                              )}
                              { }
                              {isAdmin && user.role !== 'admin' && user.role !== 'support' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(user.id, user.name, user.email)}
                                  disabled={isDeleting}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                { }
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.page === 1 || isLoading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={pagination.page === pagination.totalPages || isLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      { }
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === 'status'}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.currentStatus ? 'Block User' : 'Activate User'}
        description={
          confirmDialog.userName && confirmDialog.userEmail
            ? `Are you sure you want to ${confirmDialog.currentStatus ? 'block' : 'activate'} ${confirmDialog.userName} (${confirmDialog.userEmail})? ${confirmDialog.currentStatus ? 'They will not be able to access their account.' : 'They will regain access to their account.'}`
            : `Are you sure you want to ${confirmDialog.currentStatus ? 'block' : 'activate'} this user?`
        }
        confirmText={confirmDialog.currentStatus ? 'Block User' : 'Activate User'}
        cancelText="Cancel"
        variant={confirmDialog.currentStatus ? 'destructive' : 'default'}
        onConfirm={handleStatusToggleConfirm}
        isLoading={isUpdatingStatus}
      />


      { }
      <Dialog
        open={createStaffDialog.open}
        onOpenChange={(open) => setCreateStaffDialog({ ...createStaffDialog, open })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Staff Account</DialogTitle>
            <DialogDescription>
              Create a new Admin or Support account. Support accounts are pre-verified.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={createStaffDialog.name}
                onChange={(e) => setCreateStaffDialog({ ...createStaffDialog, name: e.target.value })}
                className="col-span-3"
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={createStaffDialog.email}
                onChange={(e) => setCreateStaffDialog({ ...createStaffDialog, email: e.target.value })}
                className="col-span-3"
                placeholder="john@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password <span className="text-red-500">*</span>
              </Label>
              <PasswordInput
                id="password"
                value={createStaffDialog.password}
                onChange={(e) => setCreateStaffDialog({ ...createStaffDialog, password: (e.target as HTMLInputElement).value })}
                className="col-span-3"
                placeholder="******"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Phone
              </Label>
              <Input
                id="phoneNumber"
                value={createStaffDialog.phoneNumber}
                onChange={(e) => setCreateStaffDialog({ ...createStaffDialog, phoneNumber: e.target.value })}
                className="col-span-3"
                placeholder="+1234567890"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={createStaffDialog.role}
                onValueChange={(value: 'support' | 'admin') => setCreateStaffDialog({ ...createStaffDialog, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateStaffDialog({ ...createStaffDialog, open: false })}
              disabled={isCreatingStaff}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateStaff} disabled={isCreatingStaff}>
              {isCreatingStaff && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

