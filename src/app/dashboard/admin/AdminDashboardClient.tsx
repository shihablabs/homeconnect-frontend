'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Building2, Users, CreditCard, FileCheck, AlertCircle, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ErrorState } from '@/components/dashboard/ErrorState';

export function AdminDashboardClient() {
  const [refreshing, setRefreshing] = useState(false);
  const { stats, isLoading: loading, error, refetch } = useAdminStats();

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to refresh stats';
      toast.error(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading admin dashboard...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <ErrorState
        error={error as Error}
        onRetry={() => refetch()}
        title="Error Loading Admin Dashboard"
        description="Failed to load admin statistics. Please try again."
      />
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of system statistics and management
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.usersByRole.tenant} tenants, {stats.usersByRole.landlord} landlords
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.propertiesByStatus.approved} approved, {stats.propertiesByStatus.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties Status */}
      <Card>
        <CardHeader>
          <CardTitle>Property Verification Status</CardTitle>
          <CardDescription>Properties awaiting review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.propertiesByStatus.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.propertiesByStatus.approved}</p>
              </div>
              <FileCheck className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.propertiesByStatus.rejected}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.propertiesByStatus.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>Review and verify properties</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/properties">
              <Button className="w-full">
                <FileCheck className="mr-2 h-4 w-4" />
                Manage Properties
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage all users</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/users">
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Escrow Management</CardTitle>
            <CardDescription>Handle payments and disputes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/escrow">
              <Button className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Escrow
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

