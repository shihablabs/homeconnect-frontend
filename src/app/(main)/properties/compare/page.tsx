"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { propertiesApi } from "@/lib/api/properties-api";
import { clearCompare, removeFromCompare } from "@/redux/features/property/compareSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { PropertyResponse, isRentalResponse } from "@/types/property.types";
import {
  ArrowLeft,
  Bath,
  Bed,
  Ruler,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ComparePage() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.compare);
  const [fullProperties, setFullProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullDetails = async () => {
      if (items.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ids = items.map((item) => item.id);
        const data = await propertiesApi.compareProperties(ids);
        setFullProperties((data as unknown as PropertyResponse[]) || []);
      } catch (err) {
        console.error("Failed to fetch comparison details:", err);
        toast.error("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <ArrowLeft className="h-8 w-8 text-gray-300" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">No Properties to Compare</h1>
          <p className="text-gray-500">Add up to 3 properties from the listings to see them side-by-side.</p>
          <Link href="/properties">
            <Button size="lg" className="rounded-xl font-bold px-8 mt-4">
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const attributes = [
    { label: "Price", getValue: (p: PropertyResponse) => isRentalResponse(p) ? `৳${(p.rentPrice || 0).toLocaleString()}/mo` : `৳${(p.salePrice || 0).toLocaleString()} (Total)` },
    { label: "Location", getValue: (p: PropertyResponse) => `${p.neighborhood || 'N/A'}, ${p.city || 'N/A'}` },
    { label: "Type", getValue: (p: PropertyResponse) => (p.propertyType || '').charAt(0).toUpperCase() + (p.propertyType || '').slice(1) },
    { label: "Listing", getValue: (p: PropertyResponse) => (p.listingType || '').toUpperCase() },
    { label: "Bedrooms", getValue: (p: PropertyResponse) => p.bedrooms || 0, icon: <Bed className="h-4 w-4" /> },
    { label: "Bathrooms", getValue: (p: PropertyResponse) => p.bathrooms || 0, icon: <Bath className="h-4 w-4" /> },
    { label: "Area", getValue: (p: PropertyResponse) => `${p.areaSize || 0} ${p.areaUnit || ''}`, icon: <Ruler className="h-4 w-4" /> },
    { label: "Status", getValue: (p: PropertyResponse) => <Badge variant="outline" className="capitalize">{p.status || 'N/A'}</Badge> },
    { label: "Verified", getValue: (p: PropertyResponse) => p.isVerified ? <ShieldCheck className="h-5 w-5 text-emerald-500" /> : <X className="h-5 w-5 text-gray-300" /> },
  ];

  // Unique amenities across all properties
  const allAmenities = Array.from(new Set(fullProperties.flatMap(p => p.amenities || [])));

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <Link href="/properties" className="text-sm font-bold text-primary flex items-center gap-2 hover:underline mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Compare Properties</h1>
          <p className="text-gray-500 font-medium">Detailed side-by-side analysis of your top choices</p>
        </div>
        <Button
          variant="outline"
          onClick={() => dispatch(clearCompare())}
          className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-2 font-bold"
        >
          <Trash2 className="h-4 w-4" />
          Clear Comparison
        </Button>
      </div>

      <div className="overflow-x-auto rounded-3xl border shadow-xl bg-card">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-6 text-left bg-muted/30 w-[200px] border-b border-r align-top sticky left-0 z-20 bg-background/95 backdrop-blur">
                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Properties</span>
              </th>
              {loading
                ? Array.from({ length: items.length }).map((_, i) => (
                  <th key={i} className="p-6 border-b min-w-[300px] w-1/3">
                    <div className="h-[300px] animate-pulse bg-gray-100 rounded-2xl" />
                  </th>
                ))
                : fullProperties.map((property) => (
                  <th key={property.id} className="p-6 border-b text-left min-w-[300px] w-1/3 align-top relative group">
                    <div className="space-y-4">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => dispatch(removeFromCompare(property.id))}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-sm">
                        <CompareCardImage property={property} />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-extrabold text-lg line-clamp-2 text-gray-900">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className={isRentalResponse(property) ? "bg-orange-100 text-orange-700 hover:bg-orange-100" : "bg-blue-100 text-blue-700 hover:bg-blue-100"}>
                            {isRentalResponse(property) ? "For Rent" : "For Sale"}
                          </Badge>
                          {property.isVerified && (
                            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 gap-1">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-black text-primary">
                          {isRentalResponse(property) ? `৳${(property.rentPrice || 0).toLocaleString()}/mo` : `৳${(property.salePrice || 0).toLocaleString()}`}
                        </p>
                        <Link href={`/properties/${property.id}`} className="block pt-2">
                          <Button className="w-full rounded-xl font-bold" variant="outline">View Full Details</Button>
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {attributes.map((attr, idx) => (
              <tr key={attr.label} className={idx % 2 === 0 ? "bg-muted/10" : ""}>
                <td className="p-6 font-bold text-sm text-gray-500 bg-muted/30 border-r sticky left-0 bg-background/95 backdrop-blur z-10">
                  <div className="flex items-center gap-2">
                    {attr.icon && <span className="text-primary">{attr.icon}</span>}
                    {attr.label}
                  </div>
                </td>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <td key={i} className="p-6"><div className="h-4 bg-gray-100 rounded w-24" /></td>)
                  : fullProperties.map(property => (
                    <td key={property.id} className="p-6 text-sm font-semibold text-gray-800">
                      {attr.getValue(property)}
                    </td>
                  ))
                }
              </tr>
            ))}

            {/* Amenities Row */}
            <tr>
              <td className="p-6 font-bold text-sm text-gray-500 bg-muted/30 border-r sticky left-0 bg-background/95 backdrop-blur z-10 align-top">
                Amenities
              </td>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <td key={i} className="p-6"><div className="h-20 bg-gray-100 rounded" /></td>)
                : fullProperties.map(property => (
                  <td key={property.id} className="p-6 align-top">
                    <div className="flex flex-wrap gap-2">
                      {allAmenities.map(amenity => (
                        <div
                          key={amenity}
                          className={`px-2 py-1 rounded text-[10px] font-bold border ${property.amenities?.includes(amenity)
                            ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
                            : "bg-gray-50 border-gray-100 text-gray-300 line-through"
                            }`}
                        >
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </td>
                ))
              }
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompareCardImage({ property }: { property: PropertyResponse }) {
  const [src, setSrc] = useState(property.images?.[0] || "/placeholder-property.jpg");

  return (
    <Image
      src={src}
      alt={property.title}
      fill
      className="object-cover"
      onError={() => setSrc("/placeholder-property.jpg")}
    />
  );
}
