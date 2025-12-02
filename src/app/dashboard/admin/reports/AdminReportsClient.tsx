'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminStats } from '@/hooks/useAdminStats';
import { BarChart3, TrendingUp, Users, Building, DollarSign, Download, FileText, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function AdminReportsClient() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('overview');
  const { stats, isLoading: loading, isFetching, refetch } = useAdminStats({
    refetchInterval: undefined, // Disable auto-refetch for reports
  });

  const handleGenerateReport = async () => {
    try {
      // TODO: Implement report generation API
      toast.info('Report generation feature coming soon');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      // TODO: Implement export API
      toast.info(`${format.toUpperCase()} export feature coming soon`);
    } catch (error) {
      toast.error(`Failed to export ${format}`);
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center text-muted-foreground">Loading reports...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive platform financial analytics
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers ?? 0}</div>
                <p className="text-xs text-muted-foreground">All users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties ?? 0}</div>
                <p className="text-xs text-muted-foreground">All properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
              <TabsTrigger value="custom">Custom Report</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Properties by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Pending</span>
                        <span className="font-medium">{stats.propertiesByStatus?.pending ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Approved</span>
                        <span className="font-medium text-green-600">
                          {stats.propertiesByStatus?.approved ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Rejected</span>
                        <span className="font-medium text-red-600">
                          {stats.propertiesByStatus?.rejected ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-semibold pt-2 border-t">
                        <span>Total</span>
                        <span>{stats.propertiesByStatus?.total ?? 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Users by Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Tenants</span>
                        <span className="font-medium">{stats.usersByRole?.tenant ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Landlords</span>
                        <span className="font-medium">{stats.usersByRole?.landlord ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Admins</span>
                        <span className="font-medium">{stats.usersByRole?.admin ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Support</span>
                        <span className="font-medium">{stats.usersByRole?.support ?? 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Analytics</CardTitle>
                  <CardDescription>Detailed user statistics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    User analytics charts will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Analytics</CardTitle>
                  <CardDescription>Property performance and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    Property analytics charts will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Custom Report</CardTitle>
                  <CardDescription>Create a custom report for a specific date range</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reportType">Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger id="reportType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overview">Overview</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="users">Users</SelectItem>
                          <SelectItem value="properties">Properties</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleGenerateReport} className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

