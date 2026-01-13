

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
  getDistrictOptions,
  getDivisionOptions
} from "@/lib/bangladeshLocations";
import { cn } from "@/lib/utils";
import {
  useGetPropertyByIdQuery,
  useUpdatePropertyMutation
} from "@/redux/features/property/propertyApiSlice";
import { amenitiesList } from "@/types/property.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormImageUpload } from "../add-property/FormImageUpload";

import {
  FormProvider,
  useForm,
  useFormContext
} from "react-hook-form";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";
import { FormStepper } from "../add-property/FormStepper";





const RENT_PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "studio",
  "penthouse",
  "room",
  "office",
  "shop",
] as const;

const SALE_PROPERTY_TYPES = [
  "apartment",
  "house",
  "land",
  "commercial",
  "office",
  "warehouse",
] as const;


const allPropertyTypes = Array.from(new Set([...RENT_PROPERTY_TYPES, ...SALE_PROPERTY_TYPES])) as [string, ...string[]];

const areaUnits = ["sqft", "sqm", "acres", "hectares"] as const;
const currencies = ["BDT"] as const;
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


const requiredString = z.string().min(1, "This field is required");
const requiredNumber = z.coerce.number().min(1, "This field is required");

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





  imageFiles: z.any().optional(),

  videos: z.array(z.string().url("Must be a valid URL")).optional(),
  floorPlans: z.array(z.string().url("Must be a valid URL")).optional(),

  agent: z.string().optional(),
  managementCompany: z.string().optional(),
});

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

type PropertyFormData = z.infer<typeof propertyFormSchema>;

const STEPS = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Location" },
  { id: 3, name: "Details" },
  { id: 4, name: "Media" },
  { id: 5, name: "Features" },
  { id: 6, name: "Pricing & Terms" },
];

