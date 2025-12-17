'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bookingsApi, type Booking } from '@/lib/api/bookings-api';
import { Calendar, Eye, FileText, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function TenantApplicationsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await bookingsApi.getUserBookings('landlord');
      // Filter only pending bookings (applications)
      const applications = (response?.bookings || []).filter((b) => b.status === 'pending');
      setBookings(applications);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to fetch applications');
      setBookings([]); // Ensure bookings is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">Loading applications...</div>
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
          <h1 className="text-3xl font-bold">Tenant Applications</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage booking applications from tenants
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>
              {bookings.length} application{bookings.length !== 1 ? 's' : ''} pending review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending applications</h3>
                <p className="text-muted-foreground">
                  All applications have been reviewed
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {booking.property.images && booking.property.images.length > 0 ? (
                              <Image
                                src={booking.property.images[0]}
                                alt={booking.property.title}
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
                                href={`/properties/${booking.property.id}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {booking.property.title}
                              </Link>
                              <div className="text-sm text-muted-foreground">
                                {booking.property.city}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.tenant.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.tenant.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(booking.checkIn).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ৳{booking.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'outline'}>
                            {booking.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Review
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

        {/* Application Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review tenant application for property booking
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Property</h4>
                  <p className="text-sm">{selectedBooking.property.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.property.address}, {selectedBooking.property.city}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tenant Information</h4>
                  <p className="text-sm">Name: {selectedBooking.tenant.name}</p>
                  <p className="text-sm">Email: {selectedBooking.tenant.email}</p>
                  {selectedBooking.tenant.phone && (
                    <p className="text-sm">Phone: {selectedBooking.tenant.phone}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Booking Details</h4>
                  <p className="text-sm">
                    Check-in: {new Date(selectedBooking.checkIn).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    Check-out: {new Date(selectedBooking.checkOut).toLocaleDateString()}
                  </p>
                  <p className="text-sm">Total Amount: ৳{selectedBooking.totalAmount.toLocaleString()}</p>
                </div>
                {selectedBooking.specialRequests && (
                  <div>
                    <h4 className="font-semibold mb-2">Special Requests</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Link href={`/dashboard/bookings/${selectedBooking?.id}`}>
                <Button>View Full Details</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

