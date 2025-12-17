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
import { bookingsApi, type Booking } from '@/lib/api/bookings-api';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Eye, Home, Loader2, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

export function MyRentalsClient() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', 'tenant', 'rentals'],
    queryFn: () => bookingsApi.getUserBookings('tenant'),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 401 || err.response?.status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });

  // Filter only confirmed/completed bookings (active rentals)
  const activeRentals = useMemo(() => {
    if (!data?.bookings) return [];
    return data.bookings.filter(
      (b: Booking) => b.status === 'confirmed' || b.status === 'completed'
    );
  }, [data?.bookings]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                <div className="text-center text-muted-foreground">Loading rentals...</div>
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
                <Home className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load rentals</h3>
                <p className="text-muted-foreground mb-4">
                  {(() => {
                    if (error && typeof error === 'object' && 'response' in error) {
                      const err = error as { response?: { data?: { message?: string } } };
                      return err.response?.data?.message || 'An error occurred while fetching your rentals';
                    }
                    return 'An error occurred while fetching your rentals';
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
          <h1 className="text-3xl font-bold">Current Rentals</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your active rental properties
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Rentals</CardTitle>
            <CardDescription>
              {activeRentals.length} active rental{activeRentals.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeRentals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Home className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active rentals</h3>
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any active rentals at the moment
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
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeRentals.map((booking: Booking) => (
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
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {booking.property.city}
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
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
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
      </div>
    </div>
  );
}

