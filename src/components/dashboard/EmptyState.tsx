
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ 
  title = "No properties found", 
  description = "Try adjusting your search or filters to find what you're looking for.",
  actionLabel,
  actionHref
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-dashed border-gray-300 animate-in fade-in-50">
      <div className="bg-gray-50 p-4 rounded-full shadow-sm mb-4">
        <FileQuestion className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-2 max-w-sm mx-auto">{description}</p>
      
      {actionLabel && actionHref && (
        <Button asChild className="mt-6" variant="outline">
          <Link href={actionHref}>
            {actionLabel}
          </Link>
        </Button>
      )}
    </div>
  );
}
