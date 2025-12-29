'use client';

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
import { adminApi, type DisputedPayment, type EscrowStats } from '@/lib/api/admin-api';
import { AlertTriangle, CreditCard, DollarSign, Loader2, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function EscrowManagementClient() {
  const [stats, setStats] = useState<EscrowStats | null>(null);
  const [disputedPayments, setDisputedPayments] = useState<DisputedPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, disputedData] = await Promise.all([
        adminApi.getEscrowStats(),
        adminApi.getDisputedPayments(),
      ]);
      setStats(statsData);
      setDisputedPayments(disputedData);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to fetch escrow data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (paymentId: string, resolution: 'release' | 'refund') => {
    try {
      await adminApi.resolveDispute(paymentId, {
        resolution,
        adminNote: `Resolved by admin: ${resolution === 'release' ? 'Funds released to landlord' : 'Refunded to tenant'}`,
      });
      toast.success(`Dispute resolved: ${resolution === 'release' ? 'Funds released' : 'Refunded'}`);
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to resolve dispute');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center text-muted-foreground">Loading escrow data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Escrow Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage payments in escrow and resolve disputes
        </p>
      </div>

      {}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Held</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHeld}</div>
              <p className="text-xs text-muted-foreground">
                ৳{stats.totalHeldAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disputed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalDisputed}</div>
              <p className="text-xs text-muted-foreground">
                ৳{stats.totalDisputedAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Released Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.releasedToday}</div>
              <p className="text-xs text-muted-foreground">Payments</p>
            </CardContent>
          </Card>
        </div>
      )}

      {}
      <Card>
        <CardHeader>
          <CardTitle>Disputed Payments</CardTitle>
          <CardDescription>
            Review and resolve payment disputes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {disputedPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No disputes</h3>
              <p className="text-muted-foreground">
                All payments are in good standing
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Landlord</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Dispute Reason</TableHead>
                    <TableHead>Disputed At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        ৳{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.tenant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.tenant.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.landlord.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.landlord.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.booking?.property.title || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">{payment.disputeReason}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.disputedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolve(payment.id, 'release')}
                          >
                            Release
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleResolve(payment.id, 'refund')}
                          >
                            Refund
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

