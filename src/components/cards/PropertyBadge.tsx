import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyBadgeProps {
  listingType?: "rent" | "sale";
  isNew?: boolean;
  featured?: boolean;
}

export function PropertyBadge({ listingType, isNew, featured }: PropertyBadgeProps) {
  return (
    <div className="flex gap-1.5">
      {listingType && (
        <Badge
          variant="secondary"
          className={cn(
            "border border-white/40 text-black shadow-sm font-semibold tracking-tight backdrop-blur-md px-2 py-0.5 text-[10px] uppercase",
            listingType === "rent" ? "bg-white/90" : "bg-white/90"
          )}
        >
          {listingType === "rent" ? "Rent" : "Sale"}
        </Badge>
      )}

      {isNew && (
        <Badge className="border border-white/20 bg-emerald-500/90 text-white shadow-sm font-semibold tracking-tight backdrop-blur-md px-2 py-0.5 text-[10px] uppercase hover:bg-emerald-600">
          New
        </Badge>
      )}

      {featured && (
        <Badge className="border border-white/20 bg-amber-500/90 text-white shadow-sm font-semibold tracking-tight backdrop-blur-md px-2 py-0.5 text-[10px] uppercase hover:bg-amber-600">
          Featured
        </Badge>
      )}
    </div>
  );
}
