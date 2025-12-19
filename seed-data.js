const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const LANDLORD = {
  name: "Landlord Three",
  email: "landlord3.demo@homeconnect.com",
  password: "Password123!",
  role: "landlord",
  phone: "+8801700000003"
};

const RENT_PROPERTIES = [
  {
    title: "Luxury Apartment in Gulshan",
    description: "A beautiful luxury apartment with city view, fully furnished and ready to move in. Includes gym and swimming pool access.",
    listingType: "rent",
    propertyType: "apartment",
    address: "Road 10, Gulshan 1, Dhaka North",
    city: "Dhaka",
    neighborhood: "Gulshan",
    state: "Dhaka Division",
    country: "Bangladesh",
    zipCode: "1212",
    latitude: 23.7925,
    longitude: 90.4078,
    bedrooms: 3,
    bathrooms: 3,
    areaSize: 2200,
    areaUnit: "sqft",
    amenities: ["Swimming Pool", "Gym", "Security", "Elevator", "Balcony"],
    features: [],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3"],
    rentPrice: 45000,
    currency: "BDT",
    isFurnished: true,
    availableFrom: new Date().toISOString(),
    petPolicy: "allowed",
    smokingPolicy: "not-allowed",
    minimumStay: 6
  },
  {
    title: "Cozy Studio in Banani",
    description: "Perfect for single professionals. Walking distance to offices and restaurants. High-speed internet included.",
    listingType: "rent",
    propertyType: "studio",
    address: "Block C, Banani, Dhaka North",
    city: "Dhaka",
    neighborhood: "Banani",
    state: "Dhaka Division",
    country: "Bangladesh",
    zipCode: "1213",
    latitude: 23.7940,
    longitude: 90.4043,
    bedrooms: 1,
    bathrooms: 1,
    areaSize: 600,
    areaUnit: "sqft",
    amenities: ["Internet", "Security", "Backup Generator"],
    features: [],
    images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3"],
    rentPrice: 20000,
    currency: "BDT",
    isFurnished: true,
    availableFrom: new Date().toISOString(),
    petPolicy: "not-allowed",
    smokingPolicy: "not-allowed",
    minimumStay: 3
  },
  {
    title: "Spacious Family House in Uttara",
    description: "Large 4-bedroom house with garden and garage. Quiet neighborhood, perfect for families.",
    listingType: "rent",
    propertyType: "house",
    address: "Sector 4, Uttara Model Town",
    city: "Dhaka",
    neighborhood: "Uttara",
    state: "Dhaka Division",
    country: "Bangladesh",
    zipCode: "1230",
    latitude: 23.8759,
    longitude: 90.3795,
    bedrooms: 4,
    bathrooms: 4,
    areaSize: 3000,
    areaUnit: "sqft",
    amenities: ["Garden", "Parking", "Balcony", "Security"],
    features: [],
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3"],
    rentPrice: 55000,
    currency: "BDT",
    isFurnished: false,
    availableFrom: new Date().toISOString(),
    petPolicy: "allowed",
    smokingPolicy: "allowed",
    minimumStay: 12
  },
  {
    title: "Modern Condo in Bashundhara",
    description: "Newly built condo with community features. Near Bashundhara R/A entrance.",
    listingType: "rent",
    propertyType: "condo",
    address: "Block A, Bashundhara R/A, Dhaka",
    city: "Dhaka",
    neighborhood: "Bashundhara R/A",
    state: "Dhaka Division",
    country: "Bangladesh",
    zipCode: "1229",
    latitude: 23.8191,
    longitude: 90.4526,
    bedrooms: 3,
    bathrooms: 3,
    areaSize: 1800,
    areaUnit: "sqft",
    amenities: ["Elevator", "Security", "Parking", "Community Hall"],
    features: [],
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3"],
    rentPrice: 35000,
    currency: "BDT",
    isFurnished: false,
    availableFrom: new Date().toISOString(),
    petPolicy: "case-by-case",
    smokingPolicy: "not-allowed",
    minimumStay: 12
  }
];

