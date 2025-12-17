'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { paymentsApi, type EscrowStatus, type Payment } from '@/lib/api/payments-api';
import { ArrowLeft, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PaymentDetailsClientProps {
  paymentId: string;
}

export function PaymentDetailsClient({ paymentId }: PaymentDetailsClientProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const [paymentData, escrowData] = await Promise.all([
          paymentsApi.getPayment(paymentId),
          paymentsApi.getEscrowStatus(paymentId).catch(() => null),
        ]);
        setPayment(paymentData);
        setEscrowStatus(escrowData);
      } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        toast.error(errorMessage || 'Failed to fetch payment details');
        router.push('/dashboard/payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId, router]);

  const handlePay = async () => {
    if (!payment) return;
    try {
      const response = await paymentsApi.createPaymentSession(paymentId, {
        returnUrl: `${window.location.origin}/dashboard/payments/${paymentId}`,
      });
      window.location.href = response.sessionUrl;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to create payment session');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading payment details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Payment not found</p>
              <Link href="/dashboard/payments">
                <Button>Back to Payments</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Payment Details</h1>
          <p className="text-muted-foreground mt-1">
            View payment information and status
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Payment ID</Label>
                  <p className="font-mono text-sm">{payment.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {payment.type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="text-2xl font-bold">৳{payment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(payment.status)}</div>
                </div>
                {payment.rentMonth && (
                  <div>
                    <Label className="text-muted-foreground">Rent Month</Label>
                    <p className="font-medium">
                      {new Date(payment.rentMonth).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {payment.dueDate && (
                  <div>
                    <Label className="text-muted-foreground">Due Date</Label>
                    <p className="font-medium">{new Date(payment.dueDate).toLocaleDateString()}</p>
                  </div>
                )}
                {payment.paidAt && (
                  <div>
                    <Label className="text-muted-foreground">Paid At</Label>
                    <p className="font-medium">{new Date(payment.paidAt).toLocaleDateString()}</p>
                  </div>
                )}
                {payment.method && (
                  <div>
                    <Label className="text-muted-foreground">Payment Method</Label>
                    <p className="font-medium capitalize">{payment.method}</p>
                  </div>
                )}
              </div>
              {payment.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{payment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {payment.booking && (
            <Card>
              <CardHeader>
                <CardTitle>Related Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="font-medium">{payment.booking.property.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {payment.booking.property.address}
                  </div>
                  <Link href={`/dashboard/bookings/${payment.booking.id}`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Booking
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {payment.status === 'pending' && (
                <Button onClick={handlePay} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              )}
            </CardContent>
          </Card>

          {escrowStatus && escrowStatus.escrowStatus !== 'not_applicable' && (
            <Card>
              <CardHeader>
                <CardTitle>Escrow Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className="mt-1 capitalize">{escrowStatus.escrowStatus}</Badge>
                </div>
                {escrowStatus.releaseDate && (
                  <div>
                    <Label className="text-muted-foreground">Release Date</Label>
                    <p className="text-sm">
                      {new Date(escrowStatus.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {escrowStatus.timeRemaining && escrowStatus.timeRemaining > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Time Remaining</Label>
                    <p className="text-sm">
                      {Math.floor(escrowStatus.timeRemaining / (1000 * 60 * 60))} hours
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

