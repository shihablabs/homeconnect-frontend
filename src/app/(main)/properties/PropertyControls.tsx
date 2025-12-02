"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { PropertyFilters } from "@/types/property.types";
import { Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface PropertyControlsProps {
  filters: PropertyFilters;
  onFilterChange: (params: Record<string, string | number | undefined>) => void;
  activeFilterCount: number;
  onMobileFilterOpen: () => void;
  isLoading: boolean;
  totalResults: number;
}

export function PropertyControls({
  filters,
  onFilterChange,
  activeFilterCount,
  onMobileFilterOpen,
  isLoading,
  totalResults,
}: PropertyControlsProps) {
  console.log(totalResults);
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    onFilterChange({ q: debouncedSearch.trim() || undefined });
  }, [debouncedSearch, onFilterChange]);

  useEffect(() => {
    if (filters.search !== searchInput) {
      setSearchInput(filters.search || "");
    }
  }, [filters.search, searchInput]);

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    // If "Most Popular" is selected, clear sort to use backend default (score)
    if (value === "score:desc") {
      onFilterChange({ sortBy: undefined, sortOrder: undefined });
    } else {
      onFilterChange({ 
        sortBy: sortBy === "createdAt" && sortOrder === "desc" ? undefined : sortBy,
        sortOrder: sortBy === "createdAt" && sortOrder === "desc" ? undefined : sortOrder
      });
    }
  };

  // Default to score if no sort is specified
  const defaultSortBy = filters.sortBy || "score";
  const defaultSortOrder = filters.sortOrder || "desc";
  const sortValue = `${defaultSortBy}:${defaultSortOrder}`;

  return (
    <div className="rounded-xl border bg-background p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form
          className="flex w-full gap-3 md:max-w-md relative"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search city, neighborhood, or keywords..."
              className="pl-10 pr-4 h-11"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-3">
          <Select value={sortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] h-11">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score:desc">Most Popular (Highest Votes)</SelectItem>
              <SelectItem value="createdAt:desc">Newest First</SelectItem>
              <SelectItem value="rentPrice:asc">Price: Low to High (Rent)</SelectItem>
              <SelectItem value="rentPrice:desc">Price: High to Low (Rent)</SelectItem>
              <SelectItem value="salePrice:asc">Price: Low to High (Sale)</SelectItem>
              <SelectItem value="salePrice:desc">Price: High to Low (Sale)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="md:hidden h-11"
            onClick={onMobileFilterOpen}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}