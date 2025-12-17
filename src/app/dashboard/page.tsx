'use client';

import {
  BarChart,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Home,
  Link as LinkIcon,
  Loader2,
  Plus,
  Receipt,
  UserRound,
  Users,
  Wrench
} from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { StatCard } from '@/components/cards/StatCard.tsx';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { ProtectedRoute } from '@/components/protected-route';
import { useDashboard } from '@/hooks/useDashboard';
import { dashboardApi } from '@/lib/api/dashboard';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined) return 'BDT 0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'property_created':
      return <Home className="h-5 w-5 text-green-500" />;
    case 'maintenance_requested':
      return <Wrench className="h-5 w-5 text-yellow-500" />;
    case 'user_login':
      return <Users className="h-5 w-5 text-blue-500" />;
    case 'maintenance_status_changed':
      return <CheckCircle2 className="h-5 w-5 text-indigo-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string | undefined) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function DashboardPage() {
  // Get user from Redux state
  const user = useAppSelector(selectCurrentUser);

  // Fetch dashboard data using hook
  const { stats, activities, properties, isLoading, error, refetch, isFetching } = useDashboard();
  const queryClient = useQueryClient();

  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  // Transform hook data to match component expectations
  const dashboardData = stats ? {
    stats,
    recentActivity: activities,
    pendingMaintenanceRequests: properties,
  } : null;



  const handleMarkAsRead = async (id: string) => {
    setMarkingRead(id);
    try {
      await dashboardApi.markActivityAsRead(id);
      // Invalidate and refetch dashboard data to get updated read status
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
      toast.success('Activity marked as read');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to mark activity as read');
      console.error('Error marking activity as read:', error);
    } finally {
      setTimeout(() => setMarkingRead(null), 1000);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const result = await dashboardApi.markAllActivitiesAsRead();
      // Invalidate and refetch dashboard data to get updated read status
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
      toast.success(`${result.count} activities marked as read`);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to mark all activities as read');
      console.error('Error marking all activities as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const occupancyRate =
    (dashboardData?.stats?.totalProperties && dashboardData.stats.totalProperties > 0)
      ? (
        ((dashboardData.stats.occupiedProperties || 0) /
          dashboardData.stats.totalProperties) *
        100
      ).toFixed(0)
      : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name || 'Guest'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  {user?.role === 'landlord' && 'Property Management Dashboard'}
                  {user?.role === 'admin' && 'System Administration Dashboard'}
                  {user?.role === 'tenant' && 'Tenant Dashboard'}
                  {user?.role === 'support' && 'Support Dashboard'}
                </p>
              </div>
              {isFetching && !isLoading && (
                <Loader2
                  className="h-5 w-5 animate-spin text-blue-600"
                  aria-label="Refreshing data"
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {user?.role === 'landlord' && (
                <Link href="/dashboard/add-property">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Property
                  </Button>
                </Link>
              )}
              <Link href="/properties">
                <Button variant="outline" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  View Properties
                </Button>
              </Link>
            </div>
          </div>

          {/* Progressive Loading: Show data if available, even while refetching */}
          {dashboardData && (
            <div className="space-y-6">
              {/* Show subtle loading indicator when refetching in background */}
              {isFetching && !isLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-2 animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating dashboard data...</span>
                </div>
              )}
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Properties"
                  value={(dashboardData.stats?.totalProperties || 0).toString()}
                  description="All your properties"
                  icon={<Building2 className="h-6 w-6" />}
                />
                <StatCard
                  title="Properties for Rent"
                  value={(dashboardData.stats?.totalPropertiesForRent || 0).toString()}
                  description="Ready to rent"
                  icon={<Receipt className="h-6 w-6" />}
                  trend="positive"
                />
                <StatCard
                  title="Occupied Properties"
                  value={(dashboardData.stats?.occupiedProperties || 0).toString()}
                  description="Currently occupied"
                  icon={<UserRound className="h-6 w-6" />}
                />
                <StatCard
                  title="Pending Maintenance"
                  value={(dashboardData.stats?.pendingMaintenance || 0).toString()}
                  description="Needs attention"
                  icon={<Wrench className="h-6 w-6" />}
                  trend="negative"
                />
              </div>

              {/* Performance Overview & User Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Key metrics for your properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(dashboardData.stats?.totalRevenue || 0)}
                        </p>
                        <p className="text-xs text-gray-500">All-time revenue</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {occupancyRate}%
                        </p>
                        <p className="text-xs text-gray-500">Properties occupied</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Properties for Sale</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {dashboardData.stats?.totalPropertiesForSale || 0}
                        </p>
                        <p className="text-xs text-gray-500">Awaiting sale</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Maintenance Requests</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {dashboardData.stats?.pendingMaintenance || 0}
                        </p>
                        <p className="text-xs text-gray-500">Needs attention</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {user?.role === 'landlord' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Overview</CardTitle>
                      <CardDescription>Your property bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-gray-900 mb-2">
                            {dashboardData.stats?.totalBookings || 0}
                          </p>
                          <p className="text-gray-600">Total Bookings</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-2xl font-bold text-yellow-700">
                              {dashboardData.stats?.pendingBookings || 0}
                            </p>
                            <p className="text-xs text-yellow-600">Pending</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-2xl font-bold text-green-700">
                              {dashboardData.stats?.activeTenants || 0}
                            </p>
                            <p className="text-xs text-green-600">Active Tenants</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : user?.role === 'admin' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>User Information</CardTitle>
                      <CardDescription>System-wide stats</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-gray-900 mb-2">
                          {dashboardData.stats?.totalUsers || 0}
                        </p>
                        <p className="text-gray-600">Total Users</p>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700">
                            {dashboardData.stats?.totalLandlords || 0} Active Landlords
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : user?.role === 'tenant' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Overview</CardTitle>
                      <CardDescription>Your property bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-gray-900 mb-2">
                            {dashboardData.stats?.totalBookings || 0}
                          </p>
                          <p className="text-gray-600">Total Bookings</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-2xl font-bold text-yellow-700">
                              {dashboardData.stats?.pendingBookings || 0}
                            </p>
                            <p className="text-xs text-yellow-600">Pending</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-2xl font-bold text-green-700">
                              {dashboardData.stats?.activeTenants || 0}
                            </p>
                            <p className="text-xs text-green-600">Active</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              {/* Recent Activities & Pending Maintenance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Activities</CardTitle>
                      <CardDescription>Latest updates and requests</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {dashboardData?.recentActivity?.length > 0 &&
                        activities.some(a => !a.read) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={markingAll}
                            className="text-xs"
                          >
                            {markingAll ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Marking...
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Mark All Read
                              </>
                            )}
                          </Button>
                        )}
                      <Link href="/dashboard/activities">
                        <Button variant="ghost" size="sm">
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData?.recentActivity?.slice(0, 6).map((activity) => (
                        <div
                          key={activity.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors duration-200 ${!activity.read
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-gray-200'
                            }`}
                        >
                          <span className="text-lg mt-0.5 flex-shrink-0">
                            {getActivityIcon(activity.action)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">
                              {activity.message}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              by {activity.user.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {!activity.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(activity.id)}
                              disabled={markingRead === activity.id}
                              className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                            >
                              {markingRead === activity.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {(dashboardData?.recentActivity?.length || 0) === 0 && (
                      <p className="text-center text-gray-500 py-4">No recent activities</p>
                    )}
                  </CardContent>
                </Card>

                {/* Pending Maintenance */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Pending Maintenance</CardTitle>
                      <CardDescription>Requests needing attention</CardDescription>
                    </div>
                    <Link href="/dashboard/maintenance">
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData?.pendingMaintenanceRequests?.slice(0, 5).map((request) => (
                        <Link
                          key={request.id}
                          href={`/dashboard/maintenance`} // অথবা `/maintenance/${request.id}`
                          className="block transition-transform hover:scale-[1.02]"
                        >
                          <div className="flex items-center space-x-4 p-3 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={request.images?.[0] || '/default-property.jpg'}
                                alt={request.title}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/default-property.jpg';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {request.title}
                              </p>
                              <p className="text-gray-600 text-xs truncate">
                                {request.property.address}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <Badge
                                  variant="secondary"
                                  className={`${getStatusColor(request.status)} text-xs`}
                                >
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={`${getPriorityColor(request.priority)} text-xs`}
                                >
                                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {(dashboardData?.pendingMaintenanceRequests?.length || 0) === 0 && (
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">No pending maintenance</p>
                        {user?.role === 'tenant' && (
                          <Link href="/maintenance/request">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              Submit a Request
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your properties efficiently</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {user?.role === 'landlord' && (
                      <Link href="/dashboard/add-property">
                        <Button variant="outline" className="w-full h-16 flex-col gap-1">
                          <Plus className="h-5 w-5" />
                          <span className="text-xs">Add Property</span>
                        </Button>
                      </Link>
                    )}
                    <Link href="/bookings">
                      <Button variant="outline" className="w-full h-16 flex-col gap-1">
                        <Calendar className="h-5 w-5" />
                        <span className="text-xs">View Bookings</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard/maintenance">
                      <Button variant="outline" className="w-full h-16 flex-col gap-1">
                        <Wrench className="h-5 w-5" />
                        <span className="text-xs">Maintenance</span>
                      </Button>
                    </Link>
                    <Link href="/reports">
                      <Button variant="outline" className="w-full h-16 flex-col gap-1">
                        <BarChart className="h-5 w-5" />
                        <span className="text-xs">Reports</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Initial Loading State - Skeleton Loader (only on first load) */}
          {isLoading && !dashboardData && <DashboardSkeleton />}

          {/* Error State - Enhanced */}
          {error && !isLoading && (
            <ErrorState
              error={error}
              onRetry={() => {
                queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
                refetch();
              }}
              title="Error Loading Dashboard"
              description="We encountered an issue while loading your dashboard data"
            />
          )}

          {/* No Data State */}
          {!dashboardData && !isLoading && !error && (
            <Card>
              <CardHeader>
                <CardTitle>No Data Available</CardTitle>
                <CardDescription>
                  We couldn&apos;t find any dashboard data at this time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-gray-100 p-4">
                      <BarChart className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-gray-600">
                    No dashboard data available. This might be your first time here!
                  </p>
                  <Button
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
                      refetch();
                    }}
                    variant="outline"
                  >
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}