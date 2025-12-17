'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { paymentsApi, type LandlordEarnings, type Payment } from '@/lib/api/payments-api';
import { CheckCircle2, Clock, DollarSign, Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function RentCollectionClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [earnings, setEarnings] = useState<LandlordEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'overview') {
          const earningsData = await paymentsApi.getLandlordEarnings();
          setEarnings(earningsData || {
            totalEarnings: 0,
            totalPaid: 0,
            pendingPayments: 0,
            breakdown: {
              rent: 0,
              securityDeposit: 0,
              other: 0,
            },
          });
        } else if (activeTab === 'history') {
          const response = await paymentsApi.getPaymentHistory({
            type: 'rent',
            limit: 50,
          });
          setPayments(response?.payments || []);
        }
      } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        toast.error(errorMessage || 'Failed to fetch data');
        if (activeTab === 'overview') {
          setEarnings({
            totalEarnings: 0,
            totalPaid: 0,
            pendingPayments: 0,
            breakdown: {
              rent: 0,
              securityDeposit: 0,
              other: 0,
            },
          });
        } else {
          setPayments([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'processing':
        return <Badge variant="default" className="bg-blue-500">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading && activeTab === 'overview' && !earnings) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Rent Collection</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage rent payments from tenants
            </p>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading earnings data...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading && activeTab === 'history' && payments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Rent Collection</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage rent payments from tenants
            </p>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading payment history...</div>
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
        <div>
          <h1 className="text-3xl font-bold">Rent Collection</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage rent payments from tenants
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading earnings data...</p>
              </div>
            ) : earnings ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ৳{(earnings?.totalEarnings ?? 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ৳{(earnings?.pendingPayments ?? 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Awaiting payment</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ৳{(earnings?.totalPaid ?? 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Received</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Breakdown</CardTitle>
                    <CardDescription>Breakdown by payment type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Rent</span>
                        <span className="font-medium">৳{(earnings?.breakdown?.rent ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Security Deposit</span>
                        <span className="font-medium">
                          ৳{(earnings?.breakdown?.securityDeposit ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Other</span>
                        <span className="font-medium">৳{(earnings?.breakdown?.other ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No earnings data</h3>
                <p className="text-muted-foreground">Earnings data will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rent Payment History</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `All rent payments received`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading payment history...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No payment history</h3>
                    <p className="text-muted-foreground">Rent payments will appear here</p>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tenant</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Rent Month</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{payment.tenant.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {payment.tenant.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {payment.booking?.property.title || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {payment.rentMonth
                                ? new Date(payment.rentMonth).toLocaleDateString('en-US', {
                                  month: 'long',
                                  year: 'numeric',
                                })
                                : 'N/A'}
                            </TableCell>
                            <TableCell className="font-medium">
                              ৳{payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {payment.paidAt
                                ? new Date(payment.paidAt).toLocaleDateString()
                                : payment.dueDate
                                  ? new Date(payment.dueDate).toLocaleDateString()
                                  : 'N/A'}
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell className="text-right">
                              <Link href={`/dashboard/payments/${payment.id}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
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
    </div>
  );
}

