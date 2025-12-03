'use client';

import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bookingsApi, type Booking } from '@/lib/api/bookings-api';
import { FileText, Download, Eye, Calendar, Home, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

export function LeaseAgreementsClient() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', 'tenant', 'leases'],
    queryFn: () => bookingsApi.getUserBookings('tenant'),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Handle errors (React Query v5 removed onError from useQuery)
  useEffect(() => {
    if (error) {
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } };
      if (errorObj?.response?.status !== 401 && errorObj?.response?.status !== 403) {
        toast.error(errorObj?.response?.data?.message || 'Failed to fetch lease agreements');
      }
    }
  }, [error]);

  // Filter only confirmed/completed bookings (active leases)
  const leases = useMemo(() => {
    if (!data?.bookings) return [];
    return data.bookings.filter(
      (b: Booking) => b.status === 'confirmed' || b.status === 'completed'
    );
  }, [data?.bookings]);

  const handleDownloadLease = async (bookingId: string) => {
    try {
      // TODO: Implement lease document download API
      toast.info('Lease document download will be available soon');
    } catch (error) {
      toast.error('Failed to download lease agreement');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading lease agreements...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load lease agreements</h3>
                <p className="text-muted-foreground mb-4">
                  {(() => {
                    if (error && typeof error === 'object' && 'response' in error) {
                      const err = error as { response?: { data?: { message?: string } } };
                      return err.response?.data?.message || 'An error occurred while fetching your lease agreements';
                    }
                    return 'An error occurred while fetching your lease agreements';
                  })()}
                </p>
                <Button onClick={() => refetch()}>
                  Try Again
                </Button>
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
        <h1 className="text-3xl font-bold">Lease Agreements</h1>
        <p className="text-muted-foreground mt-1">
          View and download your lease agreements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Lease Agreements</CardTitle>
          <CardDescription>
            {leases.length} active lease{leases.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No lease agreements</h3>
              <p className="text-muted-foreground mb-4">
                You don&apos;t have any active lease agreements
              </p>
              <Link href="/dashboard/search">
                <Button>
                  <Home className="mr-2 h-4 w-4" />
                  Find Properties
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Landlord</TableHead>
                    <TableHead>Lease Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leases.map((booking: Booking) => (
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
                              {booking.property.address}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.landlord.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.landlord.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                              {new Date(booking.checkOut).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.ceil(
                              (new Date(booking.checkOut).getTime() -
                                new Date(booking.checkIn).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            days
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status === 'confirmed' ? (
                            <>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Active
                            </>
                          ) : (
                            'Completed'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadLease(booking.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
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
    </div>
  );
}

