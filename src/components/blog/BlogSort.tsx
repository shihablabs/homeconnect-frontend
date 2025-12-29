"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export default function BlogSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("sortOrder") || "desc";

  
  const currentValue = `${sort}-${order}`;

  const handleValueChange = (value: string) => {
    const [newSort, newOrder] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSort);
    params.set("sortOrder", newOrder);
    router.push(`/blogs?${params.toString()}`);
  };

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px] bg-white">
        <SelectValue placeholder="Order by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="createdAt-desc">Newest First</SelectItem>
        <SelectItem value="createdAt-asc">Oldest First</SelectItem>
        <SelectItem value="views-desc">Most Popular</SelectItem>
      </SelectContent>
    </Select>
  );
}
