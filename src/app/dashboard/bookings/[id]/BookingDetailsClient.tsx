'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { bookingsApi, type Booking } from '@/lib/api/bookings-api';
import { useAuthState } from '@/hooks/useAuthState';
import { ArrowLeft, Calendar, Home, User, CreditCard, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface BookingDetailsClientProps {
  bookingId: string;
}

export function BookingDetailsClient({ bookingId }: BookingDetailsClientProps) {
  const router = useRouter();
  const { user } = useAuthState();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getBooking(bookingId);
      setBooking(data);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to fetch booking details');
      router.push('/dashboard/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!booking) return;
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

  const handleCancel = async () => {
    if (!booking || !cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancelling(true);
      await bookingsApi.cancelBooking(bookingId, { reason: cancelReason });
      toast.success('Booking cancelled successfully');
      setIsCancelDialogOpen(false);
      setCancelReason('');
      fetchBooking();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading booking details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Booking not found</p>
              <Link href="/dashboard/bookings">
                <Button>Back to Bookings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
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

  const isTenant = user?.role === 'tenant';
  const canCancel = booking.status !== 'cancelled' && booking.status !== 'completed';
  const canPay = isTenant && booking.status === 'pending' && booking.paymentStatus === 'pending';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground mt-1">
            View and manage booking information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Booking Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {booking.property.images && booking.property.images.length > 0 ? (
                  <Image
                    src={booking.property.images[0]}
                    alt={booking.property.title}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-30 w-30 rounded-lg bg-muted flex items-center justify-center">
                    <Home className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <Link
                    href={`/properties/${booking.property.id}`}
                    className="text-xl font-semibold hover:text-primary transition-colors"
                  >
                    {booking.property.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{booking.property.address}, {booking.property.city}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="text-muted-foreground">Check-in</Label>
                    <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="text-muted-foreground">Check-out</Label>
                    <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {booking.specialRequests && (
            <Card>
              <CardHeader>
                <CardTitle>Special Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{booking.specialRequests}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(booking.status)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Payment Status</Label>
                <div className="mt-1">
                  <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'outline'}>
                    {booking.paymentStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Amount</Label>
                <p className="text-2xl font-bold mt-1">৳{booking.totalAmount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isTenant ? 'Landlord' : 'Tenant'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {isTenant ? booking.landlord.name : booking.tenant.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isTenant ? booking.landlord.email : booking.tenant.email}
                  </div>
                  {isTenant && booking.landlord.phone && (
                    <div className="text-sm text-muted-foreground">
                      {booking.landlord.phone}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {canPay && (
                <Button onClick={handlePay} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              )}
              {canCancel && (
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Booking
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Booking</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for cancelling this booking
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea
                          placeholder="Enter cancellation reason..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                        Close
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={cancelling || !cancelReason.trim()}
                      >
                        {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

