-- ========================================================
-- PropFolio Master Database Schema
-- Run this in Supabase Dashboard -> SQL Editor
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Brokers / Agents)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- used for subdomain: [slug].propfolio.co
    phone_number TEXT NOT NULL UNIQUE,
    company_name TEXT,
    city TEXT,
    avatar_url TEXT,
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'solo_pro', 'agency_starter')),
    listing_credits INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for instant subdomain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);

-- 2. Listings Table (Properties)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    property_type TEXT DEFAULT 'Apartment',
    listing_type TEXT DEFAULT 'Sale',
    bhk INT,
    bedrooms INT,
    bathrooms INT,
    carpet_area_sqft INT,
    price_amount NUMERIC(15, 2) NOT NULL,
    display_price TEXT NOT NULL,
    currency TEXT DEFAULT 'INR',
    location_city TEXT NOT NULL,
    location_locality TEXT NOT NULL,
    address TEXT,
    amenities TEXT[] DEFAULT '{}',
    ai_highlights TEXT[] DEFAULT '{}',
    ai_neighborhood_highlights TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft')),
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(broker_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_listings_broker_slug ON public.listings(broker_id, slug);

-- 3. Listing Photos Table
CREATE TABLE IF NOT EXISTS public.listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_photos_listing ON public.listing_photos(listing_id);

-- 4. WhatsApp Inbound Sessions (Bot State Machine)
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    broker_id UUID REFERENCES public.profiles(id),
    state TEXT DEFAULT 'IDLE',
    current_listing_id UUID REFERENCES public.listings(id),
    temp_photos TEXT[] DEFAULT '{}',
    last_interaction TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- Row Level Security (RLS) Policies
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read (for public subdomains), only owner can update
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Listings: Active listings viewable by everyone; owners can manage
CREATE POLICY "Active listings are viewable by everyone" 
ON public.listings FOR SELECT USING (status = 'active' OR auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = listings.broker_id
));

CREATE POLICY "Brokers can manage their own listings" 
ON public.listings FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = listings.broker_id
));

-- Listing Photos: Public viewable, owner can manage
CREATE POLICY "Listing photos viewable by everyone" 
ON public.listing_photos FOR SELECT USING (true);

CREATE POLICY "Brokers can manage photos of their listings" 
ON public.listing_photos FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM public.profiles p 
    JOIN public.listings l ON l.broker_id = p.id 
    WHERE l.id = listing_photos.listing_id
));

-- ========================================================
-- Storage Buckets Setup
-- ========================================================
-- Run this in Storage settings or SQL:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

