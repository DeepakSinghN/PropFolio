import { PlanTier } from "@/types/database";

export type BillingCycle = "monthly" | "yearly" | "one_time";
export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED";

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  badge: string;
  description: string;
  maxListings: number; // 0 = unlimited
  isUnlimitedListings: boolean;
  maxPhotosPerListing: number; // 0 = unlimited
  isUnlimitedPhotos: boolean;
  allowVideos: boolean;
  allowPdfBrochure: boolean;
  removeWatermark: boolean;
  allowCustomSubdomain: boolean;
  maxCollections: number; // 0 = unlimited when isUnlimitedCollections=true
  isUnlimitedCollections: boolean;
  validityDays: number; // 30 for monthly/free/pay_per_listing, 365 for yearly
  monthlyPriceInr: number;
  yearlyPriceInr: number;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number;
}

export const CURRENCY_RATES: Record<
  CurrencyCode,
  { symbol: string; label: string; rateFromUsd: number }
> = {
  INR: { symbol: "₹", label: "INR (₹)", rateFromUsd: 1 }, // Uses exact INR pricing
  USD: { symbol: "$", label: "USD ($)", rateFromUsd: 1 },
  EUR: { symbol: "€", label: "EUR (€)", rateFromUsd: 0.92 },
  GBP: { symbol: "£", label: "GBP (£)", rateFromUsd: 0.79 },
  AED: { symbol: "AED ", label: "AED", rateFromUsd: 3.67 },
};

export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    badge: "30-Day Starter",
    description:
      "Try turning a WhatsApp message or listing form into a clean property page.",
    maxListings: 1,
    isUnlimitedListings: false,
    maxPhotosPerListing: 4,
    isUnlimitedPhotos: false,
    allowVideos: false,
    allowPdfBrochure: false,
    removeWatermark: false,
    allowCustomSubdomain: false,
    maxCollections: 0,
    isUnlimitedCollections: false,
    validityDays: 30,
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
  },
  pay_per_listing: {
    id: "pay_per_listing",
    name: "Pay Per Listing",
    badge: "No Subscription",
    description:
      "Only have 1–2 properties to market? Pay ₹99 per listing for 30 days. Zero recurring commitment.",
    maxListings: 1,
    isUnlimitedListings: false,
    maxPhotosPerListing: 10,
    isUnlimitedPhotos: false,
    allowVideos: false,
    allowPdfBrochure: true,
    removeWatermark: false,
    allowCustomSubdomain: false,
    maxCollections: 1,
    isUnlimitedCollections: false,
    validityDays: 30,
    monthlyPriceInr: 99,
    yearlyPriceInr: 99,
    monthlyPriceUsd: 1.07,
    yearlyPriceUsd: 1.07,
  },
  solo_pro: {
    id: "solo_pro",
    name: "Solo Broker",
    badge: "Most Popular for Brokers",
    description:
      "Designed for active property consultants who want branded links, PDFs, videos, and faster closures.",
    maxListings: 20,
    isUnlimitedListings: false,
    maxPhotosPerListing: 20,
    isUnlimitedPhotos: false,
    allowVideos: true,
    allowPdfBrochure: true,
    removeWatermark: true,
    allowCustomSubdomain: true,
    maxCollections: 10,
    isUnlimitedCollections: false,
    validityDays: 30,
    monthlyPriceInr: 699,
    yearlyPriceInr: 6990, // 2 months free
    monthlyPriceUsd: 7.53,
    yearlyPriceUsd: 75.3,
  },
  builder_pro: {
    id: "builder_pro",
    name: "Builder Pro",
    badge: "High-Volume & Developers",
    description:
      "Built for builders, developers, and high-volume brokers managing large inventories with unlimited media.",
    maxListings: 60,
    isUnlimitedListings: false,
    maxPhotosPerListing: 0,
    isUnlimitedPhotos: true,
    allowVideos: true,
    allowPdfBrochure: true,
    removeWatermark: true,
    allowCustomSubdomain: true,
    maxCollections: 0,
    isUnlimitedCollections: true,
    validityDays: 30,
    monthlyPriceInr: 1999,
    yearlyPriceInr: 19990, // 2 months free
    monthlyPriceUsd: 21.54,
    yearlyPriceUsd: 215.4,
  },
  agency_starter: {
    id: "agency_starter",
    name: "Agency Pro",
    badge: "For Real Estate Teams",
    description:
      "For agencies and brokerages managing multiple agents, custom domains, and white-label client sharing.",
    maxListings: 0,
    isUnlimitedListings: true,
    maxPhotosPerListing: 0,
    isUnlimitedPhotos: true,
    allowVideos: true,
    allowPdfBrochure: true,
    removeWatermark: true,
    allowCustomSubdomain: true,
    maxCollections: 0,
    isUnlimitedCollections: true,
    validityDays: 365,
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
  },
};

