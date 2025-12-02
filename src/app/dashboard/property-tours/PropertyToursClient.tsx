'use client';

import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { propertiesApi, type PropertyResponse } from '@/lib/api/properties-api';
import { Calendar, Plus, Clock, MapPin, Home, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface TourRequest {
  id: string;
  property: PropertyResponse;
  tenant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  createdAt: string;
}

export function PropertyToursClient() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [tours, setTours] = useState<TourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const propertiesData = await propertiesApi.getUserProperties(1, 100);
      setProperties(propertiesData?.properties || []);
      // TODO: Fetch tour requests from API
      // const toursData = await toursApi.getTourRequests();
      // setTours(toursData);
      setTours([]);
    } catch (error: any) {
      toast.error('Failed to fetch data');
      setProperties([]); // Ensure properties is always an array
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleTour = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement tour scheduling API
    toast.info('Tour scheduling feature coming soon');
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
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
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">Loading...</div>
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
          <h1 className="text-3xl font-bold">Property Tours</h1>
          <p className="text-muted-foreground mt-1">
            Manage property tour requests and schedules
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Tour
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Property Tour</DialogTitle>
              <DialogDescription>
                Create a new tour schedule for a property
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleTour} className="space-y-4">
              <div className="space-y-2">
                <Label>Property</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  required
                >
                  <option value="">Select a property</option>
                  {(properties || []).map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Additional notes for the tour..." rows={3} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule Tour</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tour Requests</CardTitle>
          <CardDescription>
            {tours.length} tour request{tours.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tour requests</h3>
              <p className="text-muted-foreground">
                Tour requests from tenants will appear here
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Requested Time</TableHead>
                    <TableHead>Status</TableHead>
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
                              className="font-medium hover:text-primary transition-colors"
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
                        <div>
                          <div className="font-medium">{tour.tenant.name}</div>
                          <div className="text-sm text-muted-foreground">{tour.tenant.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(tour.requestedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{tour.requestedTime}</TableCell>
                      <TableCell>{getStatusBadge(tour.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
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
      </div>
    </div>
  );
}

