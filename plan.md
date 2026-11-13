# PropFolio — Master Architecture & Implementation Plan

> **Working Title:** PropFolio  
> **Target Project Directory:** `c:\Users\dndee\OneDrive\Desktop\REA\real-estate`  
> **Core Concept:** AI-Powered Real Estate Micro-Site & Brochure Generator from WhatsApp / Web.  
> **Target Market:** Global Real Estate Brokers & Agencies (India, UAE/Dubai, US/UK, Southeast Asia).

---

## 1. Executive Summary & Product Vision

Real estate brokers and agents share properties primarily over chat applications (WhatsApp, Telegram, iMessage) using unstructured text (often in Hinglish or regional slang) accompanied by 10–25 uncompressed photos. This creates an unorganized, unprofessional buying experience.

**PropFolio solves this problem in under 60 seconds:**
1. **Input:** Broker sends photos and raw notes via WhatsApp bot or simple web dashboard.
2. **AI Processing:** Google Gemini parses unstructured notes into structured property specs, generates 5 selling highlights, and tags neighborhood perks.
3. **Media Pipeline:** Client-side and server-side image compression delivers lightning-fast mobile galleries.
4. **Output:** An instant, branded mobile micro-site (`[agent].propfolio.com/[listing-slug]`), a 1-click downloadable PDF brochure, and direct "Contact on WhatsApp" lead capture.
5. **Monetization:** Freemium SaaS with monthly credit quotas, agency team pooling, and multi-currency billing (INR, AED, USD).

---

## 2. Technology Stack

| Layer | Selected Technology | Why Chosen? |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15+ (App Router)** | Fullstack TypeScript, Server Components, Server Actions, and native Edge Middleware for subdomain multi-tenancy. |
| **Styling & UI** | **Tailwind CSS + Shadcn UI** | High-performance, modern, mobile-first design with accessible components. |
| **Icons** | **Lucide React** | Lightweight, modern icon library. |
| **Database & Auth** | **Supabase (PostgreSQL)** | Managed Postgres, Row Level Security (RLS), instant Auth, Edge Functions, and Realtime capabilities. |
| **Storage & CDN** | **Supabase Storage / Cloudflare R2** | Cost-effective object storage with global edge caching for compressed property photos. |
| **AI Engine** | **Google Gemini 2.5 Flash / 1.5 Flash** | Ultra-fast response time, superior multilingual/Hinglish comprehension, native JSON schema mode, and very low cost per listing. |
| **Messaging Engine** | **Meta WhatsApp Cloud API** | Direct official WhatsApp Graph API for webhooks, inbound photo processing, and automated link delivery. |
| **PDF Generation** | **@react-pdf/renderer** | High-fidelity, client/server PDF generation with custom broker branding and QR codes. |
| **Payments** | **Razorpay (India) + Stripe (Global)** | Multi-currency billing for INR, AED, and USD with webhook-driven credit resets. |

---

## 3. High-Level System Architecture

```
               ┌────────────────────────────────────────────────────────┐
               │                  BROKER INPUT CHANNELS                 │
               └───────────┬────────────────────────────────┬───────────┘
                           │ (WhatsApp Message + Photos)    │ (Web Dashboard Form)
                           ▼                                ▼
               ┌────────────────────────┐       ┌────────────────────────┐
               │ Meta WhatsApp Webhook  │       │ Next.js Server Actions │
               │ (/api/whatsapp/webhook)│       │  (/dashboard/new)      │
               └───────────┬────────────┘       └───────────┬────────────┘
                           │                                │
                           └────────────────┬───────────────┘
                                            ▼
                           ┌────────────────────────────────┐
                           │      AI Extraction Engine      │
                           │   (Google Gemini Structured)   │
                           └────────────────┬───────────────┘
                                            ▼
                           ┌────────────────────────────────┐
                           │   Media Optimizer & Storage    │
                           │ (Image Compression -> Storage) │
                           └────────────────┬───────────────┘
                                            ▼
                           ┌────────────────────────────────┐
                           │       PostgreSQL Database      │
                           │ (listings, photos, profiles)   │
                           └────────────────┬───────────────┘
                                            ▼
               ┌────────────────────────────────────────────────────────┐
               │                  OUTPUT & DISTRIBUTION                 │
               ├────────────────────────┬───────────────────────────────┤
               │ Branded Micro-Site     │ Downloadable PDF Brochure     │
               │ [broker].propfolio.com │ Branded deck with QR Code     │
               └────────────────────────┴───────────────────────────────┘
```

---

## 4. Complete Database Schema (Supabase / PostgreSQL)

