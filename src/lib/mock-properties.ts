export type ListingType = "rent" | "sale";

export interface PropertyDetails {
  id: string;
  title: string;
  city: string;
  neighborhood?: string;
  address?: string;
  price: number;
  currency?: string;
  listingType: ListingType;
  beds: number;
  baths: number;
  areaSize: number;
  areaUnit?: "sqft" | "sqm";
  imageUrl: string;
  description?: string;
  lat?: number;
  lng?: number;
}

export const MOCK_PROPERTIES: PropertyDetails[] = [
  {
    id: "r1",
    title: "Modern 2BR Apartment with City View",
    city: "Dhaka",
    neighborhood: "Gulshan",
    address: "Road 36, Gulshan-2",
    price: 1200,
    currency: "USD",
    listingType: "rent",
    beds: 2,
    baths: 2,
    areaSize: 950,
    areaUnit: "sqft",
    imageUrl: "/properties/1.jpg",
    description: "Stylish 2-bedroom apartment with great city views.",
    lat: 23.7925,
    lng: 90.4078,
  },
  {
    id: "r2",
    title: "Cozy Studio Near Metro",
    city: "Dhaka",
    neighborhood: "Banani",
    price: 700,
    currency: "USD",
    listingType: "rent",
    beds: 1,
    baths: 1,
    areaSize: 450,
    areaUnit: "sqft",
    imageUrl: "/properties/2.jpg",
    description: "Compact studio close to transit.",
    lat: 23.792,
    lng: 90.404,
  },
  {
    id: "s1",
    title: "Contemporary 3BR Condo",
    city: "Dhaka",
    neighborhood: "Banani",
    address: "House 12, Road 23",
    price: 320000,
    currency: "USD",
    listingType: "sale",
    beds: 3,
    baths: 2,
    areaSize: 1550,
    areaUnit: "sqft",
    imageUrl: "/properties/9.jpg",
    description: "Sunlit condo with private balcony.",
    lat: 23.7945,
    lng: 90.4043,
  },
  {
    id: "s2",
    title: "Family House with Garden",
    city: "Chattogram",
    neighborhood: "Khulshi",
    price: 450000,
    currency: "USD",
    listingType: "sale",
    beds: 4,
    baths: 3,
    areaSize: 2300,
    areaUnit: "sqft",
    imageUrl: "/properties/10.jpg",
    description: "Spacious family home.",
    lat: 22.3664,
    lng: 91.8114,
  },
  
  {
    id: "m1",
    title: "Modern 2BR Apartment with City View",
    city: "Dhaka",
    neighborhood: "Gulshan",
    price: 1200,
    currency: "USD",
    listingType: "rent",
    beds: 2,
    baths: 2,
    areaSize: 950,
    areaUnit: "sqft",
    imageUrl: "/properties/1.jpg",
    description: "Same as r1 for demo.",
    lat: 23.7925,
    lng: 90.4078,
  },
  {
    id: "m2",
    title: "Sunny 2BR Near Park",
    city: "Dhaka",
    neighborhood: "Dhanmondi",
    price: 950,
    currency: "USD",
    listingType: "rent",
    beds: 2,
    baths: 1,
    areaSize: 820,
    areaUnit: "sqft",
    imageUrl: "/properties/5.jpg",
    description: "Bright rooms near park.",
    lat: 23.7461,
    lng: 90.3733,
  },
  {
    id: "m3",
    title: "Modern Family Home with Garden",
    city: "Chattogram",
    neighborhood: "Khulshi",
    price: 320000,
    currency: "USD",
    listingType: "sale",
    beds: 4,
    baths: 3,
    areaSize: 2100,
    areaUnit: "sqft",
    imageUrl: "/properties/6.jpg",
    description: "Garden and parking included.",
    lat: 22.3664,
    lng: 91.8114,
  },
];