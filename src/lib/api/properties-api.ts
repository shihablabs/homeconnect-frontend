

import { api } from './api';



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
  ownerId?: string; 
}

import { AvailableFilters, CreatePropertyData, PropertyResponse, PropertySearchResult, UpdatePropertyData } from '@/types/property.types';
export type { PropertyResponse };

export interface FavoriteResponse {
  favorited: boolean;
}



export const propertiesApi = {
  getAllProperties: async (): Promise<PropertyResponse[]> => {
    const response = await api.get('/properties');
    console.log(response);
    return response.data.data;
  },

  
  getProperties: async (filters: PropertyFilters = {}): Promise<PropertySearchResult> => {
    
    if (filters.q) {
      filters.search = filters.q;
      delete filters.q;
    }
    

    const response = await api.get('/properties', { params: filters });
    return {
      properties: response.data.data,
      total: response.data.meta?.total || 0,
      page: response.data.meta?.page || 1,
      totalPages: response.data.meta?.totalPages || 1,
      hasNext: response.data.meta?.hasNext || false,
      hasPrev: response.data.meta?.hasPrev || false,
    };
  },

  
  getProperty: async (id: string): Promise<PropertyResponse> => {
    const response = await api.get(`/properties/${id}`);
    return response.data.data;
  },

  
  createProperty: async (data: CreatePropertyData, images?: File[]): Promise<PropertyResponse> => {
    const formData = new FormData();

    
    const { images: _, ...dataWithoutImages } = data;

    
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

  
  updateProperty: async (id: string, data: UpdatePropertyData): Promise<PropertyResponse> => {
    const response = await api.patch(`/properties/${id}`, data);
    return response.data.data.property;
  },

  
  deleteProperty: async (id: string, reason?: string): Promise<{ message: string }> => {
    const response = await api.delete(`/properties/${id}`, {
      data: reason ? { reason } : undefined,
    });
    return response.data;
  },

  
  toggleFavorite: async (id: string): Promise<FavoriteResponse> => {
    const response = await api.post(`/properties/${id}/favorite`);
    return response.data.data;
  },

  
  createInquiry: async (propertyId: string, message: string) => {
    const response = await api.post(`/properties/${propertyId}/inquiry`, { message });
    return response.data.data;
  },

  scheduleTour: async (propertyId: string, preferredDate: string, notes?: string) => {
    const response = await api.post(`/properties/${propertyId}/tour`, { preferredDate, notes });
    return response.data.data;
  },

  
  compareProperties: async (ids: string[]): Promise<PropertyResponse[]> => {
    const response = await api.get('/properties/compare', { params: { ids } });
    return response.data.data;
  },

  
  getFeaturedProperties: async (limit: number = 6): Promise<PropertyResponse[]> => {
    const response = await api.get('/properties/featured', { params: { limit } });
    return response.data.data.properties;
  },

  
  getPropertiesByCity: async (city: string): Promise<PropertyResponse[]> => {
    const response = await api.get(`/properties/city/${city}`);
    return response.data.data.properties;
  },

  
  getUserProperties: async (page: number = 1, limit: number = 10): Promise<PropertySearchResult> => {
    const response = await api.get('/properties/user/my-properties', {
      params: { page, limit }
    });
    return {
      properties: response.data.data,
      total: response.data.meta?.total || 0,
      page: response.data.meta?.page || 1,
      totalPages: response.data.meta?.totalPages || 1,
      hasNext: response.data.meta?.hasNext || false,
      hasPrev: response.data.meta?.hasPrev || false,
    };
  },

  
  getUserFavoriteProperties: async (
    page: number = 1,
    limit: number = 20,
    listingType?: 'rent' | 'sale'
  ): Promise<PropertySearchResult> => {
    const response = await api.get('/properties/user/favorites', {
      params: { page, limit, listingType }
    });
    
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

  
  getAvailableFilters: async (): Promise<AvailableFilters> => {
    const response = await api.get('/properties/filters');
    return response.data.data;
  },

  
  getCityStats: async (cities?: string[]): Promise<{ city: string; count: number }[]> => {
    const params = cities && cities.length > 0 ? { cities: cities.join(',') } : undefined;
    const response = await api.get('/properties/city-stats', { params });
    return response.data.data;
  },
};



const DEFAULT_NEW_DAYS = 30;

export function isNewListing(p: { createdAt: string }, days = DEFAULT_NEW_DAYS) {
  const ageDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return ageDays <= days;
}


export async function getPropertyById(id: string): Promise<PropertyResponse | null> {
  return await propertiesApi.getProperty(id);
}


export async function queryProperties(opts: PropertyFilters = {}) {
  return await propertiesApi.getProperties(opts);
}


export async function getFeaturedProperties(limit?: number): Promise<PropertyResponse[]> {
  return await propertiesApi.getFeaturedProperties(limit);
}


export async function getAvailableFilters() {
  return await propertiesApi.getAvailableFilters();
}

