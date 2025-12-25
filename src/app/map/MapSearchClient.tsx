"use client";

import { FilterSidebar } from "@/app/(main)/properties/FilterSidebar";
import { PropertyCard } from "@/components/cards/PropertyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGetAvailableFiltersQuery, useGetPropertiesQuery } from "@/redux/features/property/propertyApiSlice";
import { isRentalResponse, PropertyFilters, PropertyResponse, PropertyType } from "@/types/property.types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Filter, Loader2, MapPin, RefreshCw, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";

type MapItem = PropertyResponse;

const colorByType = (t: "rent" | "sale") =>
  t === "rent" ? "#2563eb" : "#dc2626";
const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125];

const getPriceValue = (property: MapItem) =>
  isRentalResponse(property)
    ? (property as any).pricePerMonth ?? 0
    : (property as any).totalPrice ?? 0;

const getCurrencyValue = (property: MapItem) => property.currency ?? "BDT";

const getCoordinates = (property: MapItem): [number, number] => [
  property.latitude,
  property.longitude,
];

function computeBounds(points: MapItem[]) {
  if (!points.length) return null;
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const southWest: [number, number] = [Math.min(...lats), Math.min(...lngs)];
  const northEast: [number, number] = [Math.max(...lats), Math.max(...lngs)];
  return [southWest, northEast] as [[number, number], [number, number]];
}

// Safe map invalidation function
const safeInvalidateSize = (map: L.Map | null) => {
  if (!map) return;
  try {
    map.invalidateSize();
  } catch (error) {
    console.warn("Map invalidateSize failed:", error);
  }
};

