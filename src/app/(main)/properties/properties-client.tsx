"use client";

import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useGetAvailableFiltersQuery,
  useGetPropertiesQuery,
} from "@/redux/features/property/propertyApiSlice";
import { PropertyFilters, PropertyType } from "@/types/property.types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FilterSidebar } from "./FilterSidebar";
import { PropertyGrid } from "./PropertiesGrid";
import { PropertyControls } from "./PropertyControls";

export default function PropertiesPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const filters = useMemo((): PropertyFilters => {
    const q = sp.get("q") || undefined;
    const listingType = (sp.get("lt") as "rent" | "sale") || undefined;
    const city = sp.get("city") || undefined;
    const propertyType = (sp.get("pt") as PropertyType) || undefined;
    const bedrooms = sp.get("beds") ? Number(sp.get("beds")) : undefined;
    const minPrice = sp.get("min") ? Number(sp.get("min")) : undefined;
    const maxPrice = sp.get("max") ? Number(sp.get("max")) : undefined;
    
    
    
    const sortBy = sp.get("sortBy") || (sp.get("sort")?.split(":")[0]) || undefined;
    const sortOrder =
      (sp.get("sortOrder") as "asc" | "desc") || 
      (sp.get("sort")?.split(":")[1] as "asc" | "desc") || 
      "desc";
    const page = Number(sp.get("page") || "1");
    const limit = Number(sp.get("limit") || "12");

    const activeFilters: PropertyFilters = {
      search: q,
      listingType,
      city,
      propertyType,
      bedrooms,
      sortBy: sortBy === "score" ? undefined : sortBy, 
      sortOrder: sortBy === "score" ? undefined : sortOrder,
      page,
      limit,
    };

    if (listingType === "rent") {
      activeFilters.minRent = minPrice;
      activeFilters.maxRent = maxPrice;
    } else {
      activeFilters.minPrice = minPrice;
      activeFilters.maxPrice = maxPrice;
    }

    return activeFilters;
  }, [sp]);

  const {
    data: searchResult,
    isLoading: isLoadingProperties,
    isError,
    error,
  } = useGetPropertiesQuery(filters);

  const { data: filterOptions, isLoading: isLoadingFilters } =
    useGetAvailableFiltersQuery();

  const updateURL = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(sp.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === "" ||
          value === "all" ||
          value === 0
        ) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      if (Object.keys(newParams).some((k) => k !== "page")) {
        next.delete("page");
      }

      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, sp]
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.listingType) count++;
    if (filters.city) count++;
    if (filters.propertyType) count++;
    if (filters.bedrooms) count++;
    if (
      filters.minPrice ||
      filters.maxPrice ||
      filters.minRent ||
      filters.maxRent
    )
      count++;
    return count;
  }, [filters]);

  return (
    <div className="grid gap-6 md:grid-cols-12 container mx-auto px-4 pb-10 min-h-screen">
      <aside className="hidden md:block md:col-span-4 lg:col-span-3">
        <div className="rounded-xl border bg-background p-6 sticky top-24">
          <div className="mb-6 text-xl font-semibold">Filters</div>
          <FilterSidebar
            filters={filters}
            filterOptions={filterOptions}
            isLoading={isLoadingFilters}
            onFilterChange={updateURL}
            onClearAll={clearAll}
          />
        </div>
      </aside>

      <section className="md:col-span-8 lg:col-span-9">
        <PropertyControls
          filters={filters}
          onFilterChange={updateURL}
          activeFilterCount={activeFilterCount}
          onMobileFilterOpen={() => setIsFilterSheetOpen(true)}
          isLoading={isLoadingProperties}
          totalResults={searchResult?.total || 0}
        />

        <Separator className="my-6" />

        <PropertyGrid
          searchResult={searchResult}
          isLoading={isLoadingProperties}
          isError={isError}
          error={error}
          onPageChange={(newPage) => updateURL({ page: newPage })}
        />
      </section>

      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent
          side="right"
          className="w-[90vw] sm:w-[420px] overflow-y-auto"
        >
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 pb-8">
            <FilterSidebar
              filters={filters}
              filterOptions={filterOptions}
              isLoading={isLoadingFilters}
              onFilterChange={updateURL}
              onClearAll={clearAll}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
