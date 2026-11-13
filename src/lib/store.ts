import { Listing, Profile } from "@/types/database";

export const DEMO_BROKER: Profile = {
  id: "demo-broker-1",
  user_id: "demo-user-1",
  full_name: "Ramesh Shah",
  slug: "ramesh",
  phone_number: "+919876543210",
  company_name: "Shah Realty Group",
  city: "Ahmedabad",
  avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
  plan_tier: "solo_pro",
  listing_credits: 28,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: "sample-1",
    broker_id: "demo-broker-1",
    title: "Luxurious 3 BHK Furnished Flat in Satellite",
    slug: "3-bhk-satellite-ahmedabad",
    description: "Welcome to this immaculate 3-bedroom luxury residence situated in the high-demand enclave of Satellite, Ahmedabad. Boasting 1,750 sq.ft of well-appointed living space, the flat features Italian marble flooring, a modern modular kitchen, and spacious balconies offering panoramic city skyline views.\n\nPositioned in an upscale gated complex with only two residences per floor, you enjoy total privacy alongside premium community amenities including round-the-clock surveillance, dedicated reserved covered parking, and an expansive clubhouse.",
    property_type: "Apartment",
    listing_type: "Sale",
    bhk: 3,
    bedrooms: 3,
    bathrooms: 3,
    carpet_area_sqft: 1750,
    price_amount: 13500000,
    display_price: "₹1.35 Cr",
    currency: "INR",
    location_city: "Ahmedabad",
    location_locality: "Satellite, Near ISRO",
    amenities: ["Lift", "Covered Parking", "24/7 Security", "Gym", "Power Backup", "Clubhouse"],
    ai_highlights: [
      "1,750 sq.ft carpet with premium Italian marble flooring",
      "Corner apartment with superior cross-ventilation and natural daylight",
      "Fully modular kitchen with branded built-in appliances",
      "Reserved covered parking with high-speed automatic elevators",
      "Immediate possession — 100% ready to move"
    ],
    ai_neighborhood_highlights: [
      "5 minutes to upcoming Metro station",
      "Direct access to SG Highway & 132ft Ring Road",
      "Top schools & multispeciality hospitals within 1.5 km"
    ],
    status: "active",
    views_count: 142,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    photos: [
      {
        id: "p1",
        listing_id: "sample-1",
        photo_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
        display_order: 1,
        is_cover: true,
        created_at: new Date().toISOString()
      },
      {
        id: "p2",
        listing_id: "sample-1",
        photo_url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80",
        display_order: 2,
        is_cover: false,
        created_at: new Date().toISOString()
      },
      {
        id: "p3",
        listing_id: "sample-1",
        photo_url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
        display_order: 3,
        is_cover: false,
        created_at: new Date().toISOString()
      }
    ],
    broker: DEMO_BROKER,
  }
];

const clientRuntimeListings = new Map<string, Listing>();
INITIAL_LISTINGS.forEach(l => clientRuntimeListings.set(l.slug, l));

export function saveListingToMemory(listing: Listing) {
  clientRuntimeListings.set(listing.slug, listing);
}

export function getListingFromMemory(slug: string): Listing | undefined {
  return clientRuntimeListings.get(slug);
}

export function getAllMemoryListings(): Listing[] {
  return Array.from(clientRuntimeListings.values());
}
