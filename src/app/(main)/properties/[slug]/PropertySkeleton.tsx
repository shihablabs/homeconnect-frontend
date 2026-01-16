"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PropertySkeleton() {
  return (
    <div className="container mx-auto px-4 pb-16 animate-pulse">
      <Skeleton className="h-[450px] w-full rounded-xl" />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 shadow-none border-none">
            <Skeleton className="h-10 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-6" />
            <div className="flex items-center space-x-6">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>

          <Skeleton className="h-px w-full" />

          <Card className="p-6 shadow-none border-none">
            <Skeleton className="h-8 w-1/4 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />

            <Skeleton className="h-8 w-1/4 my-6" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </Card>
        </div>

        <aside className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <Skeleton className="h-10 w-1/2 mb-4" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-12 w-full mb-3" />
            <Skeleton className="h-12 w-full" />
          </Card>
        </aside>
      </div>

      <Skeleton className="h-px w-full my-12" />

      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}