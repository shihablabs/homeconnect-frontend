import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PropertyResponse } from '@/types/property.types';
import { format } from 'date-fns';
import { Loader2, ShieldCheck } from 'lucide-react';
import type { BookingFormData, DocumentFile } from '../types';

interface ReviewSubmitStepProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedProperty: PropertyResponse | null;
  formData: BookingFormData;
  documents: DocumentFile[];
  handleSubmit: () => void;
  submitting: boolean;
}

export function ReviewSubmitStep({
  currentStep,
  setCurrentStep,
  selectedProperty,
  formData,
  documents,
  handleSubmit,
  submitting,
}: ReviewSubmitStepProps) {
  return (
    <Card className={`border-none shadow-md overflow-hidden transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-primary ring-offset-2' : ''} ${currentStep < 3 ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <div className="bg-primary/5 p-4 border-b border-primary/10 flex justify-between items-center cursor-pointer"
        onClick={() => selectedProperty && setCurrentStep(3)}>
        <h2 className="font-semibold text-lg flex items-center gap-2 text-primary">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">3</span>
          Review & Submit
        </h2>
      </div>

      {currentStep === 3 && (
        <CardContent className="p-6 space-y-6">

          <div className="rounded-xl bg-yellow-50 p-4 border border-yellow-100 text-sm text-yellow-800 flex gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-yellow-600" />
            <div>
              <p className="font-semibold">Review before submitting</p>
              <p className="mt-1">
                This is a <strong>Request to Book</strong>. You will not be charged yet. The landlord will review your application and documents.
                Once approved, you'll be notified to pay the advance/deposit to confirm.
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-xl text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Property</span>
              <span className="font-semibold">{selectedProperty?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dates</span>
              <span className="font-semibold">{formData.checkIn ? format(new Date(formData.checkIn), 'MMM dd') : 'N/A'} - {formData.checkOut ? format(new Date(formData.checkOut), 'MMM dd, yyyy') : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Lease</span>
              <span className="font-semibold">{formData.leaseDurationInMonths} Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Documents Attached</span>
              <span className="font-semibold text-primary">{documents.filter(d => d.url).length} Files</span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
            <Button onClick={handleSubmit} size="lg" className="px-8" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
