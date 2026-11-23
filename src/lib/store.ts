import { Listing, Profile } from "@/types/database";

export const DEFAULT_BROKER: Profile = {
  id: "broker-default",
  user_id: "usr-default",
  full_name: "Real Estate Broker",
  slug: "broker",
  phone_number: "",
  company_name: "",
  city: "India",
  avatar_url: "/brand-logo.png",
  plan_tier: "solo_pro",
  listing_credits: 30,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_BROKER: Profile = DEFAULT_BROKER;

export const INITIAL_LISTINGS: Listing[] = [];

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
