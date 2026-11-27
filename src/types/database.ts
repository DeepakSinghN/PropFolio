export type PropertyType = 
  | "Apartment" 
  | "Villa" 
  | "Penthouse" 
  | "Builder Floor" 
  | "Plot" 
  | "Commercial";

export type ListingType = "Sale" | "Rent";

export type PlanTier =
  | "free"
  | "pay_per_listing"
  | "solo_pro"
  | "builder_pro"
  | "agency_starter";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  slug: string; // for [slug].propertysnaps.in
  phone_number: string;
  email?: string;
  company_name?: string;
  city?: string;
  avatar_url?: string;
  plan_tier: PlanTier;
  listing_credits: number;
  plan_expires_at?: string | null;
  billing_cycle?: "monthly" | "yearly" | "one_time" | null;
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
  property_features?: Array<{ id: string; section: string; label: string; value: string }>;
  enquiry_form_url?: string;
  enquiry_form_gate?: boolean;
  status: "active" | "sold" | "draft";
  views_count: number;
  video_url?: string | null;
  created_at: string;
  updated_at: string;
  // Extended brochure fields (driven by spec)
  details?: Record<string, any>;
  super_built_up_sqft?: number;
  floor?: string;
  total_floors?: string | number;
  facing?: string;
  furnishing?: string;
  possession?: string;
  balcony?: string;
  kitchen?: string;
  wardrobes?: string;
  ac_count?: string | number;
  natural_light?: string;
  ventilation?: string;
  view?: string;
  property_age?: string;
  building_type?: string;
  society_description?: string;
  parking_covered?: string | number;
  parking_visitor?: string | number;
  lifts?: string;
  water_supply?: string;
  power_backup?: string;
  security?: string;
  maintenance_monthly?: string | number;
  is_negotiable?: boolean;
  rera_status?: string;
  rera_number?: string;
  title_status?: string;
  bank_loans?: string[];
  nearby?: Array<{ label: string; distance: string }>;
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
  super_built_up_sqft?: number;
  floor?: string;
  furnishing?: string;
  facing?: string;
  possession?: string;
  parking?: string;
  property_age?: string;
  price_amount: number;
  display_price: string;
  currency: string;
  location_city: string;
  location_locality: string;
  amenities: string[];
  ai_highlights: string[];
  ai_neighborhood_highlights: string[];
}

export interface PropertyCollection {
  id: string;
  broker_id: string;
  title: string;
  slug: string;
  description?: string;
  listing_slugs: string[];
  created_at: string;
  updated_at: string;
  views_count?: number;
}