```sql
-- 1. Profiles (Brokers & Agents)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- used for subdomain: [slug].propfolio.com
    phone_number TEXT NOT NULL UNIQUE,
    agency_id UUID,
    avatar_url TEXT,
    company_name TEXT,
    city TEXT,
    plan_tier TEXT DEFAULT 'free', -- 'free', 'solo_pro', 'agency_starter'
    listing_credits INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Agencies (Optional for teams)
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Listings (Properties)
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL, -- e.g. '3-bhk-satellite-ahmedabad'
    description TEXT,
    property_type TEXT DEFAULT 'Apartment', -- Apartment, Villa, Plot, Commercial
    listing_type TEXT DEFAULT 'Sale', -- Sale, Rent
    bhk INT,
    bedrooms INT,
    bathrooms INT,
    carpet_area_sqft INT,
    price_amount NUMERIC(15, 2) NOT NULL,
    display_price TEXT NOT NULL, -- e.g. '₹1.35 Cr' or '$450,000'
    currency TEXT DEFAULT 'INR',
    location_city TEXT NOT NULL,
    location_locality TEXT NOT NULL,
    address TEXT,
    amenities TEXT[] DEFAULT '{}',
    ai_highlights TEXT[] DEFAULT '{}',
    ai_neighborhood_highlights TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active', -- active, sold, draft
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(broker_id, slug)
);

-- 4. Listing Photos
CREATE TABLE listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. WhatsApp Inbound Sessions (State machine for WhatsApp bot)
CREATE TABLE whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    broker_id UUID REFERENCES profiles(id),
    state TEXT DEFAULT 'IDLE', -- IDLE, AWAITING_NOTES, AWAITING_PHOTOS, CONFIRMING
    current_listing_id UUID REFERENCES listings(id),
    temp_photos TEXT[] DEFAULT '{}',
    last_interaction TIMESTAMPTZ DEFAULT now()
);

-- 6. Subscriptions & Payments
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'razorpay', 'stripe'
    subscription_id TEXT NOT NULL,
    plan_tier TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. AI Parsing Engine & Prompt Specification

When notes are received from WhatsApp or Web Form, the backend calls Google Gemini (`gemini-2.5-flash` or `gemini-1.5-flash`) using strict JSON schema output.

### System Prompt:
```text
You are an expert real estate listing compiler. Your job is to analyze unstructured property notes provided by a real estate broker (written in English, Hindi, Hinglish, or shorthand notes) and convert them into clean, structured property specifications.

Rules:
1. Extract property type (Apartment, Penthouse, Villa, Builder Floor, Commercial, Plot).
2. Standardize price into both a raw integer and a polished display string (e.g., 13500000 -> "₹1.35 Cr", 450000 -> "$450,000").
3. Generate exactly 5 compelling, concise selling highlights (bullet points).
4. Extract 3 neighborhood perks (proximity to metro, schools, expressways, markets).
5. Ensure title is crisp and click-worthy (e.g., "Luxury 3 BHK Furnished Apartment in Satellite").
```

### JSON Schema Output:
```json
{
  "title": "string",
  "slug": "string",
  "property_type": "string",
  "listing_type": "Sale | Rent",
  "bhk": "number",
  "carpet_area_sqft": "number",
  "price_amount": "number",
  "display_price": "string",
  "currency": "INR | USD | AED",
  "location_city": "string",
  "location_locality": "string",
  "amenities": ["string"],
  "ai_highlights": ["string"],
  "ai_neighborhood_highlights": ["string"]
}
```

---

## 6. Directory Structure for `real-estate/`

```
real-estate/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── middleware.ts                 # Wildcard subdomain routing ([broker].domain.com)
├── public/
│   ├── favicon.ico
│   └── og-default.png
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, Signup, Forgot Password
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/          # Authenticated broker dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Dashboard home & analytics
│   │   │   ├── listings/
│   │   │   │   ├── page.tsx      # All properties list
│   │   │   │   └── new/page.tsx  # Add new listing form with AI
│   │   │   ├── settings/page.tsx # Profile, subdomain & logo
│   │   │   └── billing/page.tsx  # Plans & Razorpay/Stripe checkout
│   │   ├── (public)/             # Main landing page & static pages
│   │   │   ├── page.tsx          # PropFolio marketing homepage
│   │   │   ├── pricing/page.tsx
│   │   │   └── terms/page.tsx
│   │   ├── [slug]/               # Subdomain / Broker public page
│   │   │   ├── page.tsx          # Broker's public website & collection
│   │   │   └── [listingSlug]/    # Public listing detail page
│   │   │       ├── page.tsx      # Full gallery, details & WhatsApp lead CTA
│   │   │       └── pdf/route.ts  # Dynamic PDF brochure download
│   │   └── api/
│   │       ├── ai/generate/route.ts       # Gemini AI listing extraction API
│   │       ├── whatsapp/webhook/route.ts  # Meta WhatsApp Cloud webhook
│   │       └── payments/webhook/route.ts  # Razorpay & Stripe webhooks
│   ├── components/
│   │   ├── ui/                   # Button, Dialog, Card, Input, Toast
│   │   ├── dashboard/            # MetricsCard, ListingTable, PlanCard
│   │   ├── listing/              # PhotoGallery, AmenitiesGrid, LeadButton
│   │   └── pdf/                  # BrochureTemplate.tsx (@react-pdf)
│   ├── lib/
│   │   ├── supabase/             # Client, Server, and Admin Supabase clients
│   │   ├── gemini.ts             # Google Gemini API wrapper
│   │   ├── whatsapp.ts           # WhatsApp Cloud API sender
│   │   ├── image-compression.ts  # Browser-side canvas resizer
│   │   └── utils.ts
│   └── types/
│       ├── database.ts
│       └── listing.ts
```

---

## 7. Subdomain Multi-Tenancy Architecture

In `middleware.ts`, incoming requests are inspected:

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Define root domain (e.g., propfolio.co or localhost:3000)
  const currentHost = hostname.replace(`:${url.port}`, "");
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  // Check if request is on a custom broker subdomain (e.g. ramesh.propfolio.co)
  if (currentHost !== rootDomain && currentHost.endsWith(rootDomain)) {
    const subdomain = currentHost.replace(`.${rootDomain}`, "");
    // Rewrite internal URL to /[subdomain]/path
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }

  return NextResponse.next();
}
```

