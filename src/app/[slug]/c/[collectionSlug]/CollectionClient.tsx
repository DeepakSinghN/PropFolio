"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Eye,
  CheckCircle2,
  Share2,
  Phone,
  MessageCircle,
  ArrowUpRight,
  Sparkles,
  Bed,
  Maximize2,
  Check,
  BadgeCheck,
  ChevronRight,
  Layers,
  Calendar
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Listing, Profile, PropertyCollection } from "@/types/database";

interface Props {
  collection: PropertyCollection;
  listings: Listing[];
  broker: Profile;
}

const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80";

export default function CollectionClient({ collection, listings, broker }: Props) {
  const [copiedShare, setCopiedShare] = useState(false);

  // Price Range & Stats
  const prices = listings.map((l) => l.price_amount).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  function formatShortINR(amount: number) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  const priceRangeStr =
    prices.length > 1
      ? `${formatShortINR(minPrice)} – ${formatShortINR(maxPrice)}`
      : prices.length === 1
      ? formatShortINR(minPrice)
      : "Price on Request";

  // Unique localities
  const localities = Array.from(
    new Set(listings.map((l) => l.location_locality).filter(Boolean))
  );

  const handleShare = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: collection.title,
        text: `Explore curated property collection: ${collection.title} by ${broker.full_name}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const generalWaText = encodeURIComponent(
    `Hi ${broker.full_name}, I am viewing your curated collection "${collection.title}". I would like to schedule site visits for these properties.`
  );
  const generalWaLink = `https://wa.me/${broker.phone_number.replace(/\D/g, "")}?text=${generalWaText}`;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-28 text-[#0a1128] antialiased selection:bg-[#c5a059]/20 selection:text-[#0a1128] dark:bg-[#070b14] dark:text-slate-100">
      
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f8f9fa]/95 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#070b14]/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3.5 sm:px-6">
          
          {/* Broker Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
            <div className="relative shrink-0">
              <img
                src={broker.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80"}
                alt={broker.full_name}
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80";
                }}
                className="h-10 w-10 rounded-full border border-[#c5a059]/40 object-cover ring-2 ring-white shadow-sm dark:border-[#c5a059]/30 dark:ring-slate-900"
              />
              <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white ring-2 ring-white dark:ring-slate-900">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-[#0a1128] dark:text-white truncate">
                  {broker.full_name}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2 py-0.5 text-[10px] font-semibold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37] shrink-0">
                  <BadgeCheck className="h-3 w-3 text-[#c5a059]" />
                  Verified Broker
                </span>
                <BadgeCheck className="h-3.5 w-3.5 sm:hidden text-[#c5a059] shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {broker.company_name || "Exclusive Advisory"} · {broker.city || "Representative"}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle />

            <button
              onClick={handleShare}
              type="button"
              aria-label="Share Collection"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0a1128] shadow-sm transition hover:border-[#c5a059] hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-[#0f182e] dark:text-slate-300 pointer-events-auto"
            >
              {copiedShare ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </button>

            <a
              href={`tel:${broker.phone_number}`}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1128] shadow-sm transition hover:border-[#c5a059] dark:border-slate-800 dark:bg-[#0f182e] dark:text-slate-200"
            >
              <Phone className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Call Broker</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. COLLECTION HERO BANNER */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50/50 py-8 sm:py-12 dark:border-slate-800/80 dark:from-[#090e1c] dark:via-[#090e1c] dark:to-[#070b14]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
                  <Layers className="h-3.5 w-3.5 text-[#c5a059]" />
                  Curated Client Portfolio
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {listings.length} Properties
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0a1128] dark:text-white leading-tight">
                {collection.title}
              </h1>

              {collection.description && (
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {collection.description}
                </p>
              )}

              {/* Badges / Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                  <span className="text-slate-400">Budget:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{priceRangeStr}</span>
                </div>

                {localities.length > 0 && (
                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{localities.join(" · ")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Bulk Inquiry Button */}
            <div className="shrink-0 flex items-center gap-3">
              <a
                href={generalWaLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>Schedule Visits (All Properties)</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CURATED PROPERTIES GRID */}
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item, idx) => {
            const coverPhoto = item.photos?.[0]?.photo_url || FALLBACK_PHOTO;
            const itemUrl = `/${broker.slug || "broker"}/${item.slug}`;
            const itemWaText = encodeURIComponent(
              `Hi ${broker.full_name}, I am viewing your curated collection "${collection.title}" and specifically interested in: "${item.title}" (${item.display_price}). Can we arrange a site visit?`
            );
            const itemWaLink = `https://wa.me/${broker.phone_number.replace(/\D/g, "")}?text=${itemWaText}`;

            return (
              <div
                key={item.id || idx}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition hover:border-[#c5a059]/50 hover:shadow-xl dark:border-slate-800 dark:bg-[#0c1222]"
              >
                <div>
                  {/* Photo with Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={coverPhoto}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_PHOTO;
                      }}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-[#0a1128]/85 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        FOR {item.listing_type ? item.listing_type.toUpperCase() : "SALE"}
                      </span>
                      <span className="rounded-full bg-[#0a1128]/90 border border-[#c5a059]/40 px-2.5 py-0.5 text-[10px] font-semibold text-[#d4af37] backdrop-blur-md">
                        {item.property_type}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 rounded-full bg-[#0a1128]/80 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                      #{idx + 1} of {listings.length}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3 text-[#c5a059] shrink-0" />
                      <span className="truncate">{item.location_locality}, {item.location_city}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#0a1128] dark:text-white leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Price & Specs */}
                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                          {item.display_price}
                        </span>
                        {item.carpet_area_sqft && (
                          <span className="block text-[10px] text-slate-400">
                            {item.carpet_area_sqft.toLocaleString()} sq.ft
                          </span>
                        )}
                      </div>

                      <div className="text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.bhk ? `${item.bhk} BHK` : ""}
                      </div>
                    </div>

                    {/* Highlights Preview */}
                    {item.ai_highlights && item.ai_highlights.length > 0 && (
                      <div className="mt-2 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        {item.ai_highlights.slice(0, 2).map((h, i) => (
                          <p key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 truncate">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{h}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    href={itemUrl}
                    target="_blank"
                    className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-[#0a1128] transition hover:border-[#c5a059] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <span>View Micro-Site</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>

                  <a
                    href={itemWaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                  >
                    <MessageCircle className="h-3.5 w-3.5 fill-white" />
                    <span>Inquire</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. FOOTER NOTE */}
        <div className="mt-12 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
          <Building2 className="mx-auto h-8 w-8 text-[#c5a059]" />
          <h3 className="mt-3 text-lg font-bold text-[#0a1128] dark:text-white">
            Custom Property Portfolio Curated by {broker.full_name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            All properties are verified for clear legal title, direct developer/owner access, and immediate site visit coordination.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${broker.phone_number}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-bold text-[#0a1128] transition hover:border-[#c5a059] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <Phone className="h-4 w-4 text-[#c5a059]" />
              <span>Call: {broker.phone_number}</span>
            </a>

            <a
              href={generalWaLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              <span>WhatsApp Advisory</span>
            </a>
          </div>
        </div>
      </main>

    </div>
  );
}