export default function MapSearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state from URL params
  const filters = useMemo((): PropertyFilters => {
    const q = searchParams.get("q") || undefined;
    const listingType = (searchParams.get("lt") as "rent" | "sale") || undefined;
    const city = searchParams.get("city") || undefined;
    const propertyType = searchParams.get("pt") || undefined;
    const bedrooms = searchParams.get("beds") ? Number(searchParams.get("beds")) : undefined;
    const minPrice = searchParams.get("min") ? Number(searchParams.get("min")) : undefined;
    const maxPrice = searchParams.get("max") ? Number(searchParams.get("max")) : undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "100"); // Higher limit for map view

    const activeFilters: PropertyFilters = {
      search: q,
      listingType,
      city,
      propertyType: propertyType as PropertyType | undefined,
      bedrooms,
      sortBy: "createdAt",
      sortOrder: "desc",
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
  }, [searchParams]);

  // Fetch properties from API
  const {
    data: searchResult,
    isLoading: isLoadingProperties,
    isError,
    error,
    refetch,
  } = useGetPropertiesQuery(filters);

  const { data: filterOptions, isLoading: isLoadingFilters } =
    useGetAvailableFiltersQuery();

  // Get properties with coordinates
  const items = useMemo(() => {
    if (!searchResult?.properties) return [];
    return searchResult.properties.filter(
      (property) =>
        typeof property.latitude === "number" &&
        typeof property.longitude === "number" &&
        !isNaN(property.latitude) &&
        !isNaN(property.longitude)
    );
  }, [searchResult]);

  // Update URL params
  const updateURL = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());

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

      router.push(`/map?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/map", { scroll: false });
  }, [router]);

  // Local filter states for quick filters
  const [searchInput, setSearchInput] = useState<string>(filters.search || "");
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Debounced search
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    updateURL({ q: debouncedSearch.trim() || undefined });
  }, [debouncedSearch, updateURL]);

  // Selection state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (selectedId && !items.find((f) => f.id === selectedId)) {
      setSelectedId(null);
    }
  }, [items, selectedId]);

  // Map refs
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const LRef = useRef<typeof L | null>(null);
  const [tileError, setTileError] = useState<string | null>(null);

  // Safe map operations
  const safeMapOperation = useCallback((operation: (map: L.Map) => void) => {
    const map = mapRef.current;
    if (!map) return;

    try {
      operation(map);
    } catch (error) {
      console.warn("Map operation failed:", error);
    }
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    let destroyed = false;
    let resizeTimer: NodeJS.Timeout;

    async function init() {
      const L = (await import("leaflet")).default;
      LRef.current = L;

      if (!mapElRef.current || destroyed) return;

      // Clean existing map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const initialCenter: [number, number] = items.length
        ? getCoordinates(items[0])
        : DEFAULT_CENTER;

      // Create map with proper options
      const map = L.map(mapElRef.current, {
        center: initialCenter,
        zoom: 12,
        zoomControl: true,
        preferCanvas: true,
        fadeAnimation: false,
        markerZoomAnimation: false,
      });

      mapRef.current = map;

      // Add tiles with error handling
      const tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
          maxZoom: 19,
          errorTileUrl:
            "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        }
      );

      tileLayer
        .on("tileerror", () => setTileError("Failed to load map tiles"))
        .on("tileload", () => setTileError(null))
        .addTo(map);

      // Safe resize handler
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          safeInvalidateSize(map);
        }, 100);
      };

      window.addEventListener("resize", onResize);

      // Wait for map to be fully initialized
      setTimeout(() => {
        if (!destroyed) {
          safeInvalidateSize(map);
          setIsMapReady(true);
        }
      }, 100);

      return () => {
        window.removeEventListener("resize", onResize);
        clearTimeout(resizeTimer);
        if (map && !destroyed) {
          map.remove();
        }
      };
    }

    init();

    return () => {
      destroyed = true;
      setIsMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when items or selection change
  useEffect(() => {
    if (!isMapReady || isLoadingProperties) return;

    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    // Clear old markers safely
    if (markersGroupRef.current) {
      try {
        markersGroupRef.current.removeFrom(map);
      } catch (error) {
        console.warn("Error removing markers:", error);
      }
      markersGroupRef.current = null;
    }

    const group = L.featureGroup();

    items.forEach((p: MapItem) => {
      const selected = selectedId === p.id;
      const color = selected ? "#16a34a" : colorByType(p.listingType);
      const priceValue = getPriceValue(p);
      const currencyValue = getCurrencyValue(p);

      try {
        const marker = L.circleMarker(getCoordinates(p), {
          radius: selected ? 14 : 10,
          color,
          fillColor: color,
          fillOpacity: 0.95,
          weight: selected ? 3 : 2,
        });

        const html = `
          <div style="font-size:12px; line-height:1.2; max-width:250px">
            <div style="font-weight:600; margin-bottom:2px;">${p.title}</div>
            <div style="color:#6b7280">${p.neighborhood ? `${p.neighborhood}, ` : ""
          }${p.city}</div>
            <div style="margin-top:4px; font-weight:500">
              ${currencyValue} ${priceValue.toLocaleString()}${p.listingType === "rent" ? "/mo" : ""
          }
            </div>
            <div style="margin-top:2px; font-size:11px; color:#6b7280">
              ${p.bedrooms} bed • ${p.bathrooms
          } bath • ${p.areaSize.toLocaleString()} ${p.areaUnit ?? "sqft"}
            </div>
            <a href="/properties/${p.id
          }" style="color:#2563eb; text-decoration:underline; font-size:11px; display:inline-block; margin-top:4px;">View details</a>
          </div>
        `;

        marker.bindPopup(html, { closeButton: true });
        marker.on("click", () => setSelectedId(p.id));
        group.addLayer(marker);
      } catch (error) {
        console.warn("Error creating marker:", error);
      }
    });

    try {
      group.addTo(map);
      markersGroupRef.current = group;

      // Fit bounds safely
      const b = computeBounds(items);
      if (b && b[0] && b[1]) {
        setTimeout(() => {
          safeMapOperation((map) => {
            map.fitBounds(b, { padding: [40, 40], animate: false });
          });
        }, 50);
      } else {
        safeMapOperation((map) => {
          map.setView(DEFAULT_CENTER, 12);
        });
      }

      // Safe size invalidation
      setTimeout(() => {
        safeInvalidateSize(map);
      }, 100);
    } catch (error) {
      console.warn("Error updating map:", error);
    }
  }, [items, selectedId, isMapReady, isLoadingProperties, safeMapOperation]);

  // Controls
  const fitToMarkers = () => {
    safeMapOperation((map) => {
      const b = computeBounds(items);
      if (b && b[0] && b[1]) {
        map.fitBounds(b, { padding: [40, 40], animate: true });
      }
    });
  };

  // Active filters count
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
    <div className="grid gap-6 md:grid-cols-12 mt-20">
      {/* Map */}
      <section className="md:col-span-7 lg:col-span-8">
        <div className="overflow-hidden rounded-xl border h-[70vh] md:h-[80vh] sticky top-20">
          {/* Map Container */}
          <div
            ref={mapElRef}
            className="absolute inset-0 z-10"
            style={{ visibility: isMapReady ? "visible" : "hidden" }}
          />

          {/* Loading overlay */}
          {(isLoadingProperties || !isMapReady) && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-20">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">
                  {isLoadingProperties ? "Loading properties..." : "Loading map..."}
                </div>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {isError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 z-20">
              <div className="text-center p-6">
                <div className="text-red-600 font-semibold mb-2">Failed to load properties</div>
                <div className="text-sm text-red-500 mb-4">
                  {error && 'message' in error ? String(error.message) : 'Unknown error'}
                </div>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Legend overlay */}
          {isMapReady && !isLoadingProperties && (
            <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-md bg-white/90 backdrop-blur-sm p-3 text-xs shadow-lg space-y-1.5 border">
              <div className="flex items-center gap-2 font-medium mb-1 text-xs text-muted-foreground">
                Legend
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#2563eb]" />{" "}
                <span className="text-xs">For Rent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#dc2626]" />{" "}
                <span className="text-xs">For Sale</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#16a34a] border-2 border-white" />{" "}
                <span className="text-xs">Selected</span>
              </div>
            </div>
          )}

          {/* Map Controls */}
          {isMapReady && !isLoadingProperties && items.length > 0 && (
            <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">
              <Button
                onClick={fitToMarkers}
                variant="secondary"
                size="sm"
                className="shadow-lg"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Fit to Markers
              </Button>
            </div>
          )}

          {tileError && isMapReady && (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 mx-auto w-max rounded bg-red-600/90 px-3 py-1 text-xs text-white shadow">
              {tileError}
            </div>
          )}
        </div>
      </section>

      {/* Sidebar */}
      <aside className="md:col-span-5 lg:col-span-4">
        <div className="rounded-xl border bg-background p-6 space-y-6 sticky top-20 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Map Search</h1>
              <div className="text-sm text-muted-foreground">
                {isLoadingProperties ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    {items.length} property{items.length !== 1 ? "ies" : ""} found
                    {searchResult?.total && searchResult.total > items.length && (
                      <span className="text-xs ml-1">
                        (showing {items.length} on map)
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsFilterSheetOpen(true)}
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Quick Search */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search properties..."
                className="pl-10"
              />
              {isLoadingProperties && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Quick Filters - Desktop */}
            <div className="hidden md:block space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium">Listing Type</div>
                <ToggleGroup
                  type="single"
                  value={filters.listingType || "all"}
                  onValueChange={(v: string) =>
                    updateURL({ lt: v === "all" ? undefined : v })
                  }
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

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Active Filters</div>
                    <Button
                      variant="link"
                      className="text-xs h-auto p-0"
                      onClick={clearAll}
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.listingType && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1">
                        {filters.listingType === "rent" ? "Rent" : "Sale"}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 ml-1 hover:bg-transparent"
                          onClick={() => updateURL({ lt: undefined })}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                    {filters.city && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1">
                        {filters.city}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 ml-1 hover:bg-transparent"
                          onClick={() => updateURL({ city: undefined })}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                    {filters.propertyType && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1">
                        {filters.propertyType}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 ml-1 hover:bg-transparent"
                          onClick={() => updateURL({ pt: undefined })}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                    {filters.bedrooms && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1">
                        {typeof filters.bedrooms === 'number' ? `${filters.bedrooms}+` : `${filters.bedrooms.min || 0}+`} beds
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 ml-1 hover:bg-transparent"
                          onClick={() => updateURL({ beds: undefined })}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                    {(filters.minPrice || filters.maxPrice || filters.minRent || filters.maxRent) && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1">
                        Price range
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 ml-1 hover:bg-transparent"
                          onClick={() => {
                            updateURL({ min: undefined, max: undefined });
                          }}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* View All Filters Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsFilterSheetOpen(true)}
              >
                <Filter className="mr-2 h-4 w-4" />
                View All Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Results List */}
          <div className="border-t pt-4">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {isLoadingProperties ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <div>Loading properties...</div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="font-medium">No properties found</div>
                  <div className="text-sm mt-1">Try adjusting your filters</div>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={clearAll}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                items.map((property) => (
                  <div
                    key={property.id}
                    className={`rounded-lg border p-3 cursor-pointer transition-all ${selectedId === property.id
                      ? "ring-2 ring-primary border-primary bg-primary/5"
                      : "hover:border-primary/50"
                      }`}
                    onClick={() => setSelectedId(property.id)}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Filter Sheet (Mobile) */}
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