/**
 * Normalize legacy or short plan tier names to canonical PlanTier.
 */
export function normalizePlanTier(rawTier?: string | null): PlanTier {
  const t = (rawTier || "free").toLowerCase().trim();
  if (t === "pro" || t === "solo_pro") return "solo_pro";
  if (t === "builder" || t === "builder_pro") return "builder_pro";
  if (t === "agency" || t === "agency_starter" || t === "agency_pro") return "agency_starter";
  if (t === "pay_per_listing") return "pay_per_listing";
  return "free";
}

/**
 * Check if a subscription/plan expiry timestamp has passed.
 */
export function isPlanExpired(planExpiresAt?: string | null): boolean {
  if (!planExpiresAt) return false;
  const expMs = new Date(planExpiresAt).getTime();
  if (Number.isNaN(expMs)) return false;
  return expMs < Date.now();
}

/**
 * Resolve the effective plan definition for a broker profile,
 * automatically treating expired paid plans as downgraded to "free".
 */
export function getEffectivePlan(profile?: {
  plan_tier?: string | null;
  plan_expires_at?: string | null;
  listing_credits?: number | null;
}): {
  tier: PlanTier;
  plan: PlanDefinition;
  expired: boolean;
  effectiveCredits: number;
} {
  const rawTier = normalizePlanTier(profile?.plan_tier);
  const expired = isPlanExpired(profile?.plan_expires_at);

  if (expired && rawTier !== "free") {
    const freePlan = PLAN_DEFINITIONS.free;
    return {
      tier: "free",
      plan: freePlan,
      expired: true,
      effectiveCredits: freePlan.maxListings,
    };
  }

  const plan = PLAN_DEFINITIONS[rawTier];
  const effectiveCredits = plan.isUnlimitedListings
    ? 999
    : rawTier === "pay_per_listing"
      ? Math.max(1, profile?.listing_credits ?? 1)
      : Math.max(plan.maxListings, profile?.listing_credits ?? plan.maxListings);

  return {
    tier: rawTier,
    plan,
    expired,
    effectiveCredits,
  };
}

/**
 * Compute new expiry ISO timestamp from today for a plan + billing cycle.
 */
export function computePlanExpiryIso(
  planTier: PlanTier,
  billingCycle: BillingCycle = "monthly"
): string {
  const days =
    planTier === "free" || planTier === "pay_per_listing"
      ? 30
      : billingCycle === "yearly"
        ? 365
        : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Format a plan price into the user's selected display currency.
 */
export function formatPlanPrice(
  inrAmount: number,
  usdAmount: number,
  currency: CurrencyCode
): string {
  if (inrAmount === 0 && usdAmount === 0) {
    return currency === "INR" ? "₹0" : `${CURRENCY_RATES[currency].symbol}0`;
  }
  if (currency === "INR") {
    return `₹${inrAmount.toLocaleString("en-IN")}`;
  }
  const cfg = CURRENCY_RATES[currency];
  const converted = usdAmount * cfg.rateFromUsd;
  const formatted =
    converted >= 100
      ? Math.round(converted).toLocaleString("en-US")
      : converted.toFixed(2);
  return `${cfg.symbol}${formatted}`;
}

