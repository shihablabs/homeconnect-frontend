

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePaginationItems } from "@/lib/pagination-utils";
import { cn } from "@/lib/utils";
import { useGetMyPropertiesQuery } from "@/redux/features/property/propertyApiSlice";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PropertiesListTable } from "./PropertiesListTable";



export function PropertiesDashboardClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState<"all" | "rent" | "sale">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  
  
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);


  const {
    data: searchResult,
    isLoading,
    isError,
    error,
  } = useGetMyPropertiesQuery({
    page,
    limit,
    sortBy: "createdAt",
    sortOrder,
    search: debouncedSearchTerm || undefined,
    listingType: propertyType === "all" ? undefined : propertyType,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); 
  };

  const handleTypeChange = (value: string) => {
    setPropertyType(value as "all" | "rent" | "sale");
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value as "asc" | "desc");
  };

  

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">
            Manage your portfolio
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md">
          <Link href="/dashboard/add-property">
            <Plus className="mr-2 h-4 w-4" />
            Add New Property
          </Link>
        </Button>
      </div>

      {}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">

        {}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title, location..."
            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {}
        <div className="flex items-center gap-3">
          {}
          <Select value={propertyType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200">
              <div className="flex items-center gap-2 text-gray-700">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
            </SelectContent>
          </Select>

          {}
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <ErrorState error={error} />
      ) : !searchResult?.properties || searchResult.properties.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex justify-between items-center text-sm text-gray-500 px-1">
            <span>Showing {searchResult.properties.length} results</span>
            <span>Total {searchResult.total} properties</span>
          </div>

          <PropertiesListTable properties={searchResult.properties} />

          <div className="flex justify-center pb-8">
            <Pagination className="bg-white/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-sm inline-flex w-auto mt-6">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (searchResult.hasPrev) handlePageChange(page - 1);
                    }}
                    className={cn(
                      "transition-all duration-200 hover:bg-primary/10 hover:text-primary rounded-full",
                      !searchResult.hasPrev ? "pointer-events-none opacity-40" : "cursor-pointer"
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
                      if (searchResult.hasNext) handlePageChange(page + 1);
                    }}
                    className={cn(
                      "transition-all duration-200 hover:bg-primary/10 hover:text-primary rounded-full",
                      !searchResult.hasNext ? "pointer-events-none opacity-40" : "cursor-pointer"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
}