export function EditPropertyForm({ propertyId }: { propertyId: string }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const router = useRouter();


  const { data: property, isLoading: isFetching, isError } = useGetPropertyByIdQuery(propertyId);
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema) as any,
    defaultValues: {} as any,
    mode: "onBlur",
  });


  useEffect(() => {
    if (property) {
      setExistingImages(property.images || []);

      const formData = {
        ...property,
        listingType: property.listingType,


        availableFrom: (property as any).availableFrom ? (property as any).availableFrom.split('T')[0] : undefined,
        offerDeadline: (property as any).offerDeadline ? new Date((property as any).offerDeadline) : undefined,


        amenities: property.amenities || [],
        utilitiesIncluded: (property as any).utilitiesIncluded || [],
        tags: property.tags || [],
        videos: property.videos || [],
        floorPlans: property.floorPlans || [],
        imageFiles: [],
      };

      form.reset(formData as any);
    }
  }, [property, form]);

  const { watch, trigger } = form;
  const listingType = watch("listingType");

  const handleNext = async () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = await trigger(["title", "description", "listingType", "propertyType"]); break;
      case 2:
        isValid = await trigger(["address", "city", "neighborhood", "state", "country", "latitude", "longitude"]); break;
      case 3:
        isValid = await trigger(["bedrooms", "bathrooms", "areaSize", "areaUnit"]); break;
      case 4:
        isValid = true;

        break;
      case 5:
        isValid = true; break;
      case 6:
        isValid = await trigger(listingType === "rent" ? ["rentPrice", "currency", "availableFrom"] : ["salePrice", "currency", "propertyCondition"]);
        break;
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const handlePrevious = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async (data: any) => {
    try {
      const finalData: any = { ...data };


      if (finalData.listingType === 'rent' && finalData.availableFrom) {
        finalData.availableFrom = new Date(finalData.availableFrom).toISOString();
      }

      if (finalData.offerDeadline instanceof Date) {
        finalData.offerDeadline = finalData.offerDeadline.toISOString();
      } else {
        delete finalData.offerDeadline;
      }


      Object.keys(finalData).forEach(key => {
        if (finalData[key] === undefined || finalData[key] === null) {
          delete finalData[key];
        }
      });

      // Preserve existing images
      finalData.images = existingImages;
      delete finalData.imageFiles;

      Swal.fire({
        title: "Updating Property...",
        text: "Please wait while we update your property.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading(),
      });

      await updateProperty({ id: propertyId, data: finalData, images: newImages }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Property Updated!",
        text: "Your property details have been saved.",
        confirmButtonText: "View Property",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push(`/properties/${propertyId}`);
        }
      });

    } catch (error: any) {
      console.error('Update error:', error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error?.data?.message || "Failed to update property.",
        confirmButtonColor: "#d33",
      });
    }
  };

  if (isFetching) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (isError || !property) {
    return <div className="text-center py-20 text-red-500">Failed to load property details.</div>;
  }

  const onInvalid = () => {
    toast.error("Please fill in all required fields correctly.");
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
                {currentStep === 4 && (
                  <Step4
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                    newImages={newImages}
                    setNewImages={setNewImages}
                  />
                )}
                {currentStep === 5 && <Step5 />}
                {currentStep === 6 && <Step6 listingType={listingType} />}
              </div>

              <div className="mt-10 flex justify-between pt-6 border-t">
                <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                  Previous
                </Button>
                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={handleNext}>Next</Button>
                ) : (
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Property
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



function Step1() {
  const { control, watch, setValue } = useFormContext<PropertyFormData>();
  const listingType = watch("listingType");
  const propertyType = watch("propertyType");
  const availableTypes = listingType === "rent" ? RENT_PROPERTY_TYPES : SALE_PROPERTY_TYPES;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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
                    if (val === "rent") setValue("propertyType", "apartment");
                    else setValue("propertyType", "apartment");
                  }}
                  defaultValue={field.value}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <FormItem>
                    <FormControl><RadioGroupItem value="rent" className="peer sr-only" /></FormControl>
                    <FormLabel className="flex h-[52px] items-center justify-center gap-2 rounded-lg border bg-white px-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200 ease-in-out">
                      <span className="text-lg">🏠</span><span className="font-medium">Rent Out</span>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl><RadioGroupItem value="sale" className="peer sr-only" /></FormControl>
                    <FormLabel className="flex h-[52px] items-center justify-center gap-2 rounded-lg border bg-white px-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200 ease-in-out">
                      <span className="text-lg">🏷️</span><span className="font-medium">Sell Property</span>
                    </FormLabel>
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
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold text-gray-800">Property Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-[52px] shadow-sm"><SelectValue placeholder="Select Category" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize cursor-pointer">{type}</SelectItem>
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
              <Input placeholder="e.g. Modern Apartment" className="h-11 shadow-sm" {...field} />
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
              <Textarea placeholder="Describe the key features..." {...field} rows={5} className="resize-none shadow-sm" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function Step2() {
  const { control, watch, setValue } = useFormContext<PropertyFormData>();
  const watchedDivision = watch("state");
  const divisionOptions = getDivisionOptions();
  const districtOptions = getDistrictOptions(watchedDivision);


  const LocationMap = useMemo(() => dynamic(() => import("../add-property/LocationMap").then((mod) => mod.default), { ssr: false, loading: () => <div className="h-64 w-full bg-gray-200 animate-pulse" /> }), []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} disabled /></FormControl></FormItem>)} />
        <FormField control={control} name="state" render={({ field }) => (
          <FormItem>
            <FormLabel>State / Division</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={(val) => { field.onChange(val); setValue("city", ""); }}>
                <SelectTrigger><SelectValue placeholder="Select Division" /></SelectTrigger>
                <SelectContent>{divisionOptions.map((d) => <SelectItem key={d.value} value={d.value}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="city" render={({ field }) => (
          <FormItem>
            <FormLabel>District / City</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange} disabled={!watchedDivision}>
                <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                <SelectContent>{districtOptions.map((d) => <SelectItem key={d.value} value={d.value}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="neighborhood" render={({ field }) => (<FormItem><FormLabel>Area / Neighborhood</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
      </div>
      <FormField control={control} name="address" render={({ field }) => (<FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
      <div className="h-64 sticky top-0"><LocationMap /></div>
    </div>
  );
}

function Step3() {
  const { control, watch } = useFormContext<PropertyFormData>();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField control={control} name="bedrooms" render={({ field }) => (<FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
      <FormField control={control} name="bathrooms" render={({ field }) => (<FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
      <div className="flex gap-4">
        <FormField control={control} name="areaSize" render={({ field }) => (<FormItem className="flex-1"><FormLabel>Area Size</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={control} name="areaUnit" render={({ field }) => (<FormItem className="w-24"><FormLabel>Unit</FormLabel><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{areaUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></FormItem>)} />
      </div>
      <FormField control={control} name="yearBuilt" render={({ field }) => (<FormItem><FormLabel>Year Built (Optional)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl></FormItem>)} />
    </div>
  );
}

interface Step4Props {
  existingImages: string[];
  setExistingImages: (images: string[]) => void;
  newImages: File[];
  setNewImages: (files: File[]) => void;
}

function Step4({ existingImages, setExistingImages, newImages, setNewImages }: Step4Props) {
  const handleRemoveExisting = (indexToRemove: number) => {
    setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-1">Manage Property Images</h3>
        <p className="text-sm text-blue-600">
          You can remove existing images and upload new ones properly.
        </p>
      </div>

      {existingImages.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Existing Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((src, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden group border border-gray-200">
                <img
                  src={src}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Add New Images</label>
        <FormImageUpload
          value={newImages}
          onChange={setNewImages}
          maxFiles={10 - existingImages.length}
          label="Upload New Images"
        />
        <p className="text-xs text-gray-500">
          You can have a maximum of 10 images total. ({existingImages.length + newImages.length}/10)
        </p>
      </div>
    </div>
  );
}

function Step5() {
  const { control } = useFormContext<PropertyFormData>();
  return (
    <div className="space-y-6">
      <FormField control={control} name="amenities" render={() => (
        <FormItem>
          <FormLabel className="text-lg font-semibold">Amenities</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {amenitiesList.map((item) => (
              <FormField key={item} control={control} name="amenities" render={({ field }) => {
                return (
                  <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => {
                        return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value) => value !== item));
                      }} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">{item}</FormLabel>
                  </FormItem>
                );
              }} />
            ))}
          </div>
        </FormItem>
      )} />
    </div>
  );
}

function Step6({ listingType }: { listingType: "rent" | "sale" }) {
  const { control } = useFormContext<PropertyFormData>();

  if (listingType === "rent") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={control} name="rentPrice" render={({ field }) => (<FormItem><FormLabel>Monthly Rent</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={control} name="availableFrom" render={({ field }) => (<FormItem><FormLabel>Available From</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={control} name="petPolicy" render={({ field }) => (<FormItem><FormLabel>Pet Policy</FormLabel><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{petPolicies.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent></Select></FormItem>)} />
          <FormField control={control} name="smokingPolicy" render={({ field }) => (<FormItem><FormLabel>Smoking Policy</FormLabel><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{smokingPolicies.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent></Select></FormItem>)} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormField control={control} name="salePrice" render={({ field }) => (<FormItem><FormLabel>Sale Price</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="priceNegotiable" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel>Negotiable?</FormLabel><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
        <FormField control={control} name="mortgageAvailable" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel>Mortgage?</FormLabel><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
      </div>

      { }
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
  );
}
