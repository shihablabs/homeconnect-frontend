'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { toursApi, type TourRequest } from '@/lib/api/tours-api';
import { Calendar, CheckCircle2, Clock, Home, MapPin, Search, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MyToursClient() {
  const router = useRouter();
  const [tours, setTours] = useState<TourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await toursApi.getMyTours({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
      });
      setTours(data || []);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
      toast.error('Failed to fetch scheduled visits');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTour = async (tourId: string) => {
    if (!confirm('Are you sure you want to cancel this visit request?')) return;

    try {
      await toursApi.cancelTour(tourId, { cancellationReason: 'Cancelled by user' });
      toast.success('Visit request cancelled successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to cancel tour:', error);
      toast.error('Failed to cancel visit request');
    }
  };

  const handleConfirmTour = (propertyId: string) => {
    router.push(`/dashboard/bookings/create?propertyId=${propertyId}`);
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
      case 'cancelled':
        return (
          <Badge variant="secondary" className="gap-1 text-gray-500">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Scheduled Visits</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your property tour requests.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Requested Tours</CardTitle>
                <CardDescription>
                  Manage your upcoming and past property visits
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading scheduled visits...
              </div>
            ) : tours.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No visits found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? "Try adjusting your filters or search terms"
                    : "Find a property you like and schedule a visit!"}
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
                          <div className="text-sm">
                            <span className="text-muted-foreground">Hosted by Owner</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(tour.status)}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm" title={tour.notes}>
                          {tour.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right p-4">
                          <div className="flex items-center justify-end gap-2">
                            {tour.status === 'pending' && (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleCancelTour(tour.id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {tour.status === 'approved' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                  onClick={() => handleCancelTour(tour.id)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleConfirmTour(tour.property.id, tour.id)}
                                >
                                  Confirm & Rent
                                </Button>
                              </>
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
