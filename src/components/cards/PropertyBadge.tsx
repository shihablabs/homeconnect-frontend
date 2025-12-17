import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyBadgeProps {
  listingType?: "rent" | "sale";
  isNew?: boolean;
  featured?: boolean;
}

export function PropertyBadge({ listingType, isNew, featured }: PropertyBadgeProps) {
  return (
    <div className="flex gap-2">
      {listingType && (
        <Badge
          variant="secondary"
          className={cn(
            "border border-white/30 text-black shadow hover:bg-white/90 font-medium",
            listingType === "rent" ? "bg-white/85" : "bg-white/85"
          )}
        >
          {listingType === "rent" ? "For Rent" : "For Sale"}
        </Badge>
      )}

      {isNew && (
        <Badge className="border border-emerald-400/30 bg-emerald-500 text-white shadow font-medium">
          New
        </Badge>
      )}

      {featured && (
        <Badge className="border border-amber-400/30 bg-amber-500 text-white shadow font-medium">
          Featured
        </Badge>
      )}
    </div>
  );
}
