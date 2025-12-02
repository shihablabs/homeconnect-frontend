/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FieldErrors,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { useCreatePropertyMutation } from "@/redux/features/property/propertyApiSlice";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { FormImageUpload } from "./FormImageUpload";
import { FormStepper } from "./FormStepper";
// --- START: Updated Constants and Schemas ---

// 1. CONSTANTS
const propertyTypes = [
  "apartment",
  "house",
  "condo",
  "villa",
  "townhouse",
  "studio",
  "land",
  "commercial",
] as const;

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

// 2. VALIDATION SCHEMA (Updated with your schema)
const requiredString = z.string().min(1, "This field is required");
const requiredNumber = z.number().positive("Must be a positive number");

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
  propertyType: z.enum(propertyTypes),

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
  virtualTour: z.string().url("Must be a valid URL").optional(),
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
  offerDeadline: z.string().optional(),
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
  virtualTour: "",
  floorPlans: [],
  agent: "",
  managementCompany: "",

  // Rental specific
  rentPrice: 0,
  currency: "BDT",
  securityDeposit: 0,
  utilityDeposit: 0,
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
  salePrice: 0,
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
  offerDeadline: "",
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
          if (['zipCode', 'yearBuilt', 'lotSize', 'agent', 'managementCompany', 'virtualTour', 'videos', 'floorPlans', 'tags'].includes(key)) {
            delete finalData[key];
          }
        } else if (value === '' && ['zipCode', 'agent', 'managementCompany', 'virtualTour'].includes(key)) {
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

      await toast.promise(
        createProperty({ data: finalData, images }).unwrap(),
        {
          loading: "Adding your property...",
          success: (response) => {
            router.push(`/properties/${response.id}`);
            return "Property listed successfully!";
          },
          error: (err: any) => {
            const errorMessage = err?.data?.message || err?.message || "Failed to list property. Please check all required fields.";
            return errorMessage;
          },
        }
      );
    } catch (error: any) {
      console.error('Property creation error:', error);
      toast.error(error?.data?.message || error?.message || "Failed to create property. Please try again.");
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
  const { control } = useFormContext<PropertyFormData>();
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Title</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Luxurious 3-Bedroom Apartment in Gulshan"
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
                placeholder="Describe your property..."
                {...field}
                rows={6}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="listingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4 pt-2"
                >
                  <FormItem className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem value="rent" />
                    </FormControl>
                    <FormLabel className="font-normal">For Rent</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem value="sale" />
                    </FormControl>
                    <FormLabel className="font-normal">For Sale</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
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
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Images</FormLabel>
            <FormControl>
              <FormImageUpload value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="virtualTour"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Virtual Tour URL (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="https://your-virtual-tour-link.com"
                {...field}
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
        </>
      )}
    </div>
  );
}
