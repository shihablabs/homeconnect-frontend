"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropertyResponse, isRentalResponse } from "@/types/property.types";
import { ArrowRight, Bath, Bed, MapPin, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useEffect, useState } from "react";

interface QuickViewModalProps {
  property: PropertyResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ property, isOpen, onClose }: QuickViewModalProps) {
  const [imgSrc, setImgSrc] = useState("");

  useEffect(() => {
    if (property) {
      setImgSrc(property.images[0] || "/placeholder-property.jpg");
    }
  }, [property]);

  if (!property) return null;

  const getPriceLabel = () => {
    if (isRentalResponse(property) && property.pricePerMonth) {
      return `৳ ${property.pricePerMonth.toLocaleString()} /mo`;
    }
    // Check if it's a sale response or fallback if sale logic applies
    if ('totalPrice' in property && property.totalPrice) {
      return `৳ ${property.totalPrice.toLocaleString()} (Total)`;
    }
    return 'Price on Request';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[80rem] p-0 border-none rounded-3xl overflow-hidden shadow-2xl">
        <div className="w-full grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-[4/3] md:aspect-auto h-full min-h-[300px] bg-gray-100">
            <Image
              src={imgSrc || "/placeholder-property.jpg"}
              alt={property.title}
              fill
              className="object-cover"
              onError={() => setImgSrc("/placeholder-property.jpg")}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-primary/90 backdrop-blur-md uppercase text-[10px] font-bold px-2 py-1">{property.listingType}</Badge>
              {property.featured && <Badge className="bg-amber-500/90 backdrop-blur-md uppercase text-[10px] font-bold px-2 py-1">Featured</Badge>}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-6 flex flex-col justify-center">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
                <MapPin className="h-3.5 w-3.5" />
                {property.city}, {property.neighborhood}
              </div>
              <DialogTitle className="text-2xl font-black text-gray-900 leading-tight">
                {property.title}
              </DialogTitle>
              <div className="text-3xl font-black text-primary tracking-tight">
                {getPriceLabel()}
              </div>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <Bed className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-gray-900">{property.bedrooms} Beds</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <Bath className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-gray-900">{property.bathrooms} Baths</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <Ruler className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-gray-900">{property.areaSize} {property.areaUnit}</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
              {property.description}
            </p>

            <div className="pt-4">
              <Link href={`/properties/${property.id}`} onClick={onClose}>
                <Button className="w-full h-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all">
                  <span>View Full Details</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
