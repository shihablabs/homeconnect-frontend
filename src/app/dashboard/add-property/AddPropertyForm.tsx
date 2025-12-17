/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  bangladeshData,
  getDistrictOptions,
  getDivisionOptions,
} from "@/lib/bangladeshLocations";
import { cn } from "@/lib/utils";
import { useCreatePropertyMutation } from "@/redux/features/property/propertyApiSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FieldErrors,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";
import { FormImageUpload } from "./FormImageUpload";
import { FormStepper } from "./FormStepper";
// --- START: Updated Constants and Schemas ---

// 1. CONSTANTS
// 1. CONSTANTS
const RENT_PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "studio",
  "penthouse",
  "room",        // Sublet/Room share
  "office",      // Commercial rent
  "shop",        // Commercial rent
] as const;

const SALE_PROPERTY_TYPES = [
  "apartment",   // Flat
  "house",       // Standalone building
  "land",        // Plot
  "commercial",  // Commercial space
  "office",      // Office space
  "warehouse",   // Industrial
] as const;

// Combined list for validation (unique values)
const allPropertyTypes = Array.from(new Set([...RENT_PROPERTY_TYPES, ...SALE_PROPERTY_TYPES])) as [string, ...string[]];

const areaUnits = ["sqft", "sqm", "acres", "hectares"] as const;
const currencies = ["BDT", "USD", "EUR", "GBP"] as const;
const petPolicies = ["allowed", "not-allowed", "case-by-case"] as const;
const smokingPolicies = ["allowed", "not-allowed"] as const;
const propertyConditions = [
  "excellent",
  "good",
  "needs-renovation",
  "new-construction",
] as const;
const ownershipTypes = ["freehold", "leasehold", "condominium"] as const;
const hoaFrequencies = ["monthly", "quarterly", "yearly"] as const;

const utilitiesList = [
  "Electricity",
  "Water",
  "Gas",
  "Internet",
  "Cable TV",
  "Garbage",
  "Sewage",
];

const amenitiesList = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "Security",
  "Elevator",
  "Garden",
  "Balcony",
  "Air Conditioning",
  "Heating",
  "Laundry",
  "Internet",
  "Cable TV",
  "Pet Friendly",
];

// 2. VALIDATION SCHEMA (Simplified & Fixed)
const requiredString = z.string().min(1, "This field is required");
// Use coerce to handle string inputs from forms safely
const requiredNumber = z.coerce.number().min(1, "This field is required");

// Individual Schemas
const CurrencySchema = z.enum(currencies);
const PetPolicySchema = z.enum(petPolicies);
const SmokingPolicySchema = z.enum(smokingPolicies);
const PropertyConditionSchema = z.enum(propertyConditions);
const OwnershipTypeSchema = z.enum(ownershipTypes);
const HOAFrequencySchema = z.enum(hoaFrequencies);

const baseSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  description: z.string().min(50, "Description must be at least 50 characters"),
  propertyType: z.enum(allPropertyTypes, {
    error: () => ({ message: "Please select a valid property type" }),
  }),

  address: requiredString,
  city: requiredString,
  neighborhood: requiredString,
  state: requiredString,
  country: requiredString,
  latitude: requiredNumber,
  longitude: requiredNumber,
  zipCode: z.string().optional(),

  bedrooms: requiredNumber.int(),
  bathrooms: requiredNumber.int(),
  areaSize: requiredNumber,
  areaUnit: z.enum(areaUnits),
  yearBuilt: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  lotSize: z.number().optional(),

  amenities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  imageFiles: z
    .any()
    .refine(
      (files) => files && files.length > 0,
      "At least one image is required."
    )
    .refine(
      (files) => files && files.length <= 10,
      "You can upload a maximum of 10 images."
    ),

  videos: z.array(z.string().url("Must be a valid URL")).optional(),
  floorPlans: z.array(z.string().url("Must be a valid URL")).optional(),

  agent: z.string().optional(),
  managementCompany: z.string().optional(),
});

