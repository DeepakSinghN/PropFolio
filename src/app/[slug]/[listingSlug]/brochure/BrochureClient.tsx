"use client";

import { useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Printer,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  Share2
} from "lucide-react";
import { getListingFromMemory, INITIAL_LISTINGS, DEMO_BROKER } from "@/lib/store";
import { Listing } from "@/types/database";

interface ClientProps {
  slug: string;
  listingSlug: string;
  initialListing?: Listing;
}

export default function BrochureClient({ slug, listingSlug, initialListing }: ClientProps) {
  const listing =
    initialListing ||
    getListingFromMemory(listingSlug) ||
    INITIAL_LISTINGS.find((l) => l.slug === listingSlug) ||
    INITIAL_LISTINGS[0];
  const broker = listing.broker || DEMO_BROKER;

  const photos =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : [
          {
            id: "1",
            photo_url:
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
            display_order: 1,
            is_cover: true,
            listing_id: listing.id,
            created_at: "",
          },
        ];

  const liveUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${broker.slug}/${listing.slug}`
      : `https://${broker.slug}.propfolio.co/${listing.slug}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    liveUrl
  )}`;

  return (
    <div className="min-h-screen bg-zinc-100 py-8 text-zinc-900 print:bg-white print:py-0 print:text-black">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between px-4 print:hidden">
        <Link
          href={`/${broker.slug}/${listing.slug}`}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Live Listing</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => window.print()}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 pointer-events-auto"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>Print or Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Brochure Page Container (A4 Printable Canvas) */}
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-xl print:max-w-none print:rounded-none print:border-none print:shadow-none">
        {/* Header Branding - Sotheby's Royal Dossier */}
        <div className="flex items-center justify-between border-b border-[#c5a059]/30 bg-[#0a1128] p-6 text-white sm:p-8">
          <div className="flex items-center gap-4">
            <img
              src={
                broker.avatar_url ||
                "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80"
              }
              alt={broker.full_name}
              className="h-16 w-16 rounded-2xl border-2 border-[#c5a059]/50 object-cover shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white">{broker.full_name}</h2>
                <ShieldCheck className="h-4 w-4 text-[#c5a059]" />
              </div>
              <p className="text-xs text-slate-300">{broker.company_name} · Exclusive Real Estate Advisory</p>
              <p className="mt-1 font-mono text-xs text-[#c5a059] font-bold">{broker.phone_number}</p>
            </div>
          </div>

          {/* QR Code to View Live */}
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 border border-white/15 p-3 text-center backdrop-blur-sm">
            <img src={qrCodeUrl} alt="Scan QR Code" className="h-16 w-16 rounded-lg bg-white p-1" />
            <span className="text-[10px] font-medium text-slate-200">Scan for Video & Photos</span>
          </div>
        </div>

        {/* Hero Photo & Secondary Grid */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
              <img
                src={photos[0]?.photo_url}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
              {photos.slice(1, 3).map((p, idx) => (
                <div key={idx} className="aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
                  <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Title & Key Specs Banner */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="inline-block rounded-md bg-[#fbf6ec] border border-[#e8d7b3] px-2.5 py-0.5 text-xs font-bold text-[#8a6828]">
                {listing.listing_type === "Sale" ? "FOR SALE" : "FOR RENT"} · {listing.property_type.toUpperCase()}
              </span>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0a1128]">
                {listing.title}
              </h1>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                <span>
                  {listing.location_locality}, {listing.location_city}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Offered At
              </span>
              <p className="text-3xl font-black text-emerald-600">{listing.display_price}</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-3 divide-x divide-zinc-200 rounded-2xl bg-zinc-50 p-4 text-center">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Bedrooms</span>
              <p className="mt-0.5 text-base font-bold text-zinc-900">
                {listing.bhk ? `${listing.bhk} BHK` : "Studio"}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Carpet Area</span>
              <p className="mt-0.5 text-base font-bold text-zinc-900">
                {listing.carpet_area_sqft ? `${listing.carpet_area_sqft} sq.ft` : "Spacious"}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Availability</span>
              <p className="mt-0.5 text-base font-bold text-emerald-600">Ready to Move</p>
            </div>
          </div>

          {/* 5 Key Highlights */}
          {listing.ai_highlights && listing.ai_highlights.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                  Key Residence Highlights
                </h3>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {listing.ai_highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 text-xs leading-relaxed"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-zinc-800">{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              Overview & Layout
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities Grid */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                Amenities & Inclusions
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {listing.amenities.map((am, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800"
                  >
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Call to Action */}
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center">
            <p className="text-xs font-bold text-zinc-800">
              For direct inquiries, private inspections, or negotiation:
            </p>
            <p className="mt-1 text-sm font-black text-zinc-900">
              Contact {broker.full_name} at {broker.phone_number}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-400">
              Digital listing verified on {liveUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

