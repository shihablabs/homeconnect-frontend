'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { UserPlus, Shield, ShieldOff, Eye, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function StaffManagementClient() {
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'admin';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'support' as 'admin' | 'support',
    phone: '',
  });
  const queryClient = useQueryClient();

  
  const { data: adminsData, isLoading: loadingAdmins, error: adminsError } = useQuery({
    queryKey: ['admin', 'users', 'admin'],
    queryFn: async () => {
      const response = await adminApi.getAllUsers({ role: 'admin', limit: 100 });
      return response.users || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 429) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });

  const { data: supportData, isLoading: loadingSupport, error: supportError } = useQuery({
    queryKey: ['admin', 'users', 'support'],
    queryFn: async () => {
      const response = await adminApi.getAllUsers({ role: 'support', limit: 100 });
      return response.users || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 429) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });

  const staff = [...(adminsData || []), ...(supportData || [])];
  const loading = loadingAdmins || loadingSupport;
  const error = adminsError || supportError;

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!staffForm.password || staffForm.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      await adminApi.createStaffAccount({
        name: staffForm.name,
        email: staffForm.email,
        password: staffForm.password,
        role: staffForm.role,
        phone: staffForm.phone || undefined,
      });

      toast.success(`${staffForm.role === 'admin' ? 'Admin' : 'Support'} account created successfully`);
      setIsDialogOpen(false);
      setStaffForm({ name: '', email: '', password: '', role: 'support', phone: '' });
      
      
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'support'] });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to create staff member');
    }
  };

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId?: string;
    userName?: string;
    userEmail?: string;
    currentStatus?: boolean;
  }>({ open: false });

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
      setUpdatingStatusId(confirmDialog.userId);
      await adminApi.updateUserStatus(confirmDialog.userId, {
        isActive: !confirmDialog.currentStatus,
        reason: !confirmDialog.currentStatus ? 'Activated by admin' : 'Blocked by admin',
      });
      toast.success(`Staff ${!confirmDialog.currentStatus ? 'activated' : 'blocked'} successfully`);
      
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'support'] });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const refetch = () => {
    
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'admin'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'support'] });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Shield className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Failed to load staff</h3>
                <p className="text-muted-foreground text-center">
                  {(() => {
                    if (error && typeof error === 'object' && 'response' in error) {
                      const err = error as { response?: { data?: { message?: string } } };
                      return err.response?.data?.message || 'An error occurred while fetching staff members';
                    }
                    return 'An error occurred while fetching staff members';
                  })()}
                </p>
                <Button onClick={refetch} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage admin and support staff members
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            {loading ? (
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
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Create a new admin or support staff account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={staffForm.role}
                    onValueChange={(value: 'admin' | 'support') =>
                      setStaffForm({ ...staffForm, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Staff</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Staff Members</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${staff.length} staff member${staff.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading staff...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No staff members</h3>
              <p className="text-muted-foreground">Add staff members to manage the platform</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {member.email}
                          {member.phone && (
                            <div className="text-muted-foreground">{member.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.isActive ? (
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
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/dashboard/users/${member.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          {}
                          {isAdmin && (
                            <Button
                              variant={member.isActive ? 'destructive' : 'default'}
                              size="sm"
                              onClick={() => handleStatusToggleClick(member.id, member.name, member.email, member.isActive)}
                              disabled={updatingStatusId === member.id}
                            >
                              {member.isActive ? (
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
          )}
        </CardContent>
      </Card>
      </div>

      {}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.currentStatus ? 'Block Staff Member' : 'Activate Staff Member'}
        description={
          confirmDialog.userName && confirmDialog.userEmail
            ? `Are you sure you want to ${confirmDialog.currentStatus ? 'block' : 'activate'} ${confirmDialog.userName} (${confirmDialog.userEmail})? ${confirmDialog.currentStatus ? 'They will not be able to access their account or perform administrative tasks.' : 'They will regain access to their account.'}`
            : `Are you sure you want to ${confirmDialog.currentStatus ? 'block' : 'activate'} this staff member?`
        }
        confirmText={confirmDialog.currentStatus ? 'Block Staff' : 'Activate Staff'}
        cancelText="Cancel"
        variant={confirmDialog.currentStatus ? 'destructive' : 'default'}
        onConfirm={handleStatusToggleConfirm}
        isLoading={updatingStatusId !== null}
      />
    </div>
  );
}

