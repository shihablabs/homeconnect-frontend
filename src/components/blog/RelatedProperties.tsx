"use client";

import { PropertyResponse } from "@/types/property.types";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "../cards/PropertyCard";

interface RelatedPropertiesProps {
  properties: PropertyResponse[];
  title?: string;
}

export function RelatedProperties({ properties, title = "Recommended for You" }: RelatedPropertiesProps) {
  // We use client-side interactive components like PropertyCard, so this wrapper can be a client component 
  // or a server component passing data to client children. 
  // PropertyCard is a client component ('use client' inside it usually, or handled by next).
  // Let's keep this simple.

  if (!properties || properties.length === 0) return null;

  return (
    <div className="space-y-6 pt-12 border-t border-border/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
            <Sparkles className="h-3 w-3" />
            <span>Discover</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{title}</h2>
        </div>
        <Link href="/properties">
          <button className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
            View All Properties
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.slice(0, 3).map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
