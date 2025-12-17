/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { generatePaginationItems } from "@/lib/pagination-utils";
import { cn } from "@/lib/utils";
import { useGetMyPropertiesQuery } from "@/redux/features/property/propertyApiSlice";
import { Building, Plus, ServerCrash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PropertiesListTable } from "./PropertiesListTable";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function ErrorState({ error }: { error: any }) {
  return (
    <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
      <ServerCrash className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Failed to Load Properties
      </h3>
      <p className="text-gray-600 mb-4">
        {error?.data?.message || "An unexpected error occurred."}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
      <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        You haven&apos;t listed any properties yet.
      </h3>
      <p className="text-gray-600 mb-4">
        Get started by adding your first property.
      </p>
      <Button asChild>
        <Link href="/dashboard/add-property">
          <Plus className="mr-2 h-4 w-4" />
          Add New Property
        </Link>
      </Button>
    </div>
  );
}

export function PropertiesDashboardClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: searchResult,
    isLoading,
    isError,
    error,
  } = useGetMyPropertiesQuery({
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return <ErrorState error={error} />;
  }

  if (
    !searchResult ||
    !searchResult.properties ||
    searchResult.properties.length === 0
  ) {
    return <EmptyState />;
  }

  const { properties, total, hasNext, hasPrev } = searchResult;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600">
            You have {total} {total === 1 ? "property" : "properties"}{" "}
            listed.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/add-property">
            <Plus className="mr-2 h-4 w-4" />
            Add New Property
          </Link>
        </Button>
      </div>

      <PropertiesListTable properties={properties} />

      <div className="flex justify-center pb-8">
        <Pagination className="bg-white/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-sm inline-flex w-auto mt-6">
          <PaginationContent className="gap-2">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hasPrev) handlePageChange(page - 1);
                }}
                className={cn(
                  "transition-all duration-200 hover:bg-primary/10 hover:text-primary rounded-full",
                  !hasPrev ? "pointer-events-none opacity-40" : "cursor-pointer"
                )}
              />
            </PaginationItem>

            {generatePaginationItems(page, searchResult.totalPages).map((pageNum, idx) => (
              <PaginationItem key={idx}>
                {pageNum === 'ellipsis' ? (
                  <PaginationEllipsis className="text-muted-foreground/50" />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={page === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum as number);
                    }}
                    className={cn(
                      "rounded-full w-9 h-9 transition-all duration-200 font-medium",
                      page === pageNum
                        ? "bg-primary text-primary-foreground shadow-md scale-110 hover:bg-primary hover:text-primary-foreground"
                        : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
                    )}
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hasNext) handlePageChange(page + 1);
                }}
                className={cn(
                  "transition-all duration-200 hover:bg-primary/10 hover:text-primary rounded-full",
                  !hasNext ? "pointer-events-none opacity-40" : "cursor-pointer"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}