const SALE_PROPERTIES = [
  {
    title: "Elegant Villa in Baridhara",
    description: "Exclusive diplomatic zone villa. High security, premium finishing, imported fittings.",
    listingType: "sale",
    propertyType: "villa",
    address: "Park Road, Baridhara Diplomatic Zone",
    city: "Dhaka",
    neighborhood: "Baridhara",
    state: "Dhaka Division",
    country: "Bangladesh",
    zipCode: "1212",
    latitude: 23.8042,
    longitude: 90.4152,
    bedrooms: 5,
    bathrooms: 6,
    areaSize: 4500,
    areaUnit: "sqft",
    amenities: ["Swimming Pool", "Garden", "Parking", "Security", "Jacuzzi"],
    features: [],
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3"],
    salePrice: 65000000,
    currency: "BDT",
    priceNegotiable: true,
    mortgageAvailable: true,
    propertyCondition: "excellent",
    ownershipType: "freehold"
  },
  {
    title: "Affordable Flat in Mirpur",
    description: "Great value for money. Near Metro Rail station. Good community.",
    listingType: "sale",
    propertyType: "apartment",
    address: "Mirpur 10, Near Metro Station",
    city: "Dhaka",
    neighborhood: "Mirpur",
    state: "Dhaka Division",
    country: "Bangladesh",
    zipCode: "1216",
    latitude: 23.8071,
    longitude: 90.3686,
    bedrooms: 3,
    bathrooms: 2,
    areaSize: 1250,
    areaUnit: "sqft",
    amenities: ["Elevator", "Backup Generator", "Security"],
    features: [],
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3"],
    salePrice: 8500000,
    currency: "BDT",
    priceNegotiable: true,
    mortgageAvailable: true,
    propertyCondition: "good",
    ownershipType: "freehold"
  },
  {
    title: "Commercial Space in Dhanmondi",
    description: "Prime location for office or showroom. 2nd floor, roadside view.",
    listingType: "sale",
    propertyType: "commercial",
    address: "Road 27, Dhanmondi R/A",
    city: "Dhaka",
    neighborhood: "Dhanmondi",
    state: "Dhaka Division",
    country: "Bangladesh",
    zipCode: "1209",
    latitude: 23.7551,
    longitude: 90.3756,
    bedrooms: 2,
    bathrooms: 2,
    areaSize: 2500,
    areaUnit: "sqft",
    features: [],
    amenities: ["Elevator", "Parking", "Security", "Fire Safety"],
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3"],
    salePrice: 35000000,
    currency: "BDT",
    priceNegotiable: true,
    mortgageAvailable: false,
    propertyCondition: "good",
    ownershipType: "freehold"
  },
  {
    title: "Ready Flat in Mohammadpur",
    description: "Japan Garden City. Ready to move. Gated community with playground.",
    listingType: "sale",
    propertyType: "apartment",
    address: "Ring Road, Japan Garden City",
    city: "Dhaka",
    neighborhood: "Mohammadpur",
    state: "Dhaka Division",
    country: "Bangladesh",
    zipCode: "1207",
    latitude: 23.7662,
    longitude: 90.3582,
    bedrooms: 3,
    bathrooms: 3,
    areaSize: 1400,
    areaUnit: "sqft",
    amenities: ["Elevator", "Parking", "Mosque", "Super Shop"],
    features: [],
    images: ["https://images.unsplash.com/photo-1501183638710-841dd1904471?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1540518614846-7eded433c457?ixlib=rb-4.0.3"],
    salePrice: 11000000,
    currency: "BDT",
    priceNegotiable: false,
    mortgageAvailable: true,
    propertyCondition: "excellent",
    ownershipType: "condominium"
  }
];


async function downloadImage(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return new Blob([response.data], { type: 'image/jpeg' });
  } catch (error) {
    console.error("Error downloading image:", url);
    // Return a purely dummy blob if download fails
    return new Blob(["dummy"], { type: 'image/jpeg' });
  }
}

async function seed() {
  console.log("🚀 Starting seed process...");

  let token = null;

  // 1. Authenticate
  try {
    console.log(`Testing Login for ${LANDLORD.email}...`);
    // Login with axios is fine just for JSON
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: LANDLORD.email,
      password: LANDLORD.password
    });
    token = loginRes.data.data.token;
    console.log("✅ Logged in successfully.");
  } catch (err) {
    console.log("⚠️ Login failed. Trying to register...");
    try {
      const registerRes = await axios.post(`${BASE_URL}/auth/register`, LANDLORD);
      token = registerRes.data.data.token;
      console.log("✅ Registered successfully.");
    } catch (regErr) {
      console.error("❌ Registration failed:", regErr.response?.data || regErr.message);
      process.exit(1);
    }
  }

  // Helper to create property with FormData
  const createProperty = async (prop) => {
    const formData = new FormData();

    // Append fields
    Object.keys(prop).forEach(key => {
      if (key === 'images') return; // Handle images separately
      const value = prop[key];

      if (Array.isArray(value)) {
        // Backend likely expects stringified array for arrays in FormData
        // based on properties-api.ts logic
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    // Handle images
    // We only take the first image to save bandwidth/time or all? Let's try first 2.
    const imagesToUpload = prop.images.slice(0, 2);
    for (const url of imagesToUpload) {
      const imageBlob = await downloadImage(url);
      formData.append('images', imageBlob, 'property.jpg');
    }

    // Use fetch for multipart
    const response = await fetch(`${BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: Content-Type header is set automatically by fetch for FormData
      },
      body: formData
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || response.statusText);
    }
  };

  // 2. Create Rent Properties
  console.log("Creating Rent Properties...");
  for (const prop of RENT_PROPERTIES) {
    try {
      await createProperty(prop);
      console.log(`✅ Created Rent Property: ${prop.title}`);
    } catch (err) {
      console.error(`❌ Failed to create ${prop.title}:`, err.message);
    }
  }

  // 3. Create Sale Properties
  console.log("Creating Sale Properties...");
  for (const prop of SALE_PROPERTIES) {
    try {
      await createProperty(prop);
      console.log(`✅ Created Sale Property: ${prop.title}`);
    } catch (err) {
      console.error(`❌ Failed to create ${prop.title}:`, err.message);
    }
  }

  console.log("🎉 Seeding complete!");
}

seed();
