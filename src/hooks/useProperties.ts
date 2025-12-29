


import { propertiesApi, PropertyFilters } from '@/lib/api/properties-api';
import { CreatePropertyData, UpdatePropertyData } from '@/types/property.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


export const useProperties = (filters: PropertyFilters = {}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesApi.getProperties(filters),
    staleTime: 5 * 60 * 1000, 
  });
};

export const useFeaturedProperties = (limit?: number) => {
  return useQuery({
    queryKey: ['properties', 'featured', limit],
    queryFn: () => propertiesApi.getFeaturedProperties(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertiesApi.getProperty(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePropertiesByCity = (city: string) => {
  return useQuery({
    queryKey: ['properties', 'city', city],
    queryFn: () => propertiesApi.getPropertiesByCity(city),
    enabled: !!city,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePropertyFilters = () => {
  return useQuery({
    queryKey: ['properties', 'filters'],
    queryFn: () => propertiesApi.getAvailableFilters(),
    staleTime: 30 * 60 * 1000, 
  });
};

export const useUserProperties = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['properties', 'user', page, limit],
    queryFn: () => propertiesApi.getUserProperties(page, limit),
    staleTime: 2 * 60 * 1000, 
  });
};


export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyData, images }: {
      propertyData: CreatePropertyData;
      images?: File[]
    }) => propertiesApi.createProperty(propertyData, images),
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['properties', 'featured'] });
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'Failed to create property');
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyData }) =>
      propertiesApi.updateProperty(id, data),
    onSuccess: (data, variables) => {
      
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['properties', 'user'] });
    },
    onError: (error: any) => {
      console.error('Error updating property:', error);
      throw new Error(error.response?.data?.message || 'Failed to update property');
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertiesApi.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', 'user'] });
    },
    onError: (error: any) => {
      console.error('Error deleting property:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete property');
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertiesApi.toggleFavorite(id),
    onSuccess: (data, propertyId) => {
      
      queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: any) => {
      console.error('Error liking property:', error);
      throw new Error(error.response?.data?.message || 'Failed to like property');
    },
  });
};


export const usePropertyActions = () => {
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const deleteMutation = useDeleteProperty();
  const likeMutation = useToggleFavorite();

  return {
    createProperty: createMutation.mutateAsync,
    updateProperty: updateMutation.mutateAsync,
    deleteProperty: deleteMutation.mutateAsync,
    toggleFavorite: likeMutation.mutateAsync,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || likeMutation.isPending,
    error: createMutation.error || updateMutation.error || deleteMutation.error || likeMutation.error,
  };
};


export const usePropertySearch = (filters: PropertyFilters, delay: number = 500) => {
  return useQuery({
    queryKey: ['properties', 'search', filters],
    queryFn: () => propertiesApi.getProperties(filters),
    staleTime: 2 * 60 * 1000,
    enabled: Object.keys(filters).length > 0,
  });
};