---

## 8. Implementation Roadmap (Step-by-Step Procedure)

### Phase 1: Environment & Project Scaffolding
- [ ] Initialize Next.js 15+ TypeScript project inside `real-estate/`.
- [ ] Install Tailwind CSS, Lucide React, and essential Shadcn UI primitives.
- [ ] Set up Supabase project and execute initial SQL schema.
- [ ] Configure `.env.local` with Supabase, Gemini, and Root Domain variables.

### Phase 2: Broker Dashboard & AI Web Creator (MVP Core)
- [ ] Build Authentication (Supabase Auth: Email + Password / Magic Link).
- [ ] Build Broker Profile Setup (Assign unique `slug`, phone number, company name).
- [ ] Create `/dashboard/listings/new` with:
  - Raw notes input textarea.
  - Gemini API route (`/api/ai/generate`) to convert notes to structured JSON.
  - Multi-photo uploader with client-side canvas compression.
  - Preview card before publishing.

### Phase 3: Public Micro-Site & Subdomain Routing
- [ ] Configure `middleware.ts` for wildcard subdomains (`*.propfolio.com`).
- [ ] Build high-converting mobile listing page (`/[slug]/[listingSlug]`):
  - Full-screen swipeable photo gallery.
  - Formatted property stats (BHK, carpet area, price).
  - 5 AI Highlights & Neighborhood cards.
  - Prominent "Chat on WhatsApp" & "Call Agent" floating buttons with pre-filled enquiry text.

### Phase 4: 1-Click PDF Brochure Generator
- [ ] Implement `@react-pdf/renderer` template.
- [ ] Add Agent Branding (Logo, Agent photo, RERA number, Phone).
- [ ] Embed dynamically generated QR code that links back to the live listing.
- [ ] Expose route `/[slug]/[listingSlug]/pdf` for instantaneous client downloads.

### Phase 5: WhatsApp Cloud API Bot
- [ ] Register Meta Developer App & WhatsApp Business Cloud API.
- [ ] Implement Webhook verification & receiver (`/api/whatsapp/webhook`).
- [ ] Handle photo attachments and incoming text notes.
- [ ] Trigger AI extraction -> insert listing -> return instant live link via WhatsApp template.

### Phase 6: Subscriptions & Billing
- [ ] Integrate Razorpay for Indian UPI / NetBanking / Cards.
- [ ] Integrate Stripe for International USD / AED card subscriptions.
- [ ] Enforce quota tracking: 1 free listing on signup, then require upgrade to Solo Pro (₹499 / $29 / 99 AED).

---

## 9. Immediate Next Step

To begin implementation inside this folder:
1. Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` inside `c:\Users\dndee\OneDrive\Desktop\REA\real-estate`.
2. Connect your Supabase credentials in `.env.local`.
3. Build the core listing model and AI generator!

