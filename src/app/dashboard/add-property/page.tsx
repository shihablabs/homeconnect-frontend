import { ProtectedRoute } from "@/components/protected-route";
import { AddPropertyForm } from "./AddPropertyForm";

export default function AddPropertyPage() {
  return (
    <ProtectedRoute requiredRole="landlord">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-lg text-gray-600 mt-2">
            Fill out the form below to list your property on HomeConnect.
          </p>
        </div>

        <AddPropertyForm />
      </div>
    </ProtectedRoute>
  );
}