// Updated Rental Schema
const rentalSchema = baseSchema.extend({
  listingType: z.literal("rent"),
  rentPrice: requiredNumber.max(1000000, "Rent price seems too high"),
  currency: CurrencySchema.default("BDT"),
  securityDeposit: z
    .number()
    .min(0, "Security deposit cannot be negative")
    .max(1000000, "Security deposit seems too high")
    .optional(),
  utilityDeposit: z
    .number()
    .min(0, "Utility deposit cannot be negative")
    .max(100000, "Utility deposit seems too high")
    .optional(),
  maintenanceFee: z
    .number()
    .min(0, "Maintenance fee cannot be negative")
    .max(10000, "Maintenance fee seems too high")
    .optional(),
  minimumStay: z
    .number()
    .int("Minimum stay must be an integer")
    .min(1, "Minimum stay must be at least 1 month")
    .max(60, "Minimum stay cannot exceed 60 months")
    .default(12),
  maximumStay: z
    .number()
    .int("Maximum stay must be an integer")
    .min(1, "Maximum stay must be at least 1 month")
    .max(120, "Maximum stay cannot exceed 120 months")
    .optional(),
  availableFrom: z
    .string()
    .min(1, "Available date is required")
    .refine((val) => new Date(val) > new Date(), {
      message: "Available from date must be in the future",
    }),
  leaseDuration: z
    .number()
    .int("Lease duration must be an integer")
    .min(1, "Lease duration must be at least 1 month")
    .max(120, "Lease duration cannot exceed 120 months")
    .optional(),
  isFurnished: z.boolean().default(false),
  utilitiesIncluded: z
    .array(z.string().trim())
    .max(20, "Cannot have more than 20 utilities")
    .default([]),
  petPolicy: PetPolicySchema.default("not-allowed"),
  smokingPolicy: SmokingPolicySchema.default("not-allowed"),
});

// Updated Sale Schema
const saleSchema = baseSchema.extend({
  listingType: z.literal("sale"),
  salePrice: requiredNumber.max(100000000, "Sale price seems too high"),
  currency: CurrencySchema.default("BDT"),
  originalPrice: z
    .number()
    .positive("Original price must be positive")
    .max(100000000, "Original price seems too high")
    .optional(),
  priceNegotiable: z.boolean().default(true),
  mortgageAvailable: z.boolean().default(false),
  propertyCondition: PropertyConditionSchema.default("good"),
  ownershipType: OwnershipTypeSchema.default("freehold"),
  hoaFee: z
    .number()
    .min(0, "HOA fee cannot be negative")
    .max(10000, "HOA fee seems too high")
    .optional(),
  hoaFrequency: HOAFrequencySchema.optional(),
  taxAmount: z
    .number()
    .min(0, "Tax amount cannot be negative")
    .max(100000, "Tax amount seems too high")
    .optional(),
  taxYear: z
    .number()
    .int("Tax year must be an integer")
    .min(2000, "Tax year seems too old")
    .max(new Date().getFullYear() + 1, "Tax year cannot be in the future")
    .optional(),
  openHouseDates: z.array(z.string().min(1)).optional().default([]),
  offerDeadline: z.date().optional(),
});

export const propertyFormSchema = z.discriminatedUnion("listingType", [
  rentalSchema,
  saleSchema,
]);

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

// 3. INITIAL FORM DATA (Updated)
const initialFormData: Partial<PropertyFormData> & Record<string, any> = {
  title: "",
  description: "",
  listingType: "rent",
  propertyType: "apartment",
  address: "",
  city: "Dhaka",
  neighborhood: "",
  state: "",
  country: "Bangladesh",
  latitude: 23.8103,
  longitude: 90.4125,
  zipCode: "",
  bedrooms: 1,
  bathrooms: 1,
  areaSize: 0,
  areaUnit: "sqft",
  yearBuilt: undefined,
  lotSize: undefined,
  amenities: [],
  tags: [],
  imageFiles: [],
  videos: [],
  floorPlans: [],
  agent: "",
  managementCompany: "",

  // Rental specific
  rentPrice: undefined, // undefined to show placeholder
  currency: "BDT",
  securityDeposit: undefined,
  utilityDeposit: undefined,
  maintenanceFee: undefined,
  minimumStay: 12,
  maximumStay: undefined,
  availableFrom: new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  leaseDuration: undefined,
  isFurnished: false,
  utilitiesIncluded: [],
  petPolicy: "not-allowed",
  smokingPolicy: "not-allowed",

  // Sale specific
  salePrice: undefined,
  originalPrice: undefined,
  priceNegotiable: true,
  mortgageAvailable: false,
  propertyCondition: "good",
  ownershipType: "freehold",
  hoaFee: undefined,
  hoaFrequency: undefined,
  taxAmount: undefined,
  taxYear: undefined,
  openHouseDates: [],
  offerDeadline: undefined,
};

// --- END: Updated Definitions ---

const STEPS = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Location" },
  { id: 3, name: "Details" },
  { id: 4, name: "Media" },
  { id: 5, name: "Features" },
  { id: 6, name: "Pricing & Terms" },
];

