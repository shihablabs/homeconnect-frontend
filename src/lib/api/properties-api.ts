/* eslint-disable @typescript-eslint/no-unused-vars */

import { api } from './api';

// --- Interfaces & Types ---

export type ListingType = 'rent' | 'sale';

export interface PropertyFilters {
  listingType?: ListingType;
  propertyType?: string;
  minRent?: number;
  maxRent?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | { min?: number; max?: number };
  bathrooms?: number | { min?: number; max?: number };
  city?: string;
  neighborhood?: string;
  amenities?: string[];
  featured?: boolean;
  isVerified?: boolean;
  search?: string;
  sortBy?: 'price' | 'createdAt' | 'updatedAt' | 'areaSize' | 'bedrooms' | 'views';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  minStay?: number;
  isFurnished?: boolean;
  petPolicy?: 'allowed' | 'not-allowed' | 'case-by-case';
  utilitiesIncluded?: string[];
  availableFrom?: string;
  propertyCondition?: string[];
  ownershipType?: string;
  priceNegotiable?: boolean;
  mortgageAvailable?: boolean;
  isFeatured?: boolean;
  isAvailable?: boolean;
  q?: string;
  minBeds?: number;
  sort?: string;
}

import { AvailableFilters, CreatePropertyData, PropertyResponse, PropertySearchResult, UpdatePropertyData } from '@/types/property.types';
export type { PropertyResponse };

export interface FavoriteResponse {
  favorited: boolean;
}

// --- API Implementation ---

export const propertiesApi = {
  getAllProperties: async (): Promise<PropertyResponse[]> => {
    const response = await api.get('/properties');
    console.log(response);
    return response.data.data;
  },

  // Get all properties with filters
  getProperties: async (filters: PropertyFilters = {}): Promise<PropertySearchResult> => {
    // Mapping simple filters to backend filters if needed
    if (filters.q) {
      filters.search = filters.q;
      delete filters.q;
    }
    // Add other mappings if 'sort' or 'minBeds' are used

    const response = await api.get('/properties', { params: filters });
    return response.data.data;
  },

  // Get single property by ID
  getProperty: async (id: string): Promise<PropertyResponse> => {
    const response = await api.get(`/properties/${id}`);
    return response.data.data.property;
  },

  // Create new property
  createProperty: async (data: CreatePropertyData, images?: File[]): Promise<PropertyResponse> => {
    const formData = new FormData();

    // Create a copy of data without the images field
    const { images: _, ...dataWithoutImages } = data;

    // Append all data fields except images
    Object.keys(dataWithoutImages).forEach(key => {
      const value = (dataWithoutImages as Record<string, unknown>)[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Append image files (these go to req.files in backend)
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.property;
  },

  // Update property
  updateProperty: async (id: string, data: UpdatePropertyData): Promise<PropertyResponse> => {
    const response = await api.patch(`/properties/${id}`, data);
    return response.data.data.property;
  },

  // Delete property
  deleteProperty: async (id: string, reason?: string): Promise<{ message: string }> => {
    const response = await api.delete(`/properties/${id}`, {
      data: reason ? { reason } : undefined,
    });
    return response.data;
  },

  // Favorite/Unfavorite property
  toggleFavorite: async (id: string): Promise<FavoriteResponse> => {
    const response = await api.post(`/properties/${id}/favorite`);
    return response.data.data;
  },

  // Inquiries & Tours
  createInquiry: async (propertyId: string, message: string) => {
    const response = await api.post(`/properties/${propertyId}/inquiry`, { message });
    return response.data.data;
  },

  scheduleTour: async (propertyId: string, preferredDate: string, notes?: string) => {
    const response = await api.post(`/properties/${propertyId}/tour`, { preferredDate, notes });
    return response.data.data;
  },

  // Comparison
  compareProperties: async (ids: string[]): Promise<PropertyResponse[]> => {
    const response = await api.get('/properties/compare', { params: { ids } });
    return response.data.data;
  },

  // Get featured properties
  getFeaturedProperties: async (limit: number = 6): Promise<PropertyResponse[]> => {
    const response = await api.get('/properties/featured', { params: { limit } });
    return response.data.data.properties;
  },

  // Get properties by city
  getPropertiesByCity: async (city: string): Promise<PropertyResponse[]> => {
    const response = await api.get(`/properties/city/${city}`);
    return response.data.data.properties;
  },

  // Get user's properties
  getUserProperties: async (page: number = 1, limit: number = 10): Promise<PropertySearchResult> => {
    const response = await api.get('/properties/user/my-properties', {
      params: { page, limit }
    });
    return response.data.data;
  },

  // Get user's favorite properties
  getUserFavoriteProperties: async (
    page: number = 1,
    limit: number = 20,
    listingType?: 'rent' | 'sale'
  ): Promise<PropertySearchResult> => {
    const response = await api.get('/properties/user/favorites', {
      params: { page, limit, listingType }
    });
    // Backend returns { data: properties[], meta: { total, page, totalPages, ... } }
    const properties = response.data.data || [];
    const meta = response.data.meta || {};
    return {
      properties,
      total: meta.total || 0,
      page: meta.page || 1,
      totalPages: meta.totalPages || 1,
      hasNext: meta.hasNext || false,
      hasPrev: meta.hasPrev || false,
    };
  },

  // Get available filters
  getAvailableFilters: async (): Promise<AvailableFilters> => {
    const response = await api.get('/properties/filters');
    return response.data.data;
  },

  // Get city stats
  getCityStats: async (cities?: string[]): Promise<{ city: string; count: number }[]> => {
    const params = cities && cities.length > 0 ? { cities: cities.join(',') } : undefined;
    const response = await api.get('/properties/city-stats', { params });
    return response.data.data;
  },
};

// --- Utility & Wrapper Functions ---

const DEFAULT_NEW_DAYS = 30;

export function isNewListing(p: { createdAt: string }, days = DEFAULT_NEW_DAYS) {
  const ageDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return ageDays <= days;
}

// Get single property by ID
export async function getPropertyById(id: string): Promise<PropertyResponse | null> {
  return await propertiesApi.getProperty(id);
}

// Query properties with filters
export async function queryProperties(opts: PropertyFilters = {}) {
  return await propertiesApi.getProperties(opts);
}

// Featured listings
export async function getFeaturedProperties(limit?: number): Promise<PropertyResponse[]> {
  return await propertiesApi.getFeaturedProperties(limit);
}

// Get available filters
export async function getAvailableFilters() {
  return await propertiesApi.getAvailableFilters();
}

