'use client';

import { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bookingsApi, type Booking } from '@/lib/api/bookings-api';
import { History, Calendar, Home, MapPin, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

export function RentalHistoryClient() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', 'tenant', 'history'],
    queryFn: () => bookingsApi.getUserBookings('tenant'),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2,
    onError: (error: any) => {
      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
        toast.error(error?.response?.data?.message || 'Failed to fetch rental history');
      }
    },
  });

  // Filter and sort bookings based on status filter
  const filteredBookings = useMemo(() => {
    if (!data?.bookings) return [];
    let filtered = data.bookings;
    if (statusFilter !== 'all') {
      filtered = data.bookings.filter((b: Booking) => b.status === statusFilter);
    }
    // Sort by date (newest first)
    return filtered.sort(
      (a: Booking, b: Booking) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data?.bookings, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
                <div className="text-center text-muted-foreground">Loading rental history...</div>
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
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load rental history</h3>
                <p className="text-muted-foreground mb-4">
                  {(error as any)?.response?.data?.message || 'An error occurred while fetching your rental history'}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rental History</h1>
          <p className="text-muted-foreground mt-1">
            View your past rental bookings and transactions
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rentals</CardTitle>
          <CardDescription>
            {filteredBookings.length} rental{filteredBookings.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rental history</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'all'
                  ? 'No rentals found with this status'
                  : 'You don\'t have any rental history yet'}
              </p>
              {statusFilter !== 'all' && (
                <Button variant="outline" onClick={() => setStatusFilter('all')}>
                  Show All
                </Button>
              )}
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
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking: Booking) => (
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
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/bookings/${booking.id}`}>
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
      </div>
    </div>
  );
}

