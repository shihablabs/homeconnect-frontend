'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usersApi } from '@/lib/api/users-api';
import { adminApi, type User } from '@/lib/api/admin-api';
import { ArrowLeft, User as UserIcon, Mail, Phone, Shield, Ban, CheckCircle2, Calendar, Loader2, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserDetailsClientProps {
  userId: string;
}

export function UserDetailsClient({ userId }: UserDetailsClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await adminApi.getUserById(userId);
      setUser(userData);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to fetch user details');
      router.push('/dashboard/users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;
    
    try {
      setUpdating(true);
      await adminApi.updateUserStatus(userId, {
        isActive: !user.isActive,
        reason: `Status changed by admin`,
      });
      toast.success(`User ${user.isActive ? 'blocked' : 'activated'} successfully`);
      fetchUser();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      setUpdating(true);
      await adminApi.deleteUser(userId, 'Deleted by admin from user details page');
      toast.success('User deleted successfully');
      router.push('/dashboard/users');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to delete user');
    } finally {
      setUpdating(false);
    }
  };

  const handleRestoreUser = async () => {
    if (!user) return;
    
    try {
      setUpdating(true);
      await adminApi.restoreUser(userId);
      toast.success('User restored successfully');
      fetchUser();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to restore user');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center text-muted-foreground">Loading user details...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">User not found</p>
              <Link href="/dashboard/users">
                <Button>Back to Users</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">User Details</h1>
          <p className="text-muted-foreground mt-1">
            View and manage user information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-20 w-20 rounded-full"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Blocked'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
                {user.isEmailVerified && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    Verified
                  </Badge>
                )}
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge>{user.role}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last Login: {new Date(user.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              )}
              {user.deletedAt && (
                <div className="flex items-center gap-3">
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">
                    Deleted: {new Date(user.deletedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage user account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleStatusToggle}
              disabled={updating}
              variant={user.isActive ? 'destructive' : 'default'}
              className="w-full"
            >
              {user.isActive ? (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Block User
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Activate User
                </>
              )}
            </Button>
            {user.deletedAt ? (
              <Button
                onClick={handleRestoreUser}
                disabled={updating}
                variant="default"
                className="w-full"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore User
                  </>
                )}
              </Button>
            ) : (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={updating}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {user.name}? This action will
                        soft-delete the user account. The user will not be able to access
                        their account, but their data will be preserved. You can restore
                        the user later if needed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteUser}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

