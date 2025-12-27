'use client';

import { bookingsApi } from '@/lib/api/bookings-api';
import { propertiesApi } from '@/lib/api/properties-api';
import { uploadService } from '@/lib/api/upload-api';
import type { PropertyResponse } from '@/types/property.types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ApplicationDetailsStep } from './steps/ApplicationDetailsStep';
import { BookingSummary } from './steps/BookingSummary';
import { PropertySelectionStep } from './steps/PropertySelectionStep';
import { ReviewSubmitStep } from './steps/ReviewSubmitStep';
import type { BookingFormData, DocumentFile } from './types';

export function CreateBookingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPropertyId = searchParams.get('propertyId');

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<BookingFormData>({
    propertyId: '',
    checkIn: '',
    checkOut: '',
    specialRequests: '',
    leaseDurationInMonths: '12',
  });

  // Documents State
  const [documents, setDocuments] = useState<DocumentFile[]>([
    { id: 'id_proof', name: 'Identity Proof', type: 'id_proof', url: '' },
    { id: 'income_proof', name: 'Income Proof', type: 'income_proof', url: '' },
  ]);

  // Handle pre-selected property
  useEffect(() => {
    const fetchPreSelectedProperty = async () => {
      if (!preSelectedPropertyId) return;
      try {
        setLoading(true);
        const property = await propertiesApi.getProperty(preSelectedPropertyId);
        if (property) {
          handleSelectProperty(property);
        }
      } catch (error) {
        console.error('Failed to fetch pre-selected property:', error);
        toast.error('Failed to load selected property');
      } finally {
        setLoading(false);
      }
    };
    fetchPreSelectedProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedPropertyId]);

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
  };

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

    // Validate size (5MB)
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
        setupRecurringPayment: false, // Removed as requested
        documents: uploadedDocs,
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Link href="/dashboard/bookings" className="hover:text-primary transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Start Your Application</h1>
          <p className="text-gray-500">Apply for your dream home in 3 simple steps.</p>
        </div>

        {/* Step Indicator */}
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

        {/* Left Column: Wizard Steps */}
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
            validateStep2={validateStep2}
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

        {/* Right Column: Sticky Summary */}
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
