/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useDeletePropertyMutation } from "@/redux/features/property/propertyApiSlice";
import { useAppSelector } from "@/redux/hooks";
import {
  PropertyResponse,
  isRentalResponse,
} from "@/types/property.types";
import {
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Trash
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PropertiesListTableProps {
  properties: PropertyResponse[];
}

function formatPrice(property: PropertyResponse) {
  const currency = property.currency || "BDT";
  if (isRentalResponse(property)) {
    return `${currency} ${(property.pricePerMonth || 0).toLocaleString()}/mo`;
  }
  return `${currency} ${(property.totalPrice || 0).toLocaleString()}`;
}

function getStatusVariant(
  status: PropertyResponse["status"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "available":
      return "default";
    case "rented":
    case "sold":
      return "secondary";
    case "maintenance":
      return "outline";
    case "unavailable":
      return "destructive";
    default:
      return "secondary";
  }
}

export function PropertiesListTable({ properties }: PropertiesListTableProps) {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const [deleteProperty, { isLoading: isDeleting }] =
    useDeletePropertyMutation();

  // Check if user is admin or support
  const isAdminOrSupport = user?.role === 'admin' || user?.role === 'support';

  const handleDelete = async (id: string) => {
    toast.promise(
      async () => {
        await deleteProperty(id).unwrap();
        return { id };
      },
      {
        loading: "Deleting property...",
        success: `Property deleted successfully.`,
        error: "Failed to delete property.",
      }
    );
  };

  const copyLink = (identifier: string) => {
    const url = `${window.location.origin}/properties/${identifier}`;
    navigator.clipboard.writeText(url);
    toast.success("Property link copied to clipboard!");
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title & Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>
                <Image
                  src={
                    property.images?.[0] || "/placeholder-property.jpg"
                  }
                  alt={property.title}
                  width={64}
                  height={64}
                  className="rounded-md object-cover h-12 w-16"
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/properties/${property.id}`}
                  className="font-medium text-gray-900 hover:text-primary transition-colors"
                >
                  {property.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {property.city}, {property.state}
                </p>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getStatusVariant(property.status)}
                  className="capitalize"
                >
                  {property.status}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {formatPrice(property)}
              </TableCell>
              <TableCell className="capitalize text-gray-600">
                {property.propertyType}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href={`/properties/${property.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer"
                    >
                      <Link
                        href={`/dashboard/edit-property/${property.id}`}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => copyLink(property.slug || property.id)}
                      className="cursor-pointer"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy Link
                    </DropdownMenuItem>

                    {/* Show delete for owner, admin, or support */}
                    {(property.owner?.id === user?.id || isAdminOrSupport) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(property.id)}
                          disabled={isDeleting}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}