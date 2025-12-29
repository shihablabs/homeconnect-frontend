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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { propertiesApi } from '@/lib/api/properties-api';
import { toursApi, type TourRequest } from '@/lib/api/tours-api';
import type { PropertyResponse } from '@/types/property.types';
import { Calendar, CheckCircle2, Clock, Home, MapPin, Plus, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function PropertyToursClient() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [tours, setTours] = useState<TourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');

  
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [tourToReject, setTourToReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching property tour data...');

      const [propertiesData, toursData] = await Promise.all([
        propertiesApi.getUserProperties(1, 100).catch(err => {
          console.error('Failed to fetch properties:', err);
          return null;
        }),
        toursApi.getIncomingTours().catch(err => {
          console.error('Failed to fetch incoming tours:', err);
          return null;
        })
      ]);

      if (!propertiesData) console.warn('Properties data is null');
      if (!toursData) console.warn('Tours data is null');

      setProperties(propertiesData?.properties || []);
      setTours(toursData || []);
    } catch (error: unknown) {
      console.error('Failed to fetch data (general error):', error);
      toast.error('Failed to fetch data');
      setProperties([]);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tourId: string) => {
    try {
      setIsProcessing(true);
      await toursApi.updateTourStatus(tourId, 'approved');
      toast.success('Tour request approved');
      fetchData();
    } catch (error) {
      toast.error("Failed to approve tour");
    } finally {
      setIsProcessing(false);
    }
  };

  
  const [feedbackOptions, setFeedbackOptions] = useState<string[]>([]);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [targetAction, setTargetAction] = useState<'reject' | 'cancel' | null>(null);

  const REJECT_REASONS = [
    "Property unavailable for requested time",
    "Tenant requirements not met",
    "Too many requests for this slot",
    "Other"
  ];

  const CANCEL_REASONS = [
    "Tenant No-show",
    "Property Rented",
    "Emergency maintenance",
    "Other"
  ];

  const initReject = (tourId: string) => {
    setTourToReject(tourId);
    setRejectionReason(''); 
    setFeedbackComment('');
    setFeedbackOptions(REJECT_REASONS);
    setTargetAction('reject');
    setIsRejectDialogOpen(true);
  };

  const initCancel = (tourId: string) => {
    setTourToReject(tourId);
    setRejectionReason('');
    setFeedbackComment('');
    setFeedbackOptions(CANCEL_REASONS);
    setTargetAction('cancel');
    setIsRejectDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!tourToReject || !targetAction) return;
    if (!rejectionReason) {
      toast.error("Please select a reason");
      return;
    }

    try {
      setIsProcessing(true);
      const status = targetAction === 'reject' ? 'rejected' : 'cancelled';

      
      
      await toursApi.updateTourStatus(tourToReject, status, {
        cancellationReason: rejectionReason,
        feedback: feedbackComment,
        cancellationBy: 'landlord',
        landlordNotes: feedbackComment 
      });

      toast.success(`Tour request ${status}`);
      setIsRejectDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${targetAction} tour`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleTour = async (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.info('To schedule a specific slot manually, use the property page.');
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
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
                            <div className="font-medium">{tour.user.name}</div>
                            <div className="text-sm text-muted-foreground">{tour.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(tour.preferredDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(tour.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>{getStatusBadge(tour.status)}</TableCell>
                        <TableCell className="text-right">
                          {tour.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:text-green-600"
                                onClick={() => handleApprove(tour.id)}
                                disabled={isProcessing}
                                title="Approve Visit"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-600"
                                onClick={() => initReject(tour.id)}
                                disabled={isProcessing}
                                title="Reject Visit"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {tour.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => initCancel(tour.id)}
                              disabled={isProcessing}
                            >
                              Cancel / No-Show
                            </Button>
                          )}
                          {tour.landlordNotes && (
                            <div className="text-xs text-muted-foreground mt-1 text-right italic">
                              Note: {tour.landlordNotes}
                            </div>
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

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {targetAction === 'reject' ? 'Reject Tour Request' : 'Cancel Tour / No-Show'}
              </DialogTitle>
              <DialogDescription>
                Please provide a reason. This helps track tour outcomes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <select
                  id="reason"
                  className="w-full p-2 border rounded-md"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  {feedbackOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Additional Comments (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="e.g., Tenant didn't arrive, or specific unavailable reasons..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isProcessing}>
                Close
              </Button>
              <Button variant="destructive" onClick={handleConfirmAction} disabled={isProcessing || !rejectionReason}>
                {isProcessing ? "Processing..." : `Confirm ${targetAction === 'reject' ? 'Rejection' : 'Cancellation'}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div >
  );
}

