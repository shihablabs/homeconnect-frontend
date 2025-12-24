// import { Types } from 'mongoose';

// type ObjectId = string | Types.ObjectId;

export const listingTypes = ['rent', 'sale'] as const;
export const propertyTypes = [
  'apartment', 'house', 'condo', 'villa', 'townhouse', 'studio', 'land', 'commercial', 'penthouse', 'room', 'office', 'shop', 'warehouse'
] as const;
export const areaUnits = ['sqft', 'sqm', 'acres', 'hectares'] as const;
export const petPolicies = ['allowed', 'not-allowed', 'case-by-case'] as const;
export const smokingPolicies = ['allowed', 'not-allowed'] as const;
export const propertyConditions = [
  'excellent', 'good', 'needs-renovation', 'new-construction'
] as const;
export const ownershipTypes = ['freehold', 'leasehold', 'condominium'] as const;
export const hoaFrequencies = ['monthly', 'quarterly', 'yearly'] as const;
export const propertyStatusOptions = [
  'available', 'pending', 'sold', 'rented', 'maintenance', 'unavailable'
] as const;

export type ListingType = typeof listingTypes[number];
export type PropertyType = typeof propertyTypes[number];
export type AreaUnit = typeof areaUnits[number];
export type PetPolicy = typeof petPolicies[number];
export type SmokingPolicy = typeof smokingPolicies[number];
export type PropertyCondition = typeof propertyConditions[number];
export type OwnershipType = typeof ownershipTypes[number];
export type HoaFrequency = typeof hoaFrequencies[number];
export type PropertyStatus = typeof propertyStatusOptions[number];

export const bangladeshCities = [
  'Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'
] as const;
export const states = [
  'Dhaka Division', 'Chittagong Division', 'Khulna Division', 'Rajshahi Division',
  'Sylhet Division', 'Barisal Division', 'Rangpur Division', 'Mymensingh Division'
] as const;
export const amenitiesList = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Elevator', 'Garden', 'Balcony',
  'Air Conditioning', 'Heating', 'Laundry', 'Internet', 'Cable TV', 'Pet Friendly'
] as const;
export const utilitiesList = [
  'Water', 'Electricity', 'Gas', 'Internet', 'Cable TV', 'Trash Collection'
] as const;
export const suggestedTags = [
  'Family Friendly', 'Luxury', 'Budget Friendly', 'New Listing', 'Near School'
] as const;

export interface OwnerAgentResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  company?: string;
}

export interface PropertyResponseBase {
  id: string;
  slug: string;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  address: string;
  city: string;
  neighborhood: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  zipCode?: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  areaUnit: AreaUnit;
  yearBuilt?: number;
  lotSize?: number;
  lotUnit?: AreaUnit;
  amenities: string[];
  images: string[];
  videos?: string[];
  floorPlans?: string[];
  status: PropertyStatus;
  featured: boolean;
  isVerified: boolean;
  tags: string[];
  owner: OwnerAgentResponse;
  agent?: OwnerAgentResponse;
  views: number;
  savedBy: string[];
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
}

export interface RentalPropertyResponse extends PropertyResponseBase {
  listingType: 'rent';
  pricePerMonth: number;
  currency: string;
  securityDeposit?: number;
  utilityDeposit?: number;
  maintenanceFee?: number;
  minimumStay: number;
  maximumStay?: number;
  availableFrom: string;
  leaseDuration?: number;
  isFurnished: boolean;
  utilitiesIncluded: string[];
  petPolicy: PetPolicy;
  smokingPolicy: SmokingPolicy;
  isAvailable: boolean;
  lastRented?: string;
}

export interface SalePropertyResponse extends PropertyResponseBase {
  listingType: 'sale';
  totalPrice: number;
  currency: string;
  originalPrice?: number;
  priceNegotiable: boolean;
  mortgageAvailable: boolean;
  propertyCondition: PropertyCondition;
  ownershipType: OwnershipType;
  hoaFee?: number;
  hoaFrequency?: HoaFrequency;
  taxAmount?: number;
  taxYear?: number;
  timeOnMarket: number;
  openHouseDates?: string[];
  offerDeadline?: string;
}

export type PropertyResponse = RentalPropertyResponse | SalePropertyResponse;

