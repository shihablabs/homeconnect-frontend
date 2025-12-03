'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Users, MessageSquare, AlertCircle, Loader2, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function SupportDashboardClient() {
  const { stats, properties, isLoading, error, refetch } = useDashboard();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading support dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-muted-foreground mb-4">
            {(() => {
              if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { data?: { message?: string } } };
                return err.response?.data?.message || 'An error occurred';
              }
              return 'An error occurred';
            })()}
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const pendingMaintenance = stats?.pendingMaintenance ?? 0;
  const maintenanceRequests = properties || [];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Support Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage maintenance requests and support tickets
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? (
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

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingMaintenance}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requests awaiting action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Support tickets in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users Helped</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Maintenance Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Maintenance Requests</CardTitle>
                <CardDescription>
                  {maintenanceRequests.length} request{maintenanceRequests.length !== 1 ? 's' : ''} requiring attention
                </CardDescription>
              </div>
              <Link href="/dashboard/maintenance">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {maintenanceRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  All maintenance requests have been addressed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceRequests.slice(0, 5).map((request: { id: string; title: string; status: string; priority: string }) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">
                          {request.title || 'Property'}
                        </h4>
                        <Badge variant="outline" className="capitalize">
                          {request.status}
                        </Badge>
                        {request.priority && (
                          <Badge
                            variant={
                              request.priority === 'high'
                                ? 'destructive'
                                : request.priority === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {request.priority} priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.title || 'No title provided'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Status: {request.status || 'Unknown'}
                        </span>
                        <span>
                          Priority: {request.priority || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <Link href={`/dashboard/maintenance/${request.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common support tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/dashboard/support/tickets">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Tickets
                </Button>
              </Link>
              <Link href="/dashboard/maintenance">
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="mr-2 h-4 w-4" />
                  Maintenance
                </Button>
              </Link>
              <Link href="/dashboard/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  View Users
                </Button>
              </Link>
              <Link href="/dashboard/notifications">
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

