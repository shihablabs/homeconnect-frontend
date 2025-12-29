'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthState } from '@/hooks/useAuthState';
import { bookingsApi, type Booking } from '@/lib/api/bookings-api';
import { Calendar, CheckCircle2, Clock, CreditCard, Eye, Home, Loader2, Plus, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function BookingsDashboardClient() {
  const { user } = useAuthState();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'tenant' | 'landlord'>('tenant');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingsApi.getUserBookings(viewType);
        setBookings(response?.bookings || []);
      } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        toast.error(errorMessage || 'Failed to fetch bookings');
        setBookings([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [viewType]);

  const handlePay = async (booking: Booking) => {
    try {
      const response = await bookingsApi.createPaymentSession({
        bookingId: booking.id,
        returnUrl: `${window.location.origin}/dashboard/bookings/${booking.id}`,
      });
      window.location.href = response.url;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to create payment session');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="gap-1 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3" />
            Application Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline">Unpaid</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading && (!bookings || bookings.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground mt-1">
              {viewType === 'tenant' ? 'Bookings you made' : 'Bookings for your properties'}
            </p>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading bookings...</div>
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
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground mt-1">
              {viewType === 'tenant' ? 'Bookings you made' : 'Bookings for your properties'}
            </p>
          </div>
          <div className="flex gap-2">
            {user?.role === 'landlord' && (
              <Select value={viewType} onValueChange={(v: 'tenant' | 'landlord') => setViewType(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlord">As Landlord</SelectItem>
                  <SelectItem value="tenant">As Tenant</SelectItem>
                </SelectContent>
              </Select>
            )}
            {user?.role === 'tenant' && (
              <Link href="/dashboard/bookings/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Booking
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${(bookings || []).length} booking${(bookings || []).length !== 1 ? 's' : ''} found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : (!bookings || bookings.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">
                  {user?.role === 'tenant'
                    ? 'Start by creating your first booking'
                    : 'No bookings for your properties yet'}
                </p>
                {user?.role === 'tenant' && (
                  <Link href="/dashboard/bookings/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Booking
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>{viewType === 'tenant' ? 'Landlord' : 'Tenant'}</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(bookings || []).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {booking.property?.images && booking.property.images.length > 0 ? (
                              <Image
                                src={booking.property.images[0]}
                                alt={booking.property?.title || 'Property'}
                                width={64}
                                height={64}
                                className="rounded-md object-cover h-16 w-16"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                                <Home className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <Link
                                href={`/properties/${booking.property?.id || '#'}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {booking.property?.title || 'N/A'}
                              </Link>
                              <div className="text-sm text-muted-foreground">
                                {booking.property?.city || ''}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {viewType === 'tenant'
                                ? booking.landlord?.name || 'N/A'
                                : booking.tenant?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {viewType === 'tenant'
                                ? booking.landlord?.email || ''
                                : booking.tenant?.email || ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">
                          ৳{(booking.totalAmount ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status || 'pending')}</TableCell>
                        <TableCell>{getPaymentStatusBadge(booking.paymentStatus || 'pending')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/dashboard/bookings/${booking.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
                            {user?.role === 'tenant' &&
                              (booking.status) === 'approved' &&
                              (booking.paymentStatus || 'pending') === 'pending' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handlePay(booking)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Pay Now
                                </Button>
                              )}
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
    </div>
  );
}

