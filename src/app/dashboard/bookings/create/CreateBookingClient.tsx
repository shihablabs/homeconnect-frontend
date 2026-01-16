'use client';

import { bookingsApi } from '@/lib/api/bookings-api';
import { propertiesApi } from '@/lib/api/properties-api';
import { uploadService } from '@/lib/api/upload-api';
// Keeping Redux imports for potential future compatibility but bypassing for initialization as requested
import type { PropertyResponse } from '@/types/property.types';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { ApplicationDetailsStep } from './steps/ApplicationDetailsStep';
import { BookingSummary } from './steps/BookingSummary';
import { PropertySelectionStep } from './steps/PropertySelectionStep';
import { ReviewSubmitStep } from './steps/ReviewSubmitStep';
import type { BookingFormData, DocumentFile } from './types';

export function CreateBookingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  // -- 1. Synchronous Params --
  const paramPropertyId = searchParams.get('propertyId');
  const paramTourId = searchParams.get('tourId');

  // -- 2. State Blocking --
  const [isInitializing, setIsInitializing] = useState(true);

  // Normal States
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(false); // For search loading
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    propertyId: '',
    checkIn: '',
    checkOut: '',
    specialRequests: '',
    leaseDurationInMonths: '12',
  });

  const [documents, setDocuments] = useState<DocumentFile[]>([
    { id: 'id_proof', name: 'Identity Proof', type: 'id_proof', url: '' },
    { id: 'income_proof', name: 'Income Proof', type: 'income_proof', url: '' },
  ]);

  // -- Tour State --
  const [activeTourId, setActiveTourId] = useState<string | null>(null);

  // -- 3. The 'Killer' UseEffect --
  useEffect(() => {
    // If we have a URL property ID, we MUST fetch and init
    if (paramPropertyId) {
      console.log('Commander Init: Fetching Property', paramPropertyId);

      const initFlow = async () => {
        try {
          // Note: using local var here, but the Guard Clause handles the visual loading
          const res = await propertiesApi.getProperty(paramPropertyId);
          // Handle potential different response structures (unwrapped vs wrapped)
          // The API fix should return the object directly, but we add safety here.
          const property = (res as any)?.data || res;

          console.log('Commander Init: Data received:', property);

          if (property && property._id || property.id) {
            // -- ATOMIC UPDATE BLOCK --
            setSelectedProperty(property);
            setFormData(prev => ({ ...prev, propertyId: property.id || property._id }));
            // Initialize activeTourId from param if present
            if (paramTourId) setActiveTourId(paramTourId);
            setCurrentStep(2);
            // -------------------------
          } else {
            console.error('Property data missing _id/id or is null', property);
            toast.error('Failed to load property details');
          }
        } catch (error) {
          console.error('Commander Init: Error', error);
          toast.error('Failed to load selected property');
        } finally {
          setIsInitializing(false);
        }
      };

      initFlow();
    } else {
      // No property ID in URL -> Allow Step 1 to render immediately
      setIsInitializing(false);
    }

    // Explicitly excluding dependencies to run ONCE mainly, or when param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramPropertyId]);


  // -- Handlers --

  const searchProperties = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const response = await propertiesApi.getProperties({
        search: searchQuery,
        limit: 5,
      });
      setProperties(response.properties);
    } catch (error: unknown) {
      console.error('Failed to search properties:', error);
      toast.error('Failed to search properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = (property: PropertyResponse) => {
    setSelectedProperty(property);
    setFormData((prev) => ({ ...prev, propertyId: property?.id || '' }));
    setProperties([]);
    setSearchQuery('');
    if (property) {
      setCurrentStep(2);
    }
  };

  const handleBackToSelection = () => {
    // If we are going back, we might be unlinking.
    // The confirmation logic is in the Child (ApplicationDetailsStep).
    // If this is called, confirms we go back and clear tour.
    setActiveTourId(null);
    setCurrentStep(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchProperties();
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const calculateTotalDays = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, uploading: true } : d));
    try {
      const response = await uploadService.uploadImage(file, 'booking-documents');
      setDocuments(prev => prev.map(d => d.id === docId ? {
        ...d,
        url: response.url,
        file,
        uploading: false
      } : d));
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload document');
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, uploading: false } : d));
    }
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, url: '', file: undefined } : d));
  };

  const handleSetDocument = (docId: string, url: string, name: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, url, name, file: undefined, uploading: false } : d));
  };

  const validateStep2 = () => {
    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return false;
    }
    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return false;
    }
    if (selectedProperty?.listingType === 'rent') {
      const duration = parseInt(formData.leaseDurationInMonths);
      if (!duration || duration < 1 || duration > 120) {
        toast.error('Lease duration must be between 1 and 120 months');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.propertyId || !selectedProperty) {
      toast.error('Property is missing');
      return;
    }

    try {
      setSubmitting(true);
      const leaseDuration = parseInt(formData.leaseDurationInMonths);
      const uploadedDocs = documents
        .filter(d => d.url)
        .map(d => ({ name: d.name, type: d.type, url: d.url }));

      await bookingsApi.createBooking({
        propertyId: formData.propertyId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        specialRequests: formData.specialRequests || undefined,
        leaseDurationInMonths: leaseDuration,
        setupRecurringPayment: false,
        documents: uploadedDocs,
        tourId: activeTourId || undefined, // Use state-based tourId
      });

      toast.success('Application submitted successfully! Redirecting...');
      router.push('/dashboard/my-tours');

    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  // -- 4. The Guard Clause (CRITICAL) --
  if (isInitializing && paramPropertyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Configuring Application...</h3>
        <p className="text-gray-500 max-w-sm text-center mt-2">
          Verifying property availability...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 py-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Start Your Application
          </h1>
          <p className="text-lg text-muted-foreground/80 font-medium">
            Apply for your dream home in <span className="text-primary">3 simple steps</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${currentStep >= step ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-500'
                }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PropertySelectionStep
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            selectedProperty={selectedProperty}
            setSelectedProperty={setSelectedProperty}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            properties={properties}
            loading={loading}
            searchProperties={searchProperties}
            handleSelectProperty={handleSelectProperty}
            tourId={activeTourId}
          />

          <ApplicationDetailsStep
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            selectedProperty={selectedProperty}
            formData={formData}
            setFormData={setFormData}
            documents={documents}
            handleFileUpload={handleFileUpload}
            handleRemoveDocument={handleRemoveDocument}
            handleSetDocument={handleSetDocument}
            validateStep2={validateStep2}
            isLocked={!!activeTourId}
            onBack={handleBackToSelection}
          />

          <ReviewSubmitStep
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            selectedProperty={selectedProperty}
            formData={formData}
            documents={documents}
            handleSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>

        <div className="lg:col-span-1 hidden lg:block">
          <BookingSummary
            selectedProperty={selectedProperty}
            calculateTotalDays={calculateTotalDays}
          />
        </div>
      </div>
    </div>
  );
}
