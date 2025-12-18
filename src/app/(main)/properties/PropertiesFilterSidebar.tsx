/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useGetAvailableFiltersQuery } from '@/redux/features/property/propertyApiSlice';
import { PropertyFilters, propertyTypes } from '@/types/property.types';
import { X } from 'lucide-react';

interface PropertiesFilterSidebarProps {
  filters: PropertyFilters;
  onFilterChange: (key: keyof PropertyFilters, value: any) => void;
  onResetFilters: () => void;
  className?: string;
}

export function PropertiesFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  className,
}: PropertiesFilterSidebarProps) {

  const { data: filterOptions, isLoading } = useGetAvailableFiltersQuery();

  const handlePriceChange = (value: number[]) => {
    if (filters.listingType === 'rent') {
      onFilterChange('minRent', value[0]);
      onFilterChange('maxRent', value[1]);
    } else {
      onFilterChange('minPrice', value[0]);
      onFilterChange('maxPrice', value[1]);
    }
  };

  const getPriceRange = () => {
    if (filters.listingType === 'rent') {
      return [filters.minRent ?? 0, filters.maxRent ?? 50000];
    }
    return [filters.minPrice ?? 0, filters.maxPrice ?? 10000000];
  };

  const getMaxPrice = () => {
    return filters.listingType === 'rent' ? 50000 : 10000000;
  };

  return (
    <aside className={`sticky top-28 h-fit ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onResetFilters} className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent hover:text-blue-700">
          <X className="w-4 h-4 mr-1 text-blue-600" />
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        {/* Listing Type */}
        <div>
          <Label className="font-semibold">Listing Type</Label>
          <div className="flex gap-2 mt-2">
            <Badge
              variant={filters.listingType === 'rent' ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2"
              onClick={() => onFilterChange('listingType', 'rent')}
            >
              For Rent
            </Badge>
            <Badge
              variant={filters.listingType === 'sale' ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2"
              onClick={() => onFilterChange('listingType', 'sale')}
            >
              For Sale
            </Badge>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <Label htmlFor="propertyType" className="font-semibold">Property Type</Label>
          <Select
            value={filters.propertyType || 'all'}
            onValueChange={(value) => onFilterChange('propertyType', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="propertyType" className="mt-2">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {propertyTypes.map(type => (
                <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <Label className="font-semibold">
            Price Range (${getPriceRange()[0]} - ${getPriceRange()[1]})
          </Label>
          <Slider
            value={getPriceRange()}
            max={getMaxPrice()}
            step={filters.listingType === 'rent' ? 100 : 50000}
            onValueChange={handlePriceChange}
            className="mt-4"
          />
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bedrooms" className="font-semibold">Bedrooms</Label>
            <Select
              value={filters.bedrooms?.toString() || 'all'}
              onValueChange={(value) => onFilterChange('bedrooms', value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger id="bedrooms" className="mt-2">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {[1, 2, 3, 4, 5].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num} Bed{num > 1 ? 's' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bathrooms" className="font-semibold">Bathrooms</Label>
            <Select
              value={filters.bathrooms?.toString() || 'all'}
              onValueChange={(value) => onFilterChange('bathrooms', value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger id="bathrooms" className="mt-2">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {[1, 2, 3, 4].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num} Bath{num > 1 ? 's' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <Label className="font-semibold">Amenities</Label>
          <div className="mt-2 space-y-2 h-40 overflow-y-auto">
            {isLoading ? <p>Loading amenities...</p> :
              (filterOptions?.amenities || []).map(amenity => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={filters.amenities?.includes(amenity)}
                    onCheckedChange={(checked) => {
                      const current = filters.amenities || [];
                      const updated = checked
                        ? [...current, amenity]
                        : current.filter(item => item !== amenity);
                      onFilterChange('amenities', updated);
                    }}
                  />
                  <Label htmlFor={amenity} className="font-normal capitalize">{amenity}</Label>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </aside>
  );
}