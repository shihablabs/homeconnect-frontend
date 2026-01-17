import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usersApi } from '@/lib/api/users-api'; // Ensure this exists or use appropriate API
import { confirmDelete } from '@/lib/swal';
import { useAppSelector } from '@/redux/hooks';
import type { PropertyResponse } from '@/types/property.types';
import { Check, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { BookingFormData, DocumentFile } from '../types';

interface ApplicationDetailsStepProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedProperty: PropertyResponse | null;
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
  documents: DocumentFile[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, docId: string) => void;
  handleRemoveDocument: (docId: string) => void;
  handleSetDocument: (docId: string, url: string, name: string) => void;
  validateStep2: () => boolean;
  isLocked?: boolean;
  onBack?: () => void;
}

export function ApplicationDetailsStep({
  currentStep,
  setCurrentStep,
  selectedProperty,
  formData,
  setFormData,
  documents,
  handleFileUpload,
  handleRemoveDocument,
  handleSetDocument,
  validateStep2,
  isLocked,
  onBack,
}: ApplicationDetailsStepProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [verifiedDocs, setVerifiedDocs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await usersApi.getProfile(user?.id || '');
        const profile = res.data || res;
        if (profile.documents) {
          setVerifiedDocs(profile.documents);
        }
      } catch (err) {
        console.error("Failed to load verified documents", err);
      }
    };

    if (user?.id) {
      fetchDocs();
    }
  }, [user?.id]);

  const handleSelectVerifiedDoc = (docId: string, verifiedDoc: any) => {
    handleSetDocument(docId, verifiedDoc.url, verifiedDoc.name);
    toast.success(`${verifiedDoc.name} selected from your profile`);
  };

  // Wait, I can't finish this in one go without updating parent.
  // The plan said "Update Frontend...". 
  // I will assume I need to update `CreateBookingClient` first or simultaneously to pass `setDocuments` or `handleSelectDocument`.
  // Let's modify `ApplicationDetailsStep` to invoke a new prop `onSelectDocument` and then update Parent.
  // OR, better, let's pause this tool call and update `CreateBookingClient` FIRST to add the handler, 
  // then update this component.

  // Actually, I will update `ApplicationDetailsStep` interface to include `onSelectDocument`.
  return (
    <Card className={`border-none shadow-md overflow-hidden transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-primary ring-offset-2' : ''} ${currentStep < 2 ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <div className="bg-primary/5 p-4 border-b border-primary/10 flex justify-between items-center cursor-pointer"
        onClick={() => selectedProperty && setCurrentStep(2)}>
        <h2 className="font-semibold text-lg flex items-center gap-2 text-primary">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">2</span>
          Application Details
        </h2>
        {currentStep > 2 && <Check className="h-5 w-5 text-green-500" />}
      </div>

      {currentStep === 2 && (
        <CardContent className="p-6 space-y-8">

          {selectedProperty && (
            <div className="bg-muted/30 p-4 rounded-xl border flex gap-4 items-center">
              <div className="h-16 w-20 relative rounded-lg overflow-hidden shrink-0 bg-gray-100">
                {selectedProperty.images?.[0] ? (
                  <Image src={selectedProperty.images[0]} alt={selectedProperty.title} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-200" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900">{selectedProperty.title}</h3>
                <p className="text-xs text-muted-foreground">{selectedProperty.address}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs font-bold text-primary">
                    ৳{selectedProperty.listingType === 'rent' ? (selectedProperty as any).pricePerMonth?.toLocaleString() : 'N/A'}/mo
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Requested Dates</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Check-in</Label>
                <Input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Check-out</Label>
                <Input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  min={formData.checkIn}
                  className="h-11"
                />
              </div>
            </div>

            {selectedProperty?.listingType === 'rent' && (
              <div className="space-y-2">
                <Label>Lease Duration (Months)</Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.leaseDurationInMonths}
                  onChange={(e) => setFormData({ ...formData, leaseDurationInMonths: e.target.value })}
                  className="w-full text-center font-bold h-11"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Message to Landlord (Optional)</Label>
            <Textarea
              placeholder="Introduce yourself, mention who will be staying, special needs..."
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 flex items-center justify-between">
              Required Documents
              <span className="text-xs font-normal text-muted-foreground bg-gray-100 px-2 py-1 rounded">Secure & Private</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG or PDF (Max 5MB)</p>
                    </div>
                    {doc.url && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={() => handleRemoveDocument(doc.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {doc.url ? (
                    <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden border">
                      <Image src={doc.url} alt={doc.name} fill className="object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="h-8 w-8 text-white drop-shadow-md" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-white/50 hover:bg-white transition-all">
                      {doc.uploading ? (
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      ) : (
                        <div className="flex flex-col gap-2 w-full">
                          <label className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors">
                            <Upload className="h-6 w-6 text-gray-400 mb-1" />
                            <span className="text-xs text-center font-medium">Upload New</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, doc.id)}
                              disabled={doc.uploading}
                            />
                          </label>

                          {verifiedDocs.length > 0 && (
                            <>
                              <div className="flex items-center gap-2">
                                <hr className="flex-1 border-gray-200" />
                                <span className="text-[10px] text-gray-400 uppercase">OR</span>
                                <hr className="flex-1 border-gray-200" />
                              </div>

                              <div className="grid grid-cols-1 gap-1 w-full">
                                {verifiedDocs.map((vDoc: any, idx: number) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    className="text-[10px] truncate bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all text-left flex items-center gap-1"
                                    onClick={() => handleSelectVerifiedDoc(doc.id, vDoc)}
                                  >
                                    <Check className="h-3 w-3" />
                                    Select: {vDoc.name}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={async () => {
                if (isLocked) {
                  const result = await confirmDelete(
                    "Changing Property?",
                    "Changing property will unlink this booking from your tour. Continue?"
                  );
                  if (result) {
                    if (onBack) onBack();
                    else setCurrentStep(1);
                  }
                } else {
                  if (onBack) onBack();
                  else setCurrentStep(1);
                }
              }}
            >
              Back to Selection
            </Button>
            <Button onClick={() => validateStep2() && setCurrentStep(3)}>Review Application</Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
