/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCreateProperty } from '@/hooks/useProperties';
import { CreatePropertyData, FormErrors, initialFormData, PropertyFormData } from '@/types/property.types';
// Remove the properties-api import if it's no longer used, or keep other named imports
// Checking line 5: import { CreatePropertyData } from '@/lib/api/properties-api';
// It only imports CreatePropertyData. So I can remove it.
import { useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { useAuthState } from './useAuthState';
import { useErrorHandler } from './useErrorHandler';

export const usePropertyForm = () => {
  const { token, isAuthenticated } = useAuthState();
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [images, setImages] = useState<File[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const createPropertyMutation = useCreateProperty();

  const loading = createPropertyMutation.isPending;
  const error = createPropertyMutation.error?.message || '';
  const success = createPropertyMutation.isSuccess ? 'Property created successfully!' : '';

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleInputBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
    validateField(field, formData[field as keyof PropertyFormData]);
  };

  const handleSelectBlur = (field: string) => {
    handleInputBlur(field);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file size and type
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`);
        return false;
      }
      return true;
    });

    setImages(validFiles.slice(0, 10)); // Limit to 10 files
  };

  const validateField = (field: string, value: any): string => {
    const errors: FormErrors = {};

    switch (field) {
      case 'title':
        if (!value.trim()) errors.title = 'Title is required';
        else if (value.length < 10) errors.title = 'Title must be at least 10 characters';
        break;
      case 'description':
        if (!value.trim()) errors.description = 'Description is required';
        else if (value.length < 50) errors.description = 'Description must be at least 50 characters';
        break;
      case 'listingType':
        if (!value) errors.listingType = 'Listing type is required';
        break;
      case 'propertyType':
        if (!value) errors.propertyType = 'Property type is required';
        break;
      case 'address':
        if (!value.trim()) errors.address = 'Address is required';
        break;
      case 'city':
        if (!value) errors.city = 'City is required';
        break;
      case 'neighborhood':
        if (!value.trim()) errors.neighborhood = 'Neighborhood is required';
        break;
      case 'bedrooms':
        if (value < 0) errors.bedrooms = 'Bedrooms cannot be negative';
        break;
      case 'bathrooms':
        if (value < 0) errors.bathrooms = 'Bathrooms cannot be negative';
        break;
      case 'areaSize':
        if (!value || value <= 0) errors.areaSize = 'Area size must be positive';
        break;
      case formData.listingType === 'rent' ? 'rentPrice' : 'salePrice':
        if (!value || value <= 0) errors[field] = 'Price must be positive';
        break;
    }

    const error = errors[field];
    if (error) {
      setFormErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    return error || '';
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      'title', 'description', 'listingType', 'propertyType',
      'address', 'city', 'neighborhood', 'bedrooms', 'bathrooms', 'areaSize'
    ];

    const errors: FormErrors = {};

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof PropertyFormData]);
      if (error) {
        errors[field] = error;
      }
    });

    // Price validation based on listing type
    if (formData.listingType === 'rent') {
      if (!formData.rentPrice || formData.rentPrice <= 0) {
        errors.rentPrice = 'Rent price is required';
      }
    } else {
      if (!formData.salePrice || formData.salePrice <= 0) {
        errors.salePrice = 'Sale price is required';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const { handleMutationError } = useErrorHandler();

  // Add this function to your usePropertyForm.ts file
  const transformFormDataForSubmission = (formData: PropertyFormData): CreatePropertyData => {
    const baseData: any = {
      // Basic Information
      title: formData.title.trim(),
      description: formData.description.trim(),
      listingType: formData.listingType,
      propertyType: formData.propertyType,

      // Location
      address: formData.address.trim(),
      city: formData.city,
      neighborhood: formData.neighborhood.trim(),
      state: formData.state,
      country: formData.country || 'Bangladesh',
      latitude: formData.latitude || 23.8103, // Default Dhaka coordinates
      longitude: formData.longitude || 90.4125, // Default Dhaka coordinates
      zipCode: formData.zipCode?.trim() || undefined,

      // Specifications
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      areaSize: Number(formData.areaSize) || 0,
      areaUnit: formData.areaUnit,
      floor: formData.floor ? Number(formData.floor) : undefined,
      totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
      yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
      lotSize: formData.lotSize ? Number(formData.lotSize) : undefined,
      lotUnit: formData.lotUnit,

      // Features
      amenities: formData.amenities || [],
      tags: formData.tags || [],
      images: [], // We'll handle images separately via file upload
      videos: [],
      floorPlans: [],
      managementCompany: undefined,
    };

    // Add rental-specific fields
    if (formData.listingType === 'rent') {
      baseData.rentPrice = Number(formData.rentPrice) || 0;
      baseData.currency = 'BDT';
      baseData.securityDeposit = formData.securityDeposit ? Number(formData.securityDeposit) : undefined;
      baseData.utilityDeposit = formData.utilityDeposit ? Number(formData.utilityDeposit) : undefined;
      baseData.maintenanceFee = formData.maintenanceFee ? Number(formData.maintenanceFee) : undefined;
      baseData.minimumStay = Number(formData.minimumStay) || 12;
      baseData.maximumStay = formData.maximumStay ? Number(formData.maximumStay) : undefined;
      baseData.availableFrom = formData.availableFrom;
      baseData.leaseDuration = formData.leaseDuration ? Number(formData.leaseDuration) : undefined;
      baseData.isFurnished = Boolean(formData.isFurnished);
      baseData.utilitiesIncluded = formData.utilitiesIncluded || [];
      baseData.petPolicy = formData.petPolicy || 'not-allowed';
      baseData.smokingPolicy = formData.smokingPolicy || 'not-allowed';
      baseData.isAvailable = true;
    }
    // Add sale-specific fields
    else {
      baseData.salePrice = Number(formData.salePrice) || 0;
      baseData.currency = 'BDT';
      baseData.originalPrice = formData.originalPrice ? Number(formData.originalPrice) : undefined;
      baseData.priceNegotiable = Boolean(formData.priceNegotiable);
      baseData.mortgageAvailable = Boolean(formData.mortgageAvailable);
      baseData.propertyCondition = formData.propertyCondition || 'good';
      baseData.ownershipType = formData.ownershipType || 'freehold';
      baseData.hoaFee = formData.hoaFee ? Number(formData.hoaFee) : undefined;
      baseData.hoaFrequency = formData.hoaFrequency;
      baseData.taxAmount = formData.taxAmount ? Number(formData.taxAmount) : undefined;
      baseData.taxYear = formData.taxYear ? Number(formData.taxYear) : undefined;
      baseData.openHouseDates = [];
      baseData.offerDeadline = undefined;
      baseData.timeOnMarket = 0;
    }

    return baseData as CreatePropertyData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      toast.error('Please log in to add a property');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    try {
      const propertyData = transformFormDataForSubmission(formData);

      await createPropertyMutation.mutateAsync({
        propertyData: propertyData,
        images: images
      });

      resetForm();

      const result = await Swal.fire({
        icon: 'success',
        title: 'Property Created!',
        text: 'Your property has been listed successfully',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'View Properties',
      });

      if (result.isConfirmed) {
        window.location.href = '/dashboard/properties';
      }

    } catch (error: any) {
      const errorInfo = handleMutationError(error, 'create property');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorInfo.message || 'Failed to create property',
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setImages([]);
    setTouched(new Set());
  };

  return {
    formData,
    formErrors,
    images,
    touched,
    loading,
    error,
    success,
    handleInputChange,
    handleInputBlur,
    handleSelectBlur,
    handleFileChange,
    handleSubmit,
    resetForm
  };
};