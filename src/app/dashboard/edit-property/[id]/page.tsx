"use client";

import { EditPropertyForm } from "@/app/dashboard/edit-property/EditPropertyForm";
import { useParams } from "next/navigation";

export default function EditPropertyPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Edit Property
        </h1>
        <p className="text-gray-500 mt-2">
          Update the details of your property listing.
        </p>
      </div>

      <EditPropertyForm propertyId={id} />
    </div>
  );
}
