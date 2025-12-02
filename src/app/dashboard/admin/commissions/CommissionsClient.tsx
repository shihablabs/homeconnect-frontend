'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, TrendingUp, Calendar, Percent, Download, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Commission {
  id: string;
  transactionId: string;
  propertyId: string;
  propertyTitle: string;
  landlordId: string;
  landlordName: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: string;
  createdAt: string;
}

export function CommissionsClient() {
  // TODO: Replace with actual API call when endpoint is implemented
  // const { data, isLoading, isFetching, error, refetch } = useQuery({
  //   queryKey: ['admin', 'commissions'],
  //   queryFn: async () => {
  //     const response = await adminApi.getCommissions();
  //     return {
  //       commissions: response.commissions || [],
  //       stats: response.stats || {
  //         totalCommissions: 0,
  //         paidCommissions: 0,
  //         pendingCommissions: 0,
  //         totalAmount: 0,
  //       },
  //     };
  //   },
  //   staleTime: 30000,
  //   refetchOnWindowFocus: true,
  //   refetchInterval: 60000,
  //   retry: (failureCount, error: any) => {
  //     if (error?.response?.status === 429) {
  //       return false;
  //     }
  //     return failureCount < 2;
  //   },
  // });

  // Temporary mock data until API is implemented
  const { data, isLoading: loading, isFetching, error, refetch } = useQuery({
    queryKey: ['admin', 'commissions'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        commissions: [] as Commission[],
        stats: {
          totalCommissions: 0,
          paidCommissions: 0,
          pendingCommissions: 0,
          totalAmount: 0,
        },
      };
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const commissions = data?.commissions || [];
  const stats = data?.stats || {
    totalCommissions: 0,
    paidCommissions: 0,
    pendingCommissions: 0,
    totalAmount: 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <DollarSign className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Failed to load commissions</h3>
              <p className="text-muted-foreground text-center">
                {(error as any)?.response?.data?.message || 'An error occurred while fetching commissions'}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commissions</h1>
          <p className="text-muted-foreground mt-1">
            Track platform commissions from transactions
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Commission earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidCommissions}</div>
            <p className="text-xs text-muted-foreground">Paid out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCommissions}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Commissions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Commissions</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${commissions.length} commission${commissions.length !== 1 ? 's' : ''}${isFetching ? ' (updating...)' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && commissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading commissions...</p>
                </div>
              ) : commissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No commissions</h3>
                  <p className="text-muted-foreground">Commission records will appear here</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Landlord</TableHead>
                        <TableHead>Transaction Amount</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell className="font-medium">
                            {commission.propertyTitle}
                          </TableCell>
                          <TableCell>{commission.landlordName}</TableCell>
                          <TableCell>৳{commission.amount.toLocaleString()}</TableCell>
                          <TableCell>{commission.commissionRate}%</TableCell>
                          <TableCell className="font-medium">
                            ৳{commission.commissionAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(commission.status)}</TableCell>
                          <TableCell>
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.filter((c) => c.status === 'pending').length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No pending commissions
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Landlord</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions
                        .filter((c) => c.status === 'pending')
                        .map((commission) => (
                          <TableRow key={commission.id}>
                            <TableCell>{commission.propertyTitle}</TableCell>
                            <TableCell>{commission.landlordName}</TableCell>
                            <TableCell className="font-medium">
                              ৳{commission.commissionAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(commission.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.filter((c) => c.status === 'paid').length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No paid commissions
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Landlord</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Paid Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions
                        .filter((c) => c.status === 'paid')
                        .map((commission) => (
                          <TableRow key={commission.id}>
                            <TableCell>{commission.propertyTitle}</TableCell>
                            <TableCell>{commission.landlordName}</TableCell>
                            <TableCell className="font-medium">
                              ৳{commission.commissionAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {commission.paidAt
                                ? new Date(commission.paidAt).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

