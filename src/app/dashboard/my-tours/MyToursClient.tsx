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
import { toursApi, type TourRequest } from '@/lib/api/tours-api';
import { Calendar, CheckCircle2, Clock, Home, MapPin, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MyToursClient() {
  const [tours, setTours] = useState<TourRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await toursApi.getMyTours();
      setTours(data || []);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
      toast.error('Failed to fetch scheduled visits');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading scheduled visits...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Scheduled Visits</h1>
          <p className="text-muted-foreground mt-1">
            Track the status of your property tour requests.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Requested Tours</CardTitle>
            <CardDescription>
              {tours.length} visit{tours.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tours.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No visits scheduled</h3>
                <p className="text-muted-foreground mb-4">
                  Find a property you like and schedule a visit!
                </p>
                <Link href="/properties" className="text-primary hover:underline font-medium">
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Landlord Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((tour) => (
                      <TableRow key={tour.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {tour.property.images && tour.property.images.length > 0 ? (
                              <Image
                                src={tour.property.images[0]}
                                alt={tour.property.title}
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
                                href={`/properties/${tour.property.id}`}
                                className="font-medium hover:text-primary transition-colors line-clamp-1"
                              >
                                {tour.property.title}
                              </Link>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {tour.property.city}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {new Date(tour.preferredDate).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(tour.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {}
                          {}
                          <div className="text-sm">
                            {}
                            <span className="text-muted-foreground">Hosted by Owner</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(tour.status)}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm" title={tour.notes}>
                          {tour.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {tour.status === 'approved' && (
                            <Link href={`/dashboard/bookings/create?propertyId=${tour.property.id}`}>
                              <Button size="sm" className="h-8">
                                Apply Now
                              </Button>
                            </Link>
                          )}
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
