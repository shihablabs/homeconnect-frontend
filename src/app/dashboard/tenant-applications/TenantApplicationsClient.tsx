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
import { Calendar, FileText, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function TenantApplicationsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await bookingsApi.getUserBookings('landlord');

      const applications = (response?.bookings || []).filter((b) => b.status === 'pending');
      setBookings(applications);
    } catch (error: unknown) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to fetch applications');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
    setShowRejectInput(false);
    setRejectReason('');
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;
    const bookingId = selectedBooking.id || (selectedBooking as any)._id;
    if (!bookingId) {
      toast.error('Booking ID is missing');
      return;
    }
    try {
      setProcessingId(bookingId);
      await bookingsApi.approveBooking(bookingId);
      toast.success('Application approved successfully');
      setIsDialogOpen(false);
      fetchApplications();
    } catch (error: unknown) {
      console.error('Failed to approve application:', error);
      toast.error('Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    const bookingId = selectedBooking.id || (selectedBooking as any)._id;
    if (!bookingId) {
      toast.error('Booking ID is missing');
      return;
    }

    try {
      setProcessingId(bookingId);
      await bookingsApi.rejectBooking(bookingId, rejectReason);
      toast.success('Application rejected');
      setIsDialogOpen(false);
      fetchApplications();
    } catch (error: unknown) {
      console.error('Failed to reject application:', error);
      toast.error('Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div className="text-center text-muted-foreground">Loading applications...</div>
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
                      <TableHead>Dates</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id || (booking as any)._id}>
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
                          <div className="text-sm">
                            <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(booking.checkIn).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" /> {new Date(booking.checkOut).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="w-fit">
                              {booking.documents?.length || 0} Files
                            </Badge>
                            {booking.tour && (
                              <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                Verified Visit
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ৳{booking.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleViewDetails(booking)}
                          >
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

        { }
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
              <DialogDescription>
                Review details and documents before approving or rejecting.
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">

                { }
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Property</h4>
                    <p className="font-medium">{selectedBooking.property.title}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.property.address}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Stay Details</h4>
                    <p className="text-sm"><span className="font-medium">Check-in:</span> {new Date(selectedBooking.checkIn).toDateString()}</p>
                    <p className="text-sm"><span className="font-medium">Check-out:</span> {new Date(selectedBooking.checkOut).toDateString()}</p>
                    <p className="text-sm mt-1 bg-green-100 text-green-800 inline-block px-2 py-0.5 rounded text-xs font-semibold">
                      Total: ৳{selectedBooking.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                { }
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    Tenant Information
                  </h4>
                  <div className="flex items-center gap-4 bg-white border p-4 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {selectedBooking.tenant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{selectedBooking.tenant.name}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.tenant.email}</p>
                      {selectedBooking.tenant.phone && <p className="text-sm text-gray-500">{selectedBooking.tenant.phone}</p>}
                    </div>
                  </div>
                  {selectedBooking.specialRequests && (
                    <div className="mt-3 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                      <span className="font-semibold">Note:</span> {selectedBooking.specialRequests}
                    </div>
                  )}
                </div>

                { }
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    Submitted Documents
                    <Badge variant="outline">{selectedBooking.documents?.length || 0} Files</Badge>
                    {selectedBooking.tour && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Verified Visit
                      </Badge>
                    )}
                  </h4>

                  {selectedBooking.documents && selectedBooking.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedBooking.documents.map((doc, idx) => (
                        <div key={idx} className="border p-4 rounded-lg flex items-start gap-3 group hover:border-primary transition-colors">
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{doc.name || `Document ${idx + 1}`}</p>
                            <p className="text-xs text-gray-500 uppercase">{doc.type}</p>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline mt-1 inline-block"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg text-gray-500 italic">
                      No documents submitted with this application.
                    </div>
                  )}
                </div>

                { }
                {showRejectInput && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-sm font-medium text-red-600">Reason for Rejection</label>
                    <textarea
                      className="w-full min-h-[80px] p-3 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      placeholder="Please explain why this application is being rejected..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                )}

              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <div className="flex w-full justify-between items-center">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={showRejectInput ? "destructive" : "outline"}
                    className={!showRejectInput ? "text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" : ""}
                    onClick={handleReject}
                    disabled={!!processingId}
                  >
                    {processingId === selectedBooking?.id && showRejectInput ? 'Rejecting...' : (showRejectInput ? 'Confirm Rejection' : 'Reject Application')}
                  </Button>
                  {!showRejectInput && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleApprove}
                      disabled={!!processingId}
                    >
                      {processingId === selectedBooking?.id ? 'Approving...' : 'Approve Application'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

