
"use client";

import { Button } from "@/components/ui/button";
import { useGetPropertyByIdQuery } from "@/redux/features/property/propertyApiSlice";
import { ServerCrash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PropertyClientPage } from "./PropertyClientPage";
import { PropertySkeleton } from "./PropertySkeleton";

export default function Page() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useGetPropertyByIdQuery(id ?? "");

  if (isLoading) {
    return <PropertySkeleton />;
  }

  if (isError || !apiResponse || !apiResponse) {
    return (
      <ErrorState
        error={error}
        message={
          !apiResponse ? "Property not found." : "Failed to load property."
        }
      />
    );
  }

  return <PropertyClientPage property={apiResponse} />;
}

function ErrorState({ error, message }: { error?: any; message: string }) {
  return (
    <div className="container mx-auto px-4 pt-40 pb-20 min-h-screen">
      <div className="text-center py-20 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
        <ServerCrash className="w-20 h-20 text-red-400 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">{message}</h3>
        <p className="text-gray-600 mb-6 px-4">
          {error?.data?.message ||
            "The property you are looking for might be unavailable or the link is incorrect."}
        </p>
        <Button asChild>
          <Link href="/properties">Back to Properties</Link>
        </Button>
      </div>
    </div>
  );
}
