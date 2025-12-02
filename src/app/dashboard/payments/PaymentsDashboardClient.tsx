'use client';

import { useState, useEffect } from 'react';
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
import { paymentsApi, type Payment, type UpcomingPayment, type PaymentSummary, type LandlordEarnings } from '@/lib/api/payments-api';
import { useAuthState } from '@/hooks/useAuthState';
import { CreditCard, TrendingUp, Clock, DollarSign, Eye, Calendar, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function PaymentsDashboardClient() {
  const { user } = useAuthState();
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [earnings, setEarnings] = useState<LandlordEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const [summaryData, upcomingData] = await Promise.all([
          paymentsApi.getPaymentSummary(),
          paymentsApi.getUpcomingPayments(30),
        ]);
        setSummary(summaryData);
        setUpcomingPayments(upcomingData);
      } else if (activeTab === 'history') {
        const response = await paymentsApi.getPaymentHistory({ limit: 50 });
        setPayments(response.payments);
      } else if (activeTab === 'earnings' && user?.role === 'landlord') {
        const earningsData = await paymentsApi.getLandlordEarnings();
        setEarnings(earningsData);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch payment data');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (paymentId: string) => {
    try {
      const response = await paymentsApi.createPaymentSession(paymentId, {
        returnUrl: `${window.location.origin}/dashboard/payments`,
      });
      window.location.href = response.sessionUrl;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create payment session');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-500">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading payments...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Manage your payments and transactions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          {user?.role === 'landlord' && <TabsTrigger value="earnings">Earnings</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳{summary.totalPaid.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳{summary.totalPending.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Awaiting payment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ৳{summary.totalOverdue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Past due date</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Time</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{summary.onTimeCount}</div>
                  <p className="text-xs text-muted-foreground">Payments</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>Payments due in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming payments</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Days Until Due</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{payment.booking.property.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {payment.booking.property.address}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ৳{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.daysUntilDue <= 7 ? 'destructive' : 'outline'}>
                              {payment.daysUntilDue} days
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePay(payment.id)}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Pay Now
                            </Button>
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

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all your payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payment history</h3>
                  <p className="text-muted-foreground">Your payment history will appear here</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Property</TableHead>
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
                            <Badge variant="outline" className="capitalize">
                              {payment.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.booking?.property.title || 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium">
                            ৳{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : new Date(payment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/dashboard/payments/${payment.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
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

        {user?.role === 'landlord' && (
          <TabsContent value="earnings" className="space-y-6">
            {earnings && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ৳{earnings.totalEarnings.toLocaleString()}
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
                        ৳{earnings.pendingPayments.toLocaleString()}
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
                        ৳{earnings.totalPaid.toLocaleString()}
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
                        <span className="font-medium">৳{earnings.breakdown.rent.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Security Deposit</span>
                        <span className="font-medium">
                          ৳{earnings.breakdown.securityDeposit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Other</span>
                        <span className="font-medium">৳{earnings.breakdown.other.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

