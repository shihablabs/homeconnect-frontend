import { PropertyResponse } from "@/types/property.types";
import { Bath, Bed, Building, Car, Layers, Ruler, Trees } from "lucide-react";

interface DetailProps {
  property: PropertyResponse;
}

export function ResidentialDetails({ property }: DetailProps) {
  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground font-medium">
      <span className="inline-flex items-center gap-1.5">
        <Bed className="h-4 w-4 text-indigo-500" aria-hidden="true" />
        {property.bedrooms} {property.bedrooms === 1 ? "bd" : "bds"}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Bath className="h-4 w-4 text-indigo-500" aria-hidden="true" />
        {property.bathrooms} {property.bathrooms === 1 ? "ba" : "bas"}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Ruler className="h-4 w-4 text-indigo-500" aria-hidden="true" />
        {property.areaSize.toLocaleString()} {property.areaUnit}
      </span>
    </div>
  );
}

export function LandDetails({ property }: DetailProps) {
  return (
    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground font-medium">
      <span className="inline-flex items-center gap-1.5">
        <Trees className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        <span className="text-emerald-900/80">{property.areaSize} {property.areaUnit}</span>
      </span>
      {property.lotSize && (
        <span className="inline-flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          {property.lotSize} {property.lotUnit || 'katha'}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <Building className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        Zoned
      </span>
    </div>
  );
}

export function CommercialDetails({ property }: DetailProps) {
  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground font-medium">
      <span className="inline-flex items-center gap-1.5">
        <Ruler className="h-4 w-4 text-amber-600" aria-hidden="true" />
        {property.areaSize.toLocaleString()} {property.areaUnit}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Layers className="h-4 w-4 text-amber-600" aria-hidden="true" />
        Floor 3
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Car className="h-4 w-4 text-amber-600" aria-hidden="true" />
        Parking
      </span>
    </div>
  );
}
