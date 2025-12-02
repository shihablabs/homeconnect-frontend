'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { adminApi, type PendingProperty } from '@/lib/api/admin-api';
import { Building2, CheckCircle2, XCircle, Eye, FileCheck, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { propertiesApi } from '@/lib/api/properties-api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ConfirmDialogWithInput } from '@/components/ui/confirm-dialog-with-input';

export function PropertyVerificationClient() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'status' | 'delete';
    propertyId?: string;
    propertyTitle?: string;
    newStatus?: string;
  }>({ open: false, type: 'status' });
  const queryClient = useQueryClient();

  const {
    data: propertiesData,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'properties', 'pending', page, statusFilter],
    queryFn: async () => {
      const response = await adminApi.getPendingProperties({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter as any,
      });
      return {
        properties: response.properties || [],
        pagination: response.pagination || { total: 0, page: 1, totalPages: 1 },
      };
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 60000, // Auto-refetch every minute for real-time updates
    retry: (failureCount, error: any) => {
      // Don't retry on rate limit errors
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const properties = propertiesData?.properties || [];
  const totalPages = propertiesData?.pagination?.totalPages || 1;

  const statusChangeMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      return await adminApi.verifyProperty(id, {
        verificationStatus: status as any,
        verificationNotes: notes || `Status changed to ${status}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties', 'pending'] });
      toast.success('Status updated successfully');
      setChangingStatus(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update status');
      setChangingStatus(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return await propertiesApi.deleteProperty(id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties', 'pending'] });
      toast.success('Property deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete property');
    },
  });

  const handleStatusChangeClick = (propertyId: string, propertyTitle: string, newStatus: string) => {
    setConfirmDialog({
      open: true,
      type: 'status',
      propertyId,
      propertyTitle,
      newStatus,
    });
  };

  const handleStatusChangeConfirm = async (message?: string) => {
    if (!confirmDialog.propertyId || !confirmDialog.newStatus) return;
    setChangingStatus(confirmDialog.propertyId);
    statusChangeMutation.mutate({ 
      id: confirmDialog.propertyId, 
      status: confirmDialog.newStatus,
      notes: message,
    });
  };

  const handleDeleteClick = (propertyId: string, propertyTitle: string) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      propertyId,
      propertyTitle,
    });
  };

  const handleDeleteConfirm = async (reason?: string) => {
    if (!confirmDialog.propertyId) return;
    deleteMutation.mutate({ id: confirmDialog.propertyId, reason });
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
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <FileCheck className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading && (!properties || properties.length === 0)) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center text-muted-foreground">Loading properties...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Failed to load properties</h3>
              <p className="text-muted-foreground text-center">
                {(error as any)?.response?.data?.message || 'An error occurred while fetching properties'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
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
          <h1 className="text-3xl font-bold">Property Verification</h1>
          <p className="text-muted-foreground mt-1">
            Review and verify property listings
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${properties.length} propert${properties.length !== 1 ? 'ies' : 'y'} found${isFetching ? ' (updating...)' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!properties || properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div className="font-medium">{property.title}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {property.id.slice(0, 8)}...
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{property.owner?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {property.owner?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{property.address}</div>
                            <div className="text-sm text-muted-foreground">
                              {property.city}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(property.verificationStatus)}
                            {changingStatus === property.id ? (
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            ) : (
                              <Select
                                value={property.verificationStatus}
                                onValueChange={(value) => {
                                  if (value !== property.verificationStatus) {
                                    handleStatusChangeClick(property.id, property.title, value);
                                  }
                                }}
                                disabled={changingStatus === property.id}
                              >
                                <SelectTrigger className="w-[140px] h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="under_review">Under Review</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(property.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/admin/properties/${property.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Review
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(property.id, property.title)}
                              disabled={deleteMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Status Change Confirmation Dialog with Message Input */}
      <ConfirmDialogWithInput
        open={confirmDialog.open && confirmDialog.type === 'status'}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Change Verification Status"
        description={
          confirmDialog.propertyTitle && confirmDialog.newStatus
            ? `Are you sure you want to change the verification status of "${confirmDialog.propertyTitle}" to ${confirmDialog.newStatus.replace('_', ' ')}? Please provide a reason or notes for this change.`
            : 'Are you sure you want to change the verification status? Please provide a reason or notes for this change.'
        }
        confirmText="Change Status"
        cancelText="Cancel"
        inputLabel="Verification Notes"
        inputPlaceholder={`Enter reason for ${confirmDialog.newStatus?.replace('_', ' ') || 'status change'}...`}
        inputRequired={false}
        inputMaxLength={500}
        onConfirm={handleStatusChangeConfirm}
        isLoading={statusChangeMutation.isPending}
      />

      {/* Delete Confirmation Dialog with Reason Input */}
      <ConfirmDialogWithInput
        open={confirmDialog.open && confirmDialog.type === 'delete'}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Delete Property"
        description={
          confirmDialog.propertyTitle
            ? `Are you sure you want to delete "${confirmDialog.propertyTitle}"? This action will soft-delete the property (mark as deleted but keep data). Please provide a reason for deletion.`
            : 'Are you sure you want to delete this property? This action will soft-delete the property. Please provide a reason for deletion.'
        }
        confirmText="Delete Property"
        cancelText="Cancel"
        variant="destructive"
        inputLabel="Delete Reason"
        inputPlaceholder="Enter reason for deletion (e.g., Violates policy, Duplicate listing, etc.)..."
        inputRequired={true}
        inputMaxLength={500}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

