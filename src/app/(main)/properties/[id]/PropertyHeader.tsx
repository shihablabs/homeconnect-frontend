/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PropertyResponse,
} from "@/types/property.types";
import {
  Bath,
  Bed,
  Building,
  MapPin,
  Ruler,
  Share2,
  ShieldCheck,
  ShieldOff
} from "lucide-react";
import { toast } from "sonner";

interface PropertyHeaderProps {
  property: PropertyResponse;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const {
    id,
    title,
    city,
    neighborhood,
    address,
    bedrooms,
    bathrooms,
    areaSize,
    areaUnit,
    isVerified,
    propertyType,
    slug,
    description
  } = property;

  const fullAddress = `${address}, ${neighborhood}, ${city}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: `${window.location.origin}/properties/${slug || id}`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/properties/${slug || id}`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <Card className="p-0 border-none shadow-none bg-transparent">
      <div className="flex flex-col gap-6">
        {/* Title and Badge Row */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {isVerified ? (
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider"
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Verified Listing
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-red-200 bg-red-50 text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider"
              >
                <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
                Not Verified
              </Badge>
            )}
            <Badge variant="outline" className="border-gray-200 bg-white text-gray-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {propertyType}
            </Badge>
          </div>

          <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {title}
            </h1>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 shrink-0 border-gray-200 hover:bg-primary/5 hover:text-primary transition-all"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-medium">{fullAddress}</span>
          </div>
        </div>

        {/* Highlight Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100">
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
            <div className="flex items-center gap-2 text-primary">
              <Bed className="h-6 w-6" />
              <span className="text-xl font-bold">{bedrooms}</span>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bedrooms</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
            <div className="flex items-center gap-2 text-primary">
              <Bath className="h-6 w-6" />
              <span className="text-xl font-bold">{bathrooms}</span>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bathrooms</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
            <div className="flex items-center gap-2 text-primary">
              <Ruler className="h-6 w-6" />
              <span className="text-xl font-bold">{areaSize}</span>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{areaUnit.toUpperCase()}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
            <div className="flex items-center gap-2 text-primary">
              <Building className="h-6 w-6" />
              <span className="text-xl font-bold capitalize">{propertyType}</span>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</span>
          </div>
        </div>
      </div>
    </Card>
  );
}