export function AddPropertyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const [createProperty, { isLoading }] = useCreatePropertyMutation();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema) as any,
    defaultValues: initialFormData as any,
    mode: "onBlur",
  });

  const { watch, trigger } = form;

  const listingType = watch("listingType");

  const handleNext = async () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = await trigger([
          "title",
          "description",
          "listingType",
          "propertyType",
        ]);
        break;
      case 2:
        isValid = await trigger([
          "address",
          "city",
          "neighborhood",
          "state",
          "country",
          "latitude",
          "longitude",
        ]);
        break;
      case 3:
        isValid = await trigger([
          "bedrooms",
          "bathrooms",
          "areaSize",
          "areaUnit",
        ]);
        break;
      case 4:
        isValid = await trigger(["imageFiles"]);
        break;
      case 5:
        isValid = true;
        break;
      case 6:
        isValid = await trigger(
          listingType === "rent"
            ? ["rentPrice", "currency", "availableFrom"]
            : ["salePrice", "currency", "propertyCondition"]
        );
        // Additional check: valid if price > 0
        if (listingType === "rent" && form.getValues("rentPrice") <= 0) {
          form.setError("rentPrice", { type: "manual", message: "Rent price must be greater than 0" });
          isValid = false;
        }
        if (listingType === "sale" && form.getValues("salePrice") <= 0) {
          form.setError("salePrice", { type: "manual", message: "Sale price must be greater than 0" });
          isValid = false;
        }
        break;
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: any) => {
    try {
      const finalData: any = { ...data };
      const images = finalData.imageFiles as File[];
      delete finalData.imageFiles;

      // Ensure neighborhood is set (use city as fallback if empty)
      if (!finalData.neighborhood || finalData.neighborhood.trim() === '') {
        finalData.neighborhood = finalData.city || 'N/A';
      }

      // Ensure availableFrom is properly formatted as ISO string for rental properties
      if (finalData.listingType === 'rent' && finalData.availableFrom) {
        const availableFromDate = new Date(finalData.availableFrom);
        if (isNaN(availableFromDate.getTime())) {
          // Invalid date, set to tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          finalData.availableFrom = tomorrow.toISOString();
        } else {
          // Ensure it's in the future
          const now = new Date();
          if (availableFromDate <= now) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            finalData.availableFrom = tomorrow.toISOString();
          } else {
            finalData.availableFrom = availableFromDate.toISOString();
          }
        }
      }

      // Clean up data - remove undefined/null values and ensure proper types
      Object.keys(finalData).forEach(key => {
        const value = finalData[key];

        // Skip special handling for required fields
        if (value === undefined || value === null) {
          // Only delete optional fields
          if (['zipCode', 'yearBuilt', 'lotSize', 'agent', 'managementCompany', 'videos', 'floorPlans', 'tags'].includes(key)) {
            delete finalData[key];
          }
        } else if (value === '' && ['zipCode', 'agent', 'managementCompany'].includes(key)) {
          // Remove empty optional strings
          delete finalData[key];
        }
      });

      // Ensure arrays are properly formatted (don't delete if empty, backend expects arrays)
      if (finalData.amenities && !Array.isArray(finalData.amenities)) {
        finalData.amenities = [];
      }
      if (finalData.utilitiesIncluded && !Array.isArray(finalData.utilitiesIncluded)) {
        finalData.utilitiesIncluded = [];
      }
      if (finalData.tags && !Array.isArray(finalData.tags)) {
        finalData.tags = [];
      }
      if (finalData.videos && !Array.isArray(finalData.videos)) {
        finalData.videos = [];
      }
      if (finalData.floorPlans && !Array.isArray(finalData.floorPlans)) {
        finalData.floorPlans = [];
      }

      // Handle offerDeadline
      if (finalData.offerDeadline instanceof Date) {
        finalData.offerDeadline = finalData.offerDeadline.toISOString();
      } else {
        delete finalData.offerDeadline;
      }

      // Show loading with SweetAlert2
      Swal.fire({
        title: "Submitting Property...",
        text: "Please wait while we list your property.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await createProperty({ data: finalData, images }).unwrap();

        // Show Success SweetAlert2
        Swal.fire({
          icon: "success",
          title: "Property Listed!",
          text: "Your property has been successfully added to the listings.",
          confirmButtonText: "View Property",
          confirmButtonColor: "#3085d6",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/properties/${response.id}`);
          } else {
            // Optional: Redirect to dashboard or stay on page (reset form?)
            // For now, let's redirect to properties list or just the new property
            router.push(`/properties/${response.id}`);
          }
        });

      } catch (err: any) {
        console.error('Property creation error:', err);
        const errorMessage = err?.data?.message || err?.message || "Failed to list property. Please check all required fields.";

        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: errorMessage,
          confirmButtonColor: "#d33",
        });
      }
    } catch (error: any) {
      console.error('Property creation error:', error);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: error?.data?.message || error?.message || "An unexpected error occurred. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const onInvalid = (errors: FieldErrors) => {
    toast.error(
      "Please fill in all required fields correctly before submitting."
    );
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <Card className="shadow-lg border">
            <CardContent className="p-6 md:p-8">
              <FormStepper
                steps={STEPS}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
              />

              <div className="mt-8">
                {currentStep === 1 && <Step1 />}
                {currentStep === 2 && <Step2 />}
                {currentStep === 3 && <Step3 />}
                {currentStep === 4 && <Step4 />}
                {currentStep === 5 && <Step5 />}
                {currentStep === 6 && <Step6 listingType={listingType} />}
              </div>

              <div className="mt-10 flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Property
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}

// --- Updated Step Components ---

function Step1() {
  const { control, watch, setValue } = useFormContext<PropertyFormData>();
  const listingType = watch("listingType");
  const propertyType = watch("propertyType");

  // Dynamic Property Types based on Listing Type
  const availableTypes = listingType === "rent" ? RENT_PROPERTY_TYPES : SALE_PROPERTY_TYPES;

  // Reset property type if current selection is invalid for new mode
  // Using useEffect to handle side-effect of changing listingType
  // We need to allow the component to render first, so we check on render
  if (listingType === "rent" && !RENT_PROPERTY_TYPES.includes(propertyType as any)) {
    // Default for Rent
    // We should do this via an effect, but in RHF changing during render is risky. 
    // Better to do it in the onChange handler of listingType below.
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Listing Type - Pro Card Style */}
      {/* Row 1: Listing Type & Property Category */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Listing Type - Spans 2 columns to give equal width to its 2 buttons */}
        <FormField
          control={control}
          name="listingType"
          render={({ field }) => (
            <FormItem className="space-y-3 md:col-span-2">
              <FormLabel className="text-lg font-semibold text-gray-800">I want to...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(val) => {
                    field.onChange(val);
                    // Auto-switch property type default to avoid mismatch
                    if (val === "rent") setValue("propertyType", "apartment");
                    else setValue("propertyType", "apartment");
                  }}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="rent" className="peer sr-only" />
                    </FormControl>
                    <FormLabel className="flex h-[52px] items-center justify-center gap-2 rounded-lg border bg-white px-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200 ease-in-out">
                      <span className="text-lg">🏠</span>
                      <span className="font-medium">Rent Out</span>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="sale" className="peer sr-only" />
                    </FormControl>
                    <FormLabel className="flex h-[52px] items-center justify-center gap-2 rounded-lg border bg-white px-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200 ease-in-out">
                      <span className="text-lg">🏷️</span>
                      <span className="font-medium">Sell Property</span>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Property Category - 1 Column */}
        <FormField
          control={control}
          name="propertyType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold text-gray-800">Property Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-[52px] shadow-sm">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize cursor-pointer">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Title</FormLabel>
            <FormControl>
              <Input
                placeholder={listingType === 'rent' ? "e.g. Modern Apartment in Gulshan" : "e.g. Luxury Villa for Sale"}
                className="h-11 shadow-sm focus-visible:ring-primary/20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the key features, neighborhood, and amenities..."
                {...field}
                rows={5}
                className="resize-none shadow-sm focus-visible:ring-primary/20"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function Step2() {
  const { control, watch, setValue, getValues } =
    useFormContext<PropertyFormData>();
  const watchedDivision = watch("state");
  const divisionOptions = getDivisionOptions();
  const districtOptions = getDistrictOptions(watchedDivision);

  setValue("country", bangladeshData.country.name);
  if (!getValues("latitude")) {
    setValue("latitude", bangladeshData.country.latitude);
    setValue("longitude", bangladeshData.country.longitude);
  }

  const LocationMap = useMemo(
    () =>
      dynamic(
        () =>
          import("@/app/dashboard/add-property/LocationMap").then(
            (mod) => mod.default
          ),
        {
          ssr: false,
          loading: () => (
            <div className="h-64 w-full bg-gray-200 animate-pulse" />
          ),
        }
      ),
    []
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- Country (Disabled) --- */}
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- State/Division Select --- */}
        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State / Division</FormLabel>
              <FormControl>
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("city", "");

                    const division = divisionOptions.find(
                      (d) => d.value === value
                    );
                    if (division) {
                      setValue("latitude", division.latitude);
                      setValue("longitude", division.longitude);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisionOptions.map((division) => (
                      <SelectItem key={division.value} value={division.value}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* --- City/District Select --- */}
      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City / District</FormLabel>
            <FormControl>
              <Select
                value={field.value || undefined}
                onValueChange={(value) => {
                  field.onChange(value);

                  const city = districtOptions.find((c) => c.value === value);
                  if (city) {
                    setValue("latitude", city.latitude);
                    setValue("longitude", city.longitude);
                  }
                }}
                disabled={!watchedDivision}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city/district" />
                </SelectTrigger>
                <SelectContent>
                  {districtOptions.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- Street Address --- */}
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., House 123, Road 4, Block B"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- Neighborhood --- */}
      <FormField
        control={control}
        name="neighborhood"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Neighborhood / Area</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Gulshan, Dhanmondi, Banani"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- Zip Code (Optional) --- */}
      <FormField
        control={control}
        name="zipCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Zip Code (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 1212" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- 6. Add the Map Component (Same as before) --- */}
      <div className="space-y-2">
        <FormLabel>Set Property Location on Map</FormLabel>
        <p className="text-sm text-gray-500">
          Drag the marker to the exact location.
        </p>
        <div className="h-96 rounded-lg overflow-hidden border z-0">
          <LocationMap />
        </div>
      </div>
    </div>
  );
}

function Step3() {
  const { control } = useFormContext<PropertyFormData>();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrooms</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bathrooms</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="yearBuilt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year Built</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 2010"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="areaSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Area</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 1500"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="areaUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {areaUnits.map((unit) => (
                    <SelectItem key={unit} value={unit} className="capitalize">
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function Step4() {
  const { control } = useFormContext<PropertyFormData>();
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="imageFiles"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Property Images</FormLabel>
            <FormControl>
              <FormImageUpload
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function Step5() {
  const { control, watch } = useFormContext<PropertyFormData>();
  const listingType = watch("listingType");

  return (
    <div className="space-y-6">
      {/* Amenities */}
      <FormField
        control={control}
        name="amenities"
        render={() => (
          <FormItem>
            <FormLabel>Amenities</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {amenitiesList.map((item) => (
                <FormField
                  key={item}
                  control={control}
                  name="amenities"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item
                                  )
                                );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item}</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Rental Specific Features */}
      {listingType === "rent" && (
        <>
          <FormField
            control={control}
            name="utilitiesIncluded"
            render={() => (
              <FormItem>
                <FormLabel>Utilities Included</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {utilitiesList.map((item) => (
                    <FormField
                      key={item}
                      control={control}
                      name="utilitiesIncluded"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item}
                            className="flex flex-row items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                      ...(field.value || []),
                                      item,
                                    ])
                                    : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item
                                      )
                                    );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="petPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pet Policy</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {petPolicies.map((policy) => (
                        <SelectItem
                          key={policy}
                          value={policy}
                          className="capitalize"
                        >
                          {policy.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="smokingPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Smoking Policy</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select smoking policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {smokingPolicies.map((policy) => (
                        <SelectItem
                          key={policy}
                          value={policy}
                          className="capitalize"
                        >
                          {policy.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Step6({ listingType }: { listingType: "rent" | "sale" }) {
  const { control } = useFormContext<PropertyFormData>();

  return (
    <div className="space-y-6">
      {listingType === "rent" ? (
        <>
          <h3 className="text-xl font-semibold">Rental Pricing & Terms</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="rentPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 25000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="securityDeposit"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Security Deposit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="utilityDeposit"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Utility Deposit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 10000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="maintenanceFee"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Maintenance Fee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 2000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="minimumStay"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Minimum Stay (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="maximumStay"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Maximum Stay (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="availableFrom"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Available From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="leaseDuration"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Lease Duration (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      placeholder="e.g., 12"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="isFurnished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel>Is it furnished?</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold">Sale Pricing & Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="salePrice"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Sale Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 8500000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="originalPrice"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Original Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 9000000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="propertyCondition"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Property Condition</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {propertyConditions.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          className="capitalize"
                        >
                          {item.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="ownershipType"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ownership Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ownership type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ownershipTypes.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          className="capitalize"
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="hoaFee"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>HOA Fee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 5000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="taxAmount"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Annual Tax Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 15000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="taxYear"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tax Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 2024"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="priceNegotiable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Price Negotiable?</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="mortgageAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Mortgage Available?</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <FormField
              control={control}
              name="offerDeadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Offer Deadline (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )
      }
    </div >
  );
}
