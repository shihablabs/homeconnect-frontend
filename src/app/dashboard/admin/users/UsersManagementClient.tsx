'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { type User } from '@/lib/api/admin-api';
import { Users, Search, Eye, Shield, ShieldOff, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

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

  const handleDeleteClick = (userId: string, userName: string, userEmail: string) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      userId,
      userName,
      userEmail,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.userId) return;
    try {
      await deleteUserAsync({ userId: confirmDialog.userId, reason: 'Deleted by admin' });
      toast.success('User deleted successfully');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to delete user');
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
      </div>

      {/* Filters */}
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
                    setPage(1); // Reset to first page on search
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

      {/* Users Table */}
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
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-10 w-10 rounded-full"
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
                            <Link href={`/dashboard/admin/users/${user.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
                            {/* Only admins can block/activate staff (admin/support), support can only manage tenants/landlords */}
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
                            {/* Only admins can delete users, and cannot delete admin/support staff */}
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
              {/* Pagination */}
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

      {/* Status Toggle Confirmation Dialog */}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === 'delete'}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Delete User"
        description={
          confirmDialog.userName && confirmDialog.userEmail
            ? `Are you sure you want to delete ${confirmDialog.userName} (${confirmDialog.userEmail})? This action will soft-delete the user account. The user will not be able to access their account, but their data will be preserved. You can restore the user later if needed.`
            : 'Are you sure you want to delete this user? This action cannot be undone.'
        }
        confirmText="Delete User"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

