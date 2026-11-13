export type PropertyType = 
  | "Apartment" 
  | "Villa" 
  | "Penthouse" 
  | "Builder Floor" 
  | "Plot" 
  | "Commercial";

export type ListingType = "Sale" | "Rent";

export type PlanTier = "free" | "solo_pro" | "agency_starter";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  slug: string; // for [slug].propfolio.co
  phone_number: string;
  company_name?: string;
  city?: string;
  avatar_url?: string;
  plan_tier: PlanTier;
  listing_credits: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  broker_id: string;
  title: string;
  slug: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  bhk?: number;
  bedrooms?: number;
  bathrooms?: number;
  carpet_area_sqft?: number;
  price_amount: number;
  display_price: string;
  currency: string;
  location_city: string;
  location_locality: string;
  address?: string;
  amenities: string[];
  ai_highlights: string[];
  ai_neighborhood_highlights: string[];
  status: "active" | "sold" | "draft";
  views_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  photos?: ListingPhoto[];
  broker?: Profile;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  photo_url: string;
  display_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface ParsedPropertyData {
  title: string;
  slug: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  bhk?: number;
  bedrooms?: number;
  bathrooms?: number;
  carpet_area_sqft?: number;
  price_amount: number;
  display_price: string;
  currency: string;
  location_city: string;
  location_locality: string;
  amenities: string[];
  ai_highlights: string[];
  ai_neighborhood_highlights: string[];
}

