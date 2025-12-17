"use client";

import { Suspense } from "react";
import PropertiesPageClient from "./properties-client";

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-6 md:grid-cols-12 container mx-auto px-4 pb-10 min-h-screen">
          <div className="md:col-span-4 lg:col-span-3 rounded-xl border bg-background p-6 animate-pulse">
            Loading filters...
          </div>
          <div className="md:col-span-8 lg:col-span-9 rounded-xl border bg-background p-6 animate-pulse">
            Loading properties...
          </div>
        </div>
      }
    >
      <PropertiesPageClient />
    </Suspense>
  );
}
