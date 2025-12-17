'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Building, Calendar, DollarSign, Download, Loader2, Users } from 'lucide-react';
import { useState } from 'react';

export function AnalyticsClient() {
  const [timeRange, setTimeRange] = useState('30days');
  const { stats, isLoading: loading } = useAdminStats({
    refetchInterval: undefined, // Disable auto-refetch since timeRange doesn't affect this endpoint
  });

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading analytics...</div>
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
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Platform analytics and insights
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {stats && (
          <>
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProperties ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Listed properties</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings ?? 0}</div>
                  <p className="text-xs text-muted-foreground">All bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPayments ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">User Analytics</TabsTrigger>
                <TabsTrigger value="properties">Property Analytics</TabsTrigger>
                <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Properties by Status</CardTitle>
                      <CardDescription>Property verification status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Pending</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-500"
                                style={{
                                  width: `${stats.propertiesByStatus?.total
                                      ? (stats.propertiesByStatus.pending /
                                        stats.propertiesByStatus.total) *
                                      100
                                      : 0
                                    }%`,
                                }}
                              />
                            </div>
                            <span className="font-medium w-12 text-right">
                              {stats.propertiesByStatus?.pending ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Approved</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${stats.propertiesByStatus?.total
                                      ? (stats.propertiesByStatus.approved /
                                        stats.propertiesByStatus.total) *
                                      100
                                      : 0
                                    }%`,
                                }}
                              />
                            </div>
                            <span className="font-medium w-12 text-right">
                              {stats.propertiesByStatus?.approved ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Rejected</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{
                                  width: `${stats.propertiesByStatus?.total
                                      ? (stats.propertiesByStatus.rejected /
                                        stats.propertiesByStatus.total) *
                                      100
                                      : 0
                                    }%`,
                                }}
                              />
                            </div>
                            <span className="font-medium w-12 text-right">
                              {stats.propertiesByStatus?.rejected ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Users by Role</CardTitle>
                      <CardDescription>User distribution by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Tenants</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{
                                  width: `${stats.usersByRole?.tenant && stats.totalUsers
                                      ? (stats.usersByRole.tenant / stats.totalUsers) * 100
                                      : 0
                                    }%`,
                                }}
                              />
                            </div>
                            <span className="font-medium w-12 text-right">
                              {stats.usersByRole?.tenant ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Landlords</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500"
                                style={{
                                  width: `${stats.usersByRole?.landlord && stats.totalUsers
                                      ? (stats.usersByRole.landlord / stats.totalUsers) * 100
                                      : 0
                                    }%`,
                                }}
                              />
                            </div>
                            <span className="font-medium w-12 text-right">
                              {stats.usersByRole?.landlord ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Admins</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{
                                  width: `${stats.usersByRole?.admin && stats.totalUsers
                                      ? (stats.usersByRole.admin / stats.totalUsers) * 100
                                      : 0
                                    }%`,
                                }}
                              />
                            </div>
                            <span className="font-medium w-12 text-right">
                              {stats.usersByRole?.admin ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Support</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500"
                                style={{
                                  width: `${stats.usersByRole?.support && stats.totalUsers
                                      ? (stats.usersByRole.support / stats.totalUsers) * 100
                                      : 0
                                    }%`,
                                }}
                              />
                            </div>
                            <span className="font-medium w-12 text-right">
                              {stats.usersByRole?.support ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth Analytics</CardTitle>
                    <CardDescription>User registration trends and patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      User growth charts will be displayed here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="properties" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Analytics</CardTitle>
                    <CardDescription>Property listing and performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      Property analytics charts will be displayed here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                    <CardDescription>Platform revenue and transaction trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      Revenue analytics charts will be displayed here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

