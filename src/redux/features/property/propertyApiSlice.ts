/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from '@/redux/api/apiSlice';
import {
  CreatePropertyData,
  PropertyFilters,
  PropertyResponse,
  PropertySearchResult,
  UpdatePropertyData,
} from '@/types/property.types';

export interface AvailableFiltersResponse {
  cities: string[];
  states: string[];
  propertyTypes: string[];
  amenities: string[];
  priceRange: {
    rent: { min: number; max: number };
    sale: { min: number; max: number };
  };
  bedroomRange: { min: number; max: number };
  bathroomRange: { min: number; max: number };
}

interface ApiPagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiListResponse<T> {
  statusCode: number;
  success: boolean;
  message: string | null;
  data: T[];
  meta: ApiPagination;
}

interface ApiSingleResponse<T> {
  statusCode: number;
  success: boolean;
  message: string | null;
  data: T;
  meta?: ApiPagination;
}

interface ApiMessageResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: any;
}

interface CreatePropertyArgs {
  data: CreatePropertyData;
  images?: File[];
}

interface UpdatePropertyArgs {
  id: string;
  data: UpdatePropertyData;
}

const transformListResponse = (
  response: ApiListResponse<PropertyResponse>
): PropertySearchResult => {
  return {
    properties: response.data,
    total: response.meta.total,
    page: response.meta.page,
    totalPages: response.meta.totalPages,
    hasNext: response.meta.hasNext,
    hasPrev: response.meta.hasPrev,
  };
};

export const propertyApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProperties: builder.query<PropertySearchResult, PropertyFilters | void>({
      query: (filters) => ({
        url: '/properties',
        params: filters || {},
      }),
      transformResponse: transformListResponse,
      providesTags: (result) =>
        result && result.properties
          ? [
            ...result.properties.map(({ id }) => ({
              type: 'Property' as const,
              id,
            })),
            { type: 'Property', id: 'LIST' },
          ]
          : [{ type: 'Property', id: 'LIST' }],
    }),

    getFeaturedProperties: builder.query<
      PropertySearchResult,
      { limit?: number } | void
    >({
      query: (filters) => ({
        url: '/properties/featured',
        params: filters || {},
      }),
      transformResponse: transformListResponse,
      providesTags: (result) =>
        result && result.properties
          ? [
            ...result.properties.map(({ id }) => ({
              type: 'Property' as const,
              id,
            })),
            { type: 'Property', id: 'FEATURED_LIST' },
          ]
          : [{ type: 'Property', id: 'FEATURED_LIST' }],
    }),

    getAvailableFilters: builder.query<AvailableFiltersResponse, void>({
      query: () => '/properties/filters',
      transformResponse(
        response: ApiSingleResponse<AvailableFiltersResponse>
      ): AvailableFiltersResponse {
        return response.data;
      },
      providesTags: [{ type: 'Property', id: 'FILTERS' }],
    }),

    getPropertiesByCity: builder.query<
      PropertySearchResult,
      { city: string; filters?: Omit<PropertyFilters, 'city'> }
    >({
      query: ({ city, filters }) => ({
        url: `/properties/city/${city}`,
        params: filters || {},
      }),
      transformResponse: transformListResponse,
      providesTags: (result) =>
        result && result.properties
          ? [
            ...result.properties.map(({ id }) => ({
              type: 'Property' as const,
              id,
            })),
            { type: 'Property', id: 'LIST' },
          ]
          : [{ type: 'Property', id: 'LIST' }],
    }),

    getPropertyById: builder.query<PropertyResponse, string>({
      query: (id) => `/properties/${id}`,
      transformResponse(
        response: ApiSingleResponse<PropertyResponse>
      ): PropertyResponse {
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'Property', id }],
    }),

    getMyProperties: builder.query<PropertySearchResult, PropertyFilters | void>({
      query: (filters) => ({
        url: '/properties/user/my-properties',
        params: filters || {},
      }),
      transformResponse: transformListResponse,
      providesTags: (result) =>
        result && result.properties
          ? [
            ...result.properties.map(({ id }) => ({
              type: 'Property' as const,
              id,
            })),
            { type: 'Property', id: 'USER_PROPERTIES' },
          ]
          : [{ type: 'Property', id: 'USER_PROPERTIES' }],
    }),

    createProperty: builder.mutation<PropertyResponse, CreatePropertyArgs>({
      query: ({ data, images }) => {
        const formData = new FormData();
        (Object.entries(data) as [string, any][]).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof Date) {
              formData.append(key, value.toISOString());
            } else if (Array.isArray(value) || typeof value === 'object') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        if (images && images.length > 0) {
          images.forEach((image) => {
            formData.append('images', image);
          });
        }

        return {
          url: '/properties',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse(
        response: ApiSingleResponse<PropertyResponse>
      ): PropertyResponse {
        return response.data;
      },
      invalidatesTags: [
        { type: 'Property', id: 'LIST' },
        { type: 'Property', id: 'USER_PROPERTIES' },
      ],
    }),

    updateProperty: builder.mutation<PropertyResponse, UpdatePropertyArgs>({
      query: ({ id, data }) => ({
        url: `/properties/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse(
        response: ApiSingleResponse<PropertyResponse>
      ): PropertyResponse {
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Property', id },
        { type: 'Property', id: 'LIST' },
        { type: 'Property', id: 'USER_PROPERTIES' },
        { type: 'Property', id: 'FEATURED_LIST' },
      ],
    }),

    deleteProperty: builder.mutation<ApiMessageResponse, string>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Property', id },
        { type: 'Property', id: 'LIST' },
        { type: 'Property', id: 'USER_PROPERTIES' },
        { type: 'Property', id: 'FEATURED_LIST' },
      ],
    }),

    getUserFavoriteProperties: builder.query<
      PropertySearchResult,
      { page?: number; limit?: number; type?: 'rent' | 'sale' } | void
    >({
      query: (params) => ({
        url: '/properties/user/favorites',
        params: params || {},
      }),
      transformResponse: transformListResponse,
      providesTags: (result) =>
        result && result.properties
          ? [
            ...result.properties.map(({ id }) => ({
              type: 'Property' as const,
              id,
            })),
            { type: 'Property', id: 'USER_FAVORITES' },
          ]
          : [{ type: 'Property', id: 'USER_FAVORITES' }],
    }),

    toggleFavorite: builder.mutation<ApiSingleResponse<{ favorited: boolean }>, string>({
      query: (id) => ({
        url: `/properties/${id}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Property', id },
        { type: 'Property', id: 'LIST' },
        { type: 'Property', id: 'USER_FAVORITES' },
      ],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetFeaturedPropertiesQuery,
  useGetAvailableFiltersQuery,
  useGetPropertiesByCityQuery,
  useGetPropertyByIdQuery,
  useGetMyPropertiesQuery,
  useGetUserFavoritePropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useToggleFavoriteMutation,
} = propertyApiSlice;