'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAdminUser } from '@/hooks/useAdminUser';
import { ArrowLeft, Calendar, Loader2, Mail, Phone, Shield, ShieldOff } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function UserDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const { user, isLoading, error, updateStatusAsync, isUpdatingStatus } = useAdminUser(userId);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'status';
  }>({ open: false, type: 'status' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-destructive">Error loading user</h3>
            <p className="text-muted-foreground">User not found or access denied.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusToggle = async () => {
    try {
      await updateStatusAsync({
        isActive: !user.isActive,
        reason: user.isActive ? 'Blocked by admin' : 'Activated by admin',
      });
      toast.success(`User ${user.isActive ? 'blocked' : 'activated'} successfully`);
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="flex gap-2">
          <Button
            variant={user.isActive ? "destructive" : "default"} // Destructive for Block, Default for Activate
            onClick={() => setConfirmDialog({ open: true, type: 'status' })}
            disabled={isUpdatingStatus}
          >
            {user.isActive ? (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                Block User
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                <span className="text-4xl font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <CardTitle>{user.name}</CardTitle>
            <div className="flex justify-center gap-2 mt-2">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                {user.role}
              </Badge>
              <Badge variant={user.isActive ? 'outline' : 'destructive'} className={user.isActive ? 'text-green-600 border-green-600' : ''}>
                {user.isActive ? 'Active' : 'Blocked'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Details & Activity */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Status</p>
                  <div className="mt-1">
                    {user.isEmailVerified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">Unverified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                  <p className="mt-1 text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={user.isActive ? 'Block User' : 'Activate User'}
        description={`Are you sure you want to ${user.isActive ? 'block' : 'activate'} this user?`}
        confirmText={user.isActive ? 'Block' : 'Activate'}
        cancelText="Cancel"
        variant={user.isActive ? 'destructive' : 'default'}
        onConfirm={handleStatusToggle}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}
