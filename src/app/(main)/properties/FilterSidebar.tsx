
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AvailableFiltersResponse } from "@/redux/features/property/propertyApiSlice";
import { PropertyFilters } from "@/types/property.types";
import { useEffect, useState } from "react";

interface FilterSidebarProps {
  filters: PropertyFilters;
  filterOptions?: AvailableFiltersResponse;
  isLoading: boolean;
  onFilterChange: (params: Record<string, string | number | undefined>) => void;
  onClearAll: () => void;
}

export function FilterSidebar({
  filters,
  filterOptions,
  isLoading,
  onFilterChange,
  onClearAll,
}: FilterSidebarProps) {
  const isRent = filters.listingType === "rent";
  const defaultMin = isRent ? 0 : 0;
  const defaultMax = isRent ? 50000 : 10000000;

  const initialPrice = [
    filters.minPrice || filters.minRent || defaultMin,
    filters.maxPrice || filters.maxRent || defaultMax
  ];

  const [localPrice, setLocalPrice] = useState(initialPrice);

  useEffect(() => {
    setLocalPrice([
      filters.minPrice || filters.minRent || defaultMin,
      filters.maxPrice || filters.maxRent || defaultMax
    ]);
  }, [filters.listingType, filters.minPrice, filters.maxPrice, filters.minRent, filters.maxRent, defaultMin, defaultMax]);

  const handlePriceCommit = (value: number[]) => {
    onFilterChange({
      min: value[0] === defaultMin ? undefined : value[0],
      max: value[1] === defaultMax ? undefined : value[1],
    });
  };

  const amenities = filterOptions?.amenities || [];
  const cities = filterOptions?.cities || [];
  const propertyTypes = filterOptions?.propertyTypes || [];

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 text-sm font-medium">Listing Type</Label>
        <div className="flex gap-1 rounded-md bg-muted p-1 mt-2">
          {["all", "rent", "sale"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFilterChange({ lt: type === "all" ? undefined : type })}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${(filters.listingType || "all") === type
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow"
                : "text-muted-foreground hover:text-cyan-600 hover:bg-cyan-50"
                }`}
            >
              {type === "all" ? "All" : type === "rent" ? "Rent" : "Sale"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="city" className="mb-3 text-sm font-medium">City</Label>
        <Select
          value={filters.city || "all"}
          onValueChange={(value) => onFilterChange({ city: value === "all" ? undefined : value })}
          disabled={isLoading || cities.length === 0}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-3 text-sm font-medium">Beds (Minimum)</Label>
        <div className="flex gap-1 rounded-md bg-muted p-1 mt-2">
          {[0, 1, 2, 3, 4].map((beds) => (
            <button
              key={beds}
              type="button"
              onClick={() => onFilterChange({ beds: beds === 0 ? undefined : beds })}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${(filters.bedrooms || 0) === beds
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow"
                : "text-muted-foreground hover:text-cyan-600 hover:bg-cyan-50"
                }`}
            >
              {beds === 0 ? "Any" : `${beds}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="text-xs text-muted-foreground">
            ${localPrice[0]} — ${localPrice[1]}
          </div>
        </div>
        <div className="px-1">
          <Slider
            min={defaultMin}
            max={defaultMax}
            step={isRent ? 100 : 50000}
            value={localPrice}
            onValueChange={setLocalPrice}
            onValueCommit={handlePriceCommit}
          />
        </div>
      </div>

      {propertyTypes.length > 0 && (
        <div>
          <Label className="mb-3 text-sm font-medium">Property Type</Label>
          <div className="space-y-3 mt-2">
            {propertyTypes.map((pt) => (
              <label key={pt} className="flex items-center gap-3 text-sm cursor-pointer">
                <Checkbox
                  checked={filters.propertyType === pt}
                  onCheckedChange={(checked) => onFilterChange({ pt: checked ? pt : undefined })}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500 data-[state=checked]:border-transparent"
                />
                <span className="capitalize">{pt}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent hover:text-blue-700 hover:bg-cyan-50 transition-all"
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}