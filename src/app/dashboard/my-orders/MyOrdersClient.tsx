'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useGetMyOrdersQuery,
  useRequestRefundMutation
} from '@/redux/features/order/orderApiSlice';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Package,
  RefreshCw,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';


export function MyOrdersClient() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refundDialogOpen, setRefundDialogOpen] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const { data, isLoading, refetch } = useGetMyOrdersQuery();
  const [requestRefund, { isLoading: isRequestingRefund }] = useRequestRefundMutation();

  const orders = data?.orders || [];

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="default" className="gap-1 bg-blue-500">
            <Clock className="h-3 w-3" />
            Processing
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Pending Approval
          </Badge>
        );
      case 'refunded':
        return (
          <Badge variant="secondary" className="gap-1">
            <RefreshCw className="h-3 w-3" />
            Refunded
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline">Unpaid</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleRequestRefund = async (orderId: string) => {
    try {
      await requestRefund({ orderId, reason: refundReason || undefined }).unwrap();
      toast.success('Refund request submitted successfully');
      setRefundDialogOpen(null);
      setRefundReason('');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to request refund');
    }
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading requisitions...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Requisitions</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your service requests and housing requisitions
            </p>
          </div>
          <Link href="/dashboard/order-home">
            <Button>
              <Package className="h-4 w-4 mr-2" />
              New Requisition
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Requisition History</CardTitle>
                <CardDescription>
                  {filteredOrders.length} requisition{filteredOrders.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Approved</SelectItem>
                  <SelectItem value="in_progress">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No requisitions found</p>
                <Link href="/dashboard/order-home">
                  <Button variant="outline" className="mt-4">
                    Create Your First Requisition
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">
                                  {order.package.packageName}
                                </h3>
                                {getStatusBadge(order.status)}
                                {getPaymentStatusBadge(order.paymentStatus)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Ordered: {new Date(order.orderDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Deadline: {new Date(order.deadline).toLocaleDateString()}
                                </span>
                                {!isDeadlinePassed(order.deadline) && (
                                  <span className="text-blue-600 font-medium">
                                    {getDaysRemaining(order.deadline)} days remaining
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                              <p className="text-sm font-medium mb-2">Requisition Type</p>
                              <Badge variant="outline" className="capitalize">
                                {order.listingType}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Estimated Cost</p>
                              <p className="text-lg font-semibold">
                                {order.package.currency} {order.package.price.toLocaleString()}
                              </p>
                            </div>
                            {order.preferences.city && (
                              <div>
                                <p className="text-sm font-medium mb-2">Target Location</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {order.preferences.city}
                                  {order.preferences.neighborhood && `, ${order.preferences.neighborhood}`}
                                </p>
                              </div>
                            )}
                            {order.suggestions && order.suggestions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Available Actions</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.suggestions.length} suggestion{order.suggestions.length !== 1 ? 's' : ''} available
                                </p>
                              </div>
                            )}
                          </div>

                          {order.response && (
                            <div className="pt-4 border-t">
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Remarks from Administration
                              </p>
                              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                {order.response}
                              </p>
                              {order.respondedAt && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Updated on {new Date(order.respondedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}

                          {order.assignedTo && typeof order.assignedTo === 'object' && (
                            <div className="pt-4 border-t">
                              <p className="text-sm font-medium mb-2">Assigned To</p>
                              <p className="text-sm text-muted-foreground">
                                {order.assignedTo.name} ({order.assignedTo.email})
                              </p>
                            </div>
                          )}

                          {order.refundEligible && order.status !== 'refunded' && (
                            <div className="pt-4 border-t">
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-yellow-800">
                                      Refund Eligible
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                      You are eligible for a refund. Deadline passed without suitable suggestions.
                                    </p>
                                  </div>
                                  <Dialog
                                    open={refundDialogOpen === order.id}
                                    onOpenChange={(open) => {
                                      setRefundDialogOpen(open ? order.id : null);
                                      if (!open) setRefundReason('');
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        Request Refund
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Request Refund</DialogTitle>
                                        <DialogDescription>
                                          Submit a refund request for this order. Our team will review and process it.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="reason">Reason (Optional)</Label>
                                          <Textarea
                                            id="reason"
                                            placeholder="Enter reason for refund..."
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                            rows={4}
                                          />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setRefundDialogOpen(null);
                                              setRefundReason('');
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            onClick={() => handleRequestRefund(order.id)}
                                            disabled={isRequestingRefund}
                                          >
                                            {isRequestingRefund ? 'Submitting...' : 'Submit Request'}
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          )}

                          {order.refundRequested && !order.refundProcessed && (
                            <div className="pt-4 border-t">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-800">
                                  Refund Request Pending
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                  Your refund request is being reviewed by our team.
                                </p>
                              </div>
                            </div>
                          )}

                          {order.refundProcessed && (
                            <div className="pt-4 border-t">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-green-800">
                                  Refund Processed
                                </p>
                                <p className="text-xs text-green-700 mt-1">
                                  Refund of {order.package.currency} {order.refundAmount?.toLocaleString()} has been processed.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

