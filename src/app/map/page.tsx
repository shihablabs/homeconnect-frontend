// app/map/page.tsx
"use client";

import { Suspense } from "react";
import MapSearchClient from "./MapSearchClient";

export default function MapPage() {
  return (
    <main className="py-6">
      <div className="container mx-auto px-4">
        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-12 mt-20">
              {/* Map skeleton */}
              <section className="md:col-span-7 lg:col-span-8">
                <div className="h-[70vh] md:h-[80vh] rounded-xl border bg-muted animate-pulse"></div>
              </section>

              {/* Sidebar skeleton */}
              <aside className="md:col-span-5 lg:col-span-4">
                <div className="rounded-xl border bg-background p-6 space-y-6 h-[80vh]">
                  <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-muted rounded animate-pulse"></div>
                      <div className="h-16 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-12 bg-muted rounded animate-pulse"></div>
                      <div className="h-12 bg-muted rounded animate-pulse"></div>
                      <div className="h-12 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          }
        >
          <MapSearchClient />
        </Suspense>
      </div>
    </main>
  );
}