export interface PropertySearchResult {
  properties: PropertyResponse[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  filters?: {
    priceRange?: { min: number; max: number };
    bedroomRange?: { min: number; max: number };
    bathroomRange?: { min: number; max: number };
  };
}

export interface PropertyFiltersBase {
  propertyType?: PropertyType;
  bedrooms?: number | { min?: number; max?: number };
  bathrooms?: number | { min?: number; max?: number };
  city?: string;
  neighborhood?: string;
  state?: string;
  amenities?: string[];
  featured?: boolean;
  isVerified?: boolean;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface PropertyFilters extends PropertyFiltersBase {
  listingType?: 'rent' | 'sale';
  minRent?: number;
  maxRent?: number;
  minStay?: number;
  isFurnished?: boolean;
  petPolicy?: PetPolicy;
  utilitiesIncluded?: string[];
  availableFrom?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyCondition?: PropertyCondition[];
  ownershipType?: OwnershipType;
  priceNegotiable?: boolean;
  mortgageAvailable?: boolean;
}

export interface CreatePropertyBaseRequest {
  title: string;
  description: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  neighborhood: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  zipCode?: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  areaUnit: AreaUnit;
  yearBuilt?: number;
  lotSize?: number;
  lotUnit?: AreaUnit;
  amenities: string[];
  images: string[];
  videos?: string[];
  floorPlans?: string[];
  tags?: string[];
  agent?: string;
  managementCompany?: string;
}

export interface CreateRentalPropertyRequest extends CreatePropertyBaseRequest {
  listingType: 'rent';
  pricePerMonth: number;
  currency?: string;
  securityDeposit?: number;
  utilityDeposit?: number;
  maintenanceFee?: number;
  minimumStay?: number;
  maximumStay?: number;
  availableFrom: string;
  leaseDuration?: number;
  isFurnished: boolean;
  utilitiesIncluded: string[];
  petPolicy: PetPolicy;
  smokingPolicy: SmokingPolicy;
}

export interface CreateSalePropertyRequest extends CreatePropertyBaseRequest {
  listingType: 'sale';
  totalPrice: number;
  currency?: string;
  originalPrice?: number;
  priceNegotiable?: boolean;
  mortgageAvailable?: boolean;
  propertyCondition: PropertyCondition;
  ownershipType: OwnershipType;
  hoaFee?: number;
  hoaFrequency?: HoaFrequency;
  taxAmount?: number;
  taxYear?: number;
  openHouseDates?: string[];
  offerDeadline?: string;
}

export type CreatePropertyData = CreateRentalPropertyRequest | CreateSalePropertyRequest;

export interface UpdatePropertyBaseRequest {
  title?: string;
  description?: string;
  status?: PropertyStatus;
  images?: string[];
  amenities?: string[];
  tags?: string[];
  featured?: boolean;
}

export interface UpdateRentalPropertyRequest extends UpdatePropertyBaseRequest {
  pricePerMonth?: number;
  securityDeposit?: number;
  isAvailable?: boolean;
  availableFrom?: string;
  minimumStay?: number;
  isFurnished?: boolean;
  utilitiesIncluded?: string[];
}

export interface UpdateSalePropertyRequest extends UpdatePropertyBaseRequest {
  totalPrice?: number;
  originalPrice?: number;
  priceNegotiable?: boolean;
  propertyCondition?: PropertyCondition;
  hoaFee?: number;
}

export type UpdatePropertyData = UpdateRentalPropertyRequest | UpdateSalePropertyRequest;

export interface PropertyFormData {
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  address: string;
  city: string;
  neighborhood: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  zipCode?: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  areaUnit: AreaUnit;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  lotSize?: number;
  lotUnit?: AreaUnit;
  amenities: string[];
  tags: string[];
  images: string[];
  imageFiles?: File[];
  videos?: string[];
  floorPlans?: string[];
  agent?: string;
  managementCompany?: string;
  pricePerMonth?: number;
  currency?: string;
  securityDeposit?: number;
  utilityDeposit?: number;
  maintenanceFee?: number;
  minimumStay?: number;
  maximumStay?: number;
  availableFrom: string;
  leaseDuration?: number;
  isFurnished: boolean;
  utilitiesIncluded: string[];
  petPolicy: PetPolicy;
  smokingPolicy: SmokingPolicy;
  totalPrice?: number;
  originalPrice?: number;
  priceNegotiable: boolean;
  mortgageAvailable: boolean;
  propertyCondition: PropertyCondition;
  ownershipType: OwnershipType;
  hoaFee?: number;
  hoaFrequency?: HoaFrequency;
  taxAmount?: number;
  taxYear?: number;
  openHouseDates?: string[];
  offerDeadline?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export const initialFormData: PropertyFormData = {
  title: '',
  description: '',
  listingType: 'rent',
  propertyType: 'apartment',
  address: '',
  city: '',
  neighborhood: '',
  state: '',
  country: 'Bangladesh',
  latitude: 23.8103,
  longitude: 90.4125,
  zipCode: '',
  bedrooms: 1,
  bathrooms: 1,
  areaSize: 0,
  areaUnit: 'sqft',
  floor: 1,
  totalFloors: 1,
  yearBuilt: undefined,
  lotSize: undefined,
  lotUnit: 'sqft',
  amenities: [],
  tags: [],
  images: [],
  imageFiles: [],
  agent: undefined,
  managementCompany: '',
  availableFrom: new Date().toISOString().split('T')[0],
  isFurnished: false,
  utilitiesIncluded: [],
  petPolicy: 'not-allowed',
  smokingPolicy: 'not-allowed',
  minimumStay: 12,
  currency: 'BDT',
  pricePerMonth: 0,
  priceNegotiable: true,
  mortgageAvailable: false,
  propertyCondition: 'good',
  ownershipType: 'freehold',
  totalPrice: 0,
};

export function isRentalResponse(
  property: PropertyResponse
): property is RentalPropertyResponse {
  return property.listingType === 'rent';
}

export function isSaleResponse(
  property: PropertyResponse
): property is SalePropertyResponse {
  return property.listingType === 'sale';
}

export function isRentalRequest(
  request: CreatePropertyData
): request is CreateRentalPropertyRequest {
  return request.listingType === 'rent';
}

export function isSaleRequest(
  request: CreatePropertyData
): request is CreateSalePropertyRequest {
  return request.listingType === 'sale';
}

export interface AvailableFilters {
  cities: string[];
  neighborhoods: string[];
  propertyTypes: string[];
  listingTypes: string[];
  bedOptions: number[];
  amenities: string[];
}