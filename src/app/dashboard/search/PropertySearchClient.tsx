'use client';

import { PropertyCard } from '@/components/cards/PropertyCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { propertiesApi, type PropertyResponse as ApiPropertyResponse, type AvailableFilters, type PropertyFilters, type PropertySearchResult } from '@/lib/api/properties-api';
import type { AreaUnit, OwnershipType, PetPolicy, PropertyCondition, PropertyResponse, PropertyStatus, PropertyType, SmokingPolicy } from '@/types/property.types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Adapter function to convert API response to PropertyCard expected type
const adaptProperty = (apiProperty: ApiPropertyResponse): PropertyResponse => {
  // Calculate if property is new (created within last 7 days)
  const createdAt = new Date(apiProperty.createdAt);
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const isNew = daysSinceCreation <= 7;

  // Create base property object
  const baseProperty = {
    id: apiProperty.id,
    slug: apiProperty.id, // Placeholder slug
    title: apiProperty.title,
    description: apiProperty.description,
    listingType: apiProperty.listingType,
    propertyType: apiProperty.propertyType as PropertyType,
    address: apiProperty.address,
    city: apiProperty.city,
    neighborhood: apiProperty.neighborhood,
    state: apiProperty.state,
    country: apiProperty.country,
    latitude: apiProperty.latitude,
    longitude: apiProperty.longitude,
    zipCode: apiProperty.zipCode,
    bedrooms: apiProperty.bedrooms,
    bathrooms: apiProperty.bathrooms,
    areaSize: apiProperty.areaSize,
    areaUnit: apiProperty.areaUnit as AreaUnit,
    yearBuilt: apiProperty.yearBuilt,
    lotSize: apiProperty.lotSize,
    lotUnit: apiProperty.lotUnit as AreaUnit,
    amenities: apiProperty.amenities,
    images: apiProperty.images,
    videos: apiProperty.videos,
    floorPlans: apiProperty.floorPlans,
    status: apiProperty.status as PropertyStatus,
    featured: apiProperty.featured,
    isVerified: apiProperty.isVerified,
    tags: apiProperty.tags,
    owner: apiProperty.owner,
    agent: apiProperty.agent,
    views: apiProperty.views,
    savedBy: apiProperty.savedBy || [],
    createdAt: apiProperty.createdAt,
    updatedAt: apiProperty.updatedAt,
    isNew,
    currency: apiProperty.currency || 'BDT',
  };

  // Add rental-specific or sale-specific fields
  if (apiProperty.listingType === 'rent') {
    return {
      ...baseProperty,
      listingType: 'rent',
      rentPrice: apiProperty.rentPrice || 0,
      securityDeposit: apiProperty.securityDeposit,
      minimumStay: 1,
      availableFrom: new Date().toISOString(),
      isFurnished: false,
      utilitiesIncluded: [],
      petPolicy: 'case-by-case' as PetPolicy,
      smokingPolicy: 'not-allowed' as SmokingPolicy,
      isAvailable: apiProperty.isAvailable ?? true,
    } as PropertyResponse;
  } else {
    return {
      ...baseProperty,
      listingType: 'sale',
      salePrice: apiProperty.salePrice || 0,
      priceNegotiable: false,
      mortgageAvailable: false,
      propertyCondition: 'good' as PropertyCondition,
      ownershipType: 'freehold' as OwnershipType,
      timeOnMarket: 0,
    } as PropertyResponse;
  }
};

export function PropertySearchClient() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters | null>(null);
  const [searchResult, setSearchResult] = useState<PropertySearchResult | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>({
    listingType: 'rent',
    page: 1,
    limit: 12,
    // Default to score sorting (most popular first)
    sortBy: undefined, // Backend will default to score
    sortOrder: undefined,
  });

  const fetchAvailableFilters = async () => {
    try {
      const data = await propertiesApi.getAvailableFilters();
      setAvailableFilters(data);
    } catch {
      console.error('Failed to fetch filters');
    }
  };

  const searchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const result = await propertiesApi.getProperties(filters);
      // Adapt API properties to PropertyCard expected format
      const adaptedProperties = (result?.properties || []).map(adaptProperty);
      setProperties(adaptedProperties);
      setSearchResult(result);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to search properties');
      setProperties([]); // Ensure properties is always an array on error
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAvailableFilters();
    searchProperties();
  }, [searchProperties]);

  const handleFilterChange = (key: keyof PropertyFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const clearFilters = () => {
    setFilters({
      listingType: 'rent',
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.city ||
      filters.propertyType ||
      filters.minRent ||
      filters.maxRent ||
      filters.bedrooms ||
      filters.bathrooms ||
      filters.amenities?.length
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Find Properties</h1>
          <p className="text-muted-foreground mt-1">
            Search and filter properties to find your perfect rental
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location, property name, or description..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters() && (
                  <Badge variant="default" className="ml-1">
                    {Object.keys(filters).filter((k) => {
                      const key = k as keyof PropertyFilters;
                      return filters[key] !== undefined && filters[key] !== null && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder' && key !== 'listingType';
                    }).length}
                  </Badge>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filters</CardTitle>
                <div className="flex gap-2">
                  {hasActiveFilters() && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Listing Type</Label>
                  <Select
                    value={filters.listingType || 'rent'}
                    onValueChange={(value) => handleFilterChange('listingType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Select
                    value={filters.city || ''}
                    onValueChange={(value) => handleFilterChange('city', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Cities</SelectItem>
                      {(availableFilters?.cities || []).map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select
                    value={filters.propertyType || ''}
                    onValueChange={(value) => handleFilterChange('propertyType', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {(availableFilters?.propertyTypes || []).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Select
                    value={filters.bedrooms?.toString() || ''}
                    onValueChange={(value) => handleFilterChange('bedrooms', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      {[1, 2, 3, 4, 5, 6].map((beds) => (
                        <SelectItem key={beds} value={beds.toString()}>
                          {beds}+ Bedrooms
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filters.listingType === 'rent' && (
                  <>
                    <div className="space-y-2">
                      <Label>Min Rent (৳)</Label>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minRent || ''}
                        onChange={(e) => handleFilterChange('minRent', e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Rent (৳)</Label>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxRent || ''}
                        onChange={(e) => handleFilterChange('maxRent', e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select
                    value={filters.sortBy || 'createdAt'}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Newest First</SelectItem>
                      <SelectItem value="price">Price: Low to High</SelectItem>
                      <SelectItem value="-price">Price: High to Low</SelectItem>
                      <SelectItem value="areaSize">Size: Largest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {loading ? (
                'Searching...'
              ) : searchResult ? (
                `${searchResult.total} property${searchResult.total !== 1 ? 'ies' : ''} found`
              ) : (
                'No results'
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-48 bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !properties || properties.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters() && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(properties || []).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {searchResult && searchResult.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={!searchResult.hasPrev || loading}
                    onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {searchResult.page} of {searchResult.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    disabled={!searchResult.hasNext || loading}
                    onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

