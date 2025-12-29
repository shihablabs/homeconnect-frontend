import type { PropertyResponse } from "@/types/property.types";
import {
  PropertyResponse as ApiPropertyResponse,
  getFeaturedProperties as getFeaturedPropertiesApi,
  getPropertyById as getPropertyByIdApi,
  isNewListing,
  propertiesApi,
  PropertyFilters,
  queryProperties as queryPropertiesApi,
} from "./api/properties-api";


export async function listProperties(
  filters: PropertyFilters = {}
): Promise<PropertyResponse[]> {
  const result = await propertiesApi.getProperties(filters);
  const properties = result?.properties ?? [];
  return properties as unknown as PropertyResponse[];
}


export async function getNewListings(
  days = 30,
  limit = 24
): Promise<PropertyResponse[]> {
  const result = await propertiesApi.getProperties({
    sortBy: "createdAt",
    sortOrder: "desc",
    limit,
  });

  const properties = (result?.properties ?? []) as ApiPropertyResponse[];

  return properties
    .filter((property) => isNewListing(property, days))
    .map((property) => ({
      ...property,
      isNew: true,
    })) as unknown as PropertyResponse[];
}

export async function getFeaturedProperties(
  limit?: number
): Promise<PropertyResponse[]> {
  const properties = await getFeaturedPropertiesApi(limit);
  return properties as unknown as PropertyResponse[];
}

export async function getPropertyById(
  id: string
): Promise<PropertyResponse | null> {
  const property = await getPropertyByIdApi(id);
  return property ? (property as unknown as PropertyResponse) : null;
}

export async function queryProperties(
  filters: PropertyFilters = {}
): Promise<PropertyResponse[]> {
  const result = await queryPropertiesApi(filters);
  return result?.properties
    ? (result.properties as unknown as PropertyResponse[])
    : [];
}
