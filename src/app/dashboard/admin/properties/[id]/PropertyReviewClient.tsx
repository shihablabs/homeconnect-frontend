'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialogWithInput } from '@/components/ui/confirm-dialog-with-input';
import { adminApi, type PropertyWithVerification } from '@/lib/api/admin-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface PropertyReviewClientProps {
  propertyId: string;
}

export function PropertyReviewClient({ propertyId }: PropertyReviewClientProps) {
  const router = useRouter();
  const [property, setProperty] = useState<PropertyWithVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'status';
    newStatus?: string;
  }>({ open: false, type: 'status' });


  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentSlide(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);


  const fetchProperty = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPropertyForReview(propertyId);
      setProperty(data);
    } catch (error: unknown) {

      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getPropertyForReview(propertyId);
        setProperty(data);
      } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        toast.error(errorMessage || 'Failed to fetch property details');
        router.push('/dashboard/admin/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, router]);

  const statusChangeMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      return await adminApi.verifyProperty(id, {
        verificationStatus: status as 'pending' | 'under_review' | 'approved' | 'rejected',
        verificationNotes: notes || `Status changed to ${status}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      toast.success('Status updated successfully');
      setConfirmDialog({ ...confirmDialog, open: false });
      fetchProperty();
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to update status');
    },
  });

  const handleStatusChangeClick = (newStatus: string) => {
    setConfirmDialog({
      open: true,
      type: 'status',
      newStatus,
    });
  };

  const handleStatusChangeConfirm = async (message?: string) => {
    if (!confirmDialog.newStatus || !property) return;
    statusChangeMutation.mutate({
      id: property.id,
      status: confirmDialog.newStatus,
      notes: message,
    });
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading property details...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Property not found</p>
                <Link href="/dashboard/admin/properties">
                  <Button>Back to Properties</Button>
                </Link>
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
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/properties">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Property Review</h1>
            <p className="text-muted-foreground mt-1">
              Review and verify property listing
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          { }
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
                <CardDescription>{property.address}, {property.city}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{property.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Listing Type</p>
                    <p className="font-medium capitalize">{property.listingType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium capitalize">{property.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-medium">{property.owner?.name}</p>
                    <p className="text-sm text-muted-foreground">{property.owner?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Status</p>
                    {property.verificationStatus === 'approved' ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                      </Badge>
                    ) : property.verificationStatus === 'rejected' ? (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </Badge>
                    ) : property.verificationStatus === 'under_review' ? (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        Under Review
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                {property.images && property.images.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Images</h4>

                    <div className="relative group rounded-lg overflow-hidden border bg-gray-100">
                      <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                          {property.images.map((src, index) => (
                            <div className="relative flex-[0_0_100%] min-w-0" key={index}>
                              <div
                                className="relative aspect-video cursor-zoom-in"
                                onClick={() => setLightboxIndex(index)}
                              >
                                <Image
                                  src={src}
                                  alt={`Property image ${index + 1}`}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {property.images.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={scrollPrev}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={scrollNext}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {currentSlide + 1} / {property.images.length}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                      {property.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative aspect-square cursor-pointer rounded-md overflow-hidden border-2 transition-all ${currentSlide === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          onClick={() => {
                            if (emblaApi) emblaApi.scrollTo(idx);
                          }}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <Lightbox
                      open={lightboxIndex >= 0}
                      close={() => setLightboxIndex(-1)}
                      index={lightboxIndex}
                      slides={property.images.map(src => ({ src }))}
                    />
                  </div>
                )}

                {property.documents && property.documents.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Documents</h4>
                    <div className="space-y-2">
                      {property.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                          <FileText className="h-4 w-4" />
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {doc.type} - {new Date(doc.uploadedAt).toLocaleDateString()}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          { }
          <div className="space-y-6">
            { }
            {property.verificationStatus === 'approved' && (
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-green-900">Property Approved</CardTitle>
                      <CardDescription className="text-green-700">
                        This property has been verified and is live on the platform
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="bg-green-600 text-white">
                      Approved
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.verificationDate && (
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <Clock className="h-4 w-4" />
                      <span>Approved on {new Date(property.verificationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  )}
                  {property.verifiedBy && (
                    <div className="text-sm text-green-800">
                      <span className="font-medium">Verified by:</span> {property.verifiedBy.name}
                    </div>
                  )}
                  {property.verificationNotes && (
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-900 mb-2">Verification Notes:</p>
                      <p className="text-sm text-green-800 leading-relaxed">{property.verificationNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            { }
            {property.verificationStatus === 'rejected' && (
              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-red-900">Property Rejected</CardTitle>
                      <CardDescription className="text-red-700">
                        This property was rejected and is not visible to users
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.verificationDate && (
                    <div className="flex items-center gap-2 text-sm text-red-800">
                      <Clock className="h-4 w-4" />
                      <span>Rejected on {new Date(property.verificationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  )}
                  {property.verifiedBy && (
                    <div className="text-sm text-red-800">
                      <span className="font-medium">Rejected by:</span> {property.verifiedBy.name}
                    </div>
                  )}
                  {property.verificationNotes && (
                    <div className="p-4 bg-white rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-900 mb-2">Rejection Reason:</p>
                      <p className="text-sm text-red-800 leading-relaxed">{property.verificationNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            { }
            {(property.verificationStatus === 'pending' || property.verificationStatus === 'under_review') && (
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-blue-900">
                        {property.verificationStatus === 'under_review' ? 'Under Review' : 'Pending Verification'}
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        This property is awaiting verification. Use the Property Verification page to approve or reject.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {property.verificationStatus === 'under_review' ? 'Under Review' : 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-blue-800 mb-2">
                      Review the property details and documents above.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleStatusChangeClick('approved')}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleStatusChangeClick('rejected')}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                    <Link href="/dashboard/admin/properties">
                      <Button variant="outline" className="w-full mt-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {property.verificationHistory && property.verificationHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Verification History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {property.verificationHistory.map((history, idx) => (
                      <div key={idx} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-1">
                          <Badge>{history.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(history.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {history.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{history.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Reviewed by: {history.reviewedBy}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      { }
      <ConfirmDialogWithInput
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Change Verification Status"
        description={
          confirmDialog.newStatus === 'approved'
            ? "Are you sure you want to APPROVE this property? It will become visible to all users."
            : "Are you sure you want to REJECT this property? It will be hidden from users."
        }
        confirmText={confirmDialog.newStatus === 'approved' ? "Approve Property" : "Reject Property"}
        cancelText="Cancel"
        variant={confirmDialog.newStatus === 'rejected' ? 'destructive' : 'default'}
        inputLabel="Verification Notes (Optional)"
        inputPlaceholder={confirmDialog.newStatus === 'rejected' ? "Reason for rejection..." : "Any additional notes..."}
        inputRequired={confirmDialog.newStatus === 'rejected'}
        inputMaxLength={500}
        onConfirm={handleStatusChangeConfirm}
        isLoading={statusChangeMutation.isPending}
      />
    </div>
  );
}

