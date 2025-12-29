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
import { Users, Search, Eye, Shield, ShieldOff, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function TenantsManagementClient() {
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'admin';
  const isSupport = currentUser?.role === 'support';
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId?: string;
    userName?: string;
    userEmail?: string;
    currentStatus?: boolean;
  }>({ open: false });

  const {
    users: tenants,
    pagination,
    isLoading: loading,
    isFetching,
    error,
    refetch,
    updateStatusAsync,
    isUpdatingStatus,
  } = useAdminUsers({
    role: 'tenant',
    page,
    limit: 20,
    search: searchQuery || undefined,
    status: statusFilter === 'all' ? 'all' : (statusFilter as 'active' | 'blocked'),
  });

  const handleStatusToggleClick = (userId: string, userName: string, userEmail: string, currentStatus: boolean) => {
    setConfirmDialog({
      open: true,
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
      toast.success(`Tenant ${!confirmDialog.currentStatus ? 'activated' : 'blocked'} successfully`);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to update status');
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Failed to load tenants</h3>
              <p className="text-muted-foreground text-center">
                {(() => {
                  if (error && typeof error === 'object' && 'response' in error) {
                    const err = error as { response?: { data?: { message?: string } } };
                    return err.response?.data?.message || 'An error occurred while fetching tenants';
                  }
                  return 'An error occurred while fetching tenants';
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
        <div>
          <h1 className="text-3xl font-bold">Tenants Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all tenant accounts and bookings
          </p>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tenants</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${pagination.total} tenant${pagination.total !== 1 ? 's' : ''} found${isFetching ? ' (updating...)' : ''}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading tenants...</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No tenants registered yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email Verified</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{tenant.name}</div>
                              <div className="text-sm text-muted-foreground">{tenant.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {tenant.email}
                            {tenant.phone && (
                              <div className="text-muted-foreground">{tenant.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tenant.isActive ? (
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
                          {tenant.isEmailVerified ? (
                            <Badge variant="default">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Not Verified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(tenant.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/dashboard/users/${tenant.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
                            {}
                            {(isAdmin || isSupport) && (
                              <Button
                                variant={tenant.isActive ? 'destructive' : 'default'}
                                size="sm"
                                onClick={() => handleStatusToggleClick(tenant.id, tenant.name, tenant.email, tenant.isActive)}
                                disabled={isUpdatingStatus}
                              >
                                {tenant.isActive ? (
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages || loading}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>

      {}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.currentStatus ? 'Block Tenant' : 'Activate Tenant'}
        description={
          confirmDialog.userName && confirmDialog.userEmail
            ? `Are you sure you want to ${confirmDialog.currentStatus ? 'block' : 'activate'} ${confirmDialog.userName} (${confirmDialog.userEmail})? ${confirmDialog.currentStatus ? 'They will not be able to access their account or make bookings.' : 'They will regain access to their account.'}`
            : `Are you sure you want to ${confirmDialog.currentStatus ? 'block' : 'activate'} this tenant?`
        }
        confirmText={confirmDialog.currentStatus ? 'Block Tenant' : 'Activate Tenant'}
        cancelText="Cancel"
        variant={confirmDialog.currentStatus ? 'destructive' : 'default'}
        onConfirm={handleStatusToggleConfirm}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}

