"use client";

import { PropertyCard } from "@/components/cards/PropertyCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProperties } from "@/hooks/useProperties";
import type { PropertyFilters } from "@/lib/api/properties-api";
import type { PropertyResponse } from "@/types/property.types";
import { isRentalResponse } from "@/types/property.types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SortKey = "newest" | "price-asc" | "price-desc";
type ListingFilter = "all" | "rent" | "sale";

interface NewListingsGridProps {
  title?: string;
  viewAllHref: string;
  initialType?: ListingFilter;
  initialLimit?: number;
}

const getPriceValue = (property: PropertyResponse) =>
  isRentalResponse(property)
    ? (property as any).pricePerMonth ?? 0
    : (property as any).totalPrice ?? 0;

const getCurrencyValue = (property: PropertyResponse) =>
  property.currency ?? "BDT";

export default function NewListingsGrid({
  title = "New Listings",
  viewAllHref,
  initialType = "all",
  initialLimit = 8,
}: NewListingsGridProps) {
  const [listingType, setListingType] = useState<ListingFilter>(initialType);
  const [bedsMin, setBedsMin] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const queryOpts = useMemo<PropertyFilters>(() => {
    const sortConfig: Pick<PropertyFilters, "sortBy" | "sortOrder"> = {};
    if (sortKey === "price-asc") {
      sortConfig.sortBy = "price";
      sortConfig.sortOrder = "asc";
    } else if (sortKey === "price-desc") {
      sortConfig.sortBy = "price";
      sortConfig.sortOrder = "desc";
    } else {
      sortConfig.sortBy = "createdAt";
      sortConfig.sortOrder = "desc";
    }

    return {
      listingType: listingType === "all" ? undefined : listingType,
      bedrooms: bedsMin > 0 ? { min: bedsMin } : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      limit: initialLimit,
      ...sortConfig,
    };
  }, [listingType, bedsMin, priceRange, sortKey, initialLimit]);

  // Fetch properties from API
  const { data, isLoading, error } = useProperties(queryOpts);

  const rawItems = useMemo(() => data?.properties ?? [], [data?.properties]);
  const items = useMemo(
    () => rawItems as unknown as PropertyResponse[],
    [rawItems]
  );
  const currency = items[0] ? getCurrencyValue(items[0]) : "BDT";

  // Update price range when data loads
  useEffect(() => {
    if (items.length > 0) {
      const prices = items.map((i) => getPriceValue(i));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setPriceRange((current) =>
        current[0] === 0 && current[1] === 1000000 ? [min, max] : current
      );
    }
  }, [items]);

  // Dynamic slider step
  const step = useMemo(() => {
    if (items.length === 0) return 1;
    const minPrice = Math.min(...items.map(getPriceValue));
    const maxPrice = Math.max(...items.map(getPriceValue));
    const span = Math.max(1, maxPrice - minPrice);
    const rough = Math.round(span / 50);
    return Math.max(1, rough);
  }, [items]);

  const resetFilters = () => {
    setListingType("all");
    setBedsMin(0);
    if (items.length > 0) {
      const prices = items.map(getPriceValue);
      setPriceRange([Math.min(...prices), Math.max(...prices)]);
    }
    setSortKey("newest");
  };

  const formatPrice = (n: number) => `${currency} ${n.toLocaleString()}`;

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-xl border bg-background p-8 text-center text-muted-foreground">
            Error loading properties. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${items.length} results`}
            </p>
          </div>
          <Button asChild variant="ghost" className="px-2 h-8">
            <Link href={viewAllHref}>View all</Link>
          </Button>
        </div>

        {/* Controls */}
        <div className="mb-6 grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-12">
          {/* Type */}
          <div className="md:col-span-3">
            <label className="mb-2 block text-sm font-medium">Type</label>
            <ToggleGroup
              type="single"
              value={listingType}
              onValueChange={(v) => v && setListingType(v as ListingFilter)}
              className="rounded-md bg-muted p-1"
            >
              <ToggleGroupItem
                value="all"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                All
              </ToggleGroupItem>
              <ToggleGroupItem
                value="rent"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Rent
              </ToggleGroupItem>
              <ToggleGroupItem
                value="sale"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Buy
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Beds */}
          <div className="md:col-span-3">
            <label className="mb-2 block text-sm font-medium">Beds (min)</label>
            <ToggleGroup
              type="single"
              value={String(bedsMin)}
              onValueChange={(v) => v && setBedsMin(Number(v))}
              className="rounded-md bg-muted p-1"
            >
              <ToggleGroupItem
                value="0"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Any
              </ToggleGroupItem>
              <ToggleGroupItem
                value="1"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                1+
              </ToggleGroupItem>
              <ToggleGroupItem
                value="2"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                2+
              </ToggleGroupItem>
              <ToggleGroupItem
                value="3"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                3+
              </ToggleGroupItem>
              <ToggleGroupItem
                value="4"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                4+
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Sort */}
          <div className="md:col-span-3">
            <label className="mb-2 block text-sm font-medium">Sort by</label>
            <Select
              value={sortKey}
              onValueChange={(v) => setSortKey(v as SortKey)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price range */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Price range</label>
              <div className="text-xs text-muted-foreground">
                {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
              </div>
            </div>
            <div className="mt-3 px-1">
              <Slider
                min={0}
                max={1000000}
                step={step}
                value={priceRange}
                onValueChange={(v) =>
                  setPriceRange([v[0]!, v[1]!] as [number, number])
                }
                className="w-full"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Reset */}
          <div className="md:col-span-12 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              size="sm"
              disabled={isLoading}
            >
              Reset filters
            </Button>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg bg-muted h-80"
              ></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border bg-background p-8 text-center text-muted-foreground">
            No listings match these filters.
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
