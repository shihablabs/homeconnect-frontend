

"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyFilters } from '@/types/property.types';
import { Filter, Search, X } from 'lucide-react';

interface PropertiesHeaderProps {
  filters: PropertyFilters;
  onFilterChange: (key: keyof PropertyFilters, value: any) => void;
  onToggleSidebar: () => void;
  totalResults: number; 
}

export function PropertiesHeader({
  filters,
  onFilterChange,
  onToggleSidebar,
  totalResults,
}: PropertiesHeaderProps) {

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split(':');
    onFilterChange('sortBy', sortBy);
    onFilterChange('sortOrder', sortOrder as 'asc' | 'desc');
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by title, address, or city..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-10 h-12"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="lg:hidden w-full flex-1"
            onClick={onToggleSidebar}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Select
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="h-12 w-full md:w-[200px] flex-1">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Newest First</SelectItem>
              <SelectItem value="rentPrice:asc">Price: Low to High (Rent)</SelectItem>
              <SelectItem value="rentPrice:desc">Price: High to Low (Rent)</SelectItem>
              <SelectItem value="salePrice:asc">Price: Low to High (Sale)</SelectItem>
              <SelectItem value="salePrice:desc">Price: High to Low (Sale)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}