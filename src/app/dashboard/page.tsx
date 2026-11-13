"use client";

import Link from "next/link";
import {
  Sparkles,
  Building2,
  Eye,
  PlusCircle,
  ArrowUpRight,
  Copy,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Check,
  Layers,
  Wallet
} from "lucide-react";
import { getAllMemoryListings, DEMO_BROKER } from "@/lib/store";
import { useState, useEffect } from "react";
import { Listing } from "@/types/database";

const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80";

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>(getAllMemoryListings());
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [broker, setBroker] = useState<any>(DEMO_BROKER);

  useEffect(() => {
    // 1. Fetch current auth user
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setBroker({
            ...DEMO_BROKER,
            full_name: data.user.full_name || DEMO_BROKER.full_name,
            phone_number: data.user.phone_number || data.user.phone || DEMO_BROKER.phone_number,
            company_name: data.user.company_name || DEMO_BROKER.company_name,
            city: data.user.city || DEMO_BROKER.city,
            slug: data.user.slug || DEMO_BROKER.slug,
          });
        }
      })
      .catch(() => {});

    // 2. Fetch fresh listings
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.listings && data.listings.length > 0) {
          setListings(data.listings);
        }
      })
      .catch((err) => console.warn("Failed to fetch fresh listings:", err));
  }, []);

  function copyLink(slug: string) {
    if (typeof window === "undefined") return;
    const fullUrl = `${window.location.origin}/${broker.slug}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  // Broker metrics
  const planLimit = broker.plan_limit || 30;
  const remainingListings = Math.max(0, planLimit - listings.length);
  const totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0);
  const totalPortfolioValue = listings.reduce((sum, l) => sum + (l.price_amount || 0), 0);

  function formatPortfolioValue(amount: number) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-[#0a1128] transition-colors dark:bg-[#070b14] dark:text-slate-100">
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        
        {/* Broker Welcome Banner */}
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#0c1222]">
          <div className="flex items-center gap-4">
            <img
              src={broker.avatar_url}
              alt={broker.full_name}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80";
              }}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl border-2 border-white object-cover shadow-sm dark:border-slate-800"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#0a1128] sm:text-2xl dark:text-white truncate">
                  {broker.full_name}
                </h1>
                <span className="rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2 py-0.5 text-[10px] font-semibold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
                  Verified Broker
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                {broker.company_name} · {broker.city} ·{" "}
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {broker.slug}.propfolio.co
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/listings/new"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#0a1128] px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-md border border-[#c5a059]/40 transition hover:bg-[#16234b] active:scale-95 dark:bg-[#c5a059] dark:text-[#0a1128]"
            >
              <Sparkles className="h-4 w-4 text-[#c5a059] dark:text-[#0a1128]" />
              <span>Create New Listing</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Active Listings</span>
              <Building2 className="h-4 w-4 text-[#c5a059]" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-[#0a1128] dark:text-white">
              {listings.length}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 truncate">All live on public links</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Buyer Views</span>
              <Eye className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-[#0a1128] dark:text-white">
              {totalViews}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span>+34% this week</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Listings Remaining</span>
              <Layers className="h-4 w-4 text-[#c5a059]" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-[#0a1128] dark:text-white">
              {remainingListings} Left
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {listings.length} of {planLimit} plan used
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Portfolio Value</span>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-[#0a1128] dark:text-white truncate">
              {formatPortfolioValue(totalPortfolioValue)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 truncate">Active inventory value</p>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0a1128] dark:text-white">
                Your Active Listings ({listings.length})
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Each listing has a direct branded link optimized for instant WhatsApp sharing.
              </p>
            </div>

            <Link
              href="/dashboard/listings/new"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 transition hover:border-[#c5a059] hover:bg-[#fbf6ec]/60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 self-start sm:self-auto"
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>+ New Listing</span>
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">No active listings yet</h3>
              <p className="mt-1 text-xs text-slate-500">Create your first branded real estate listing in under 30 seconds.</p>
              <Link
                href="/dashboard/listings/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0a1128] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16234b]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                <span>Create Listing</span>
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
              {listings.map((item) => {
                const rawCover = item.photos?.[0]?.photo_url;
                const coverPhoto = (rawCover && !rawCover.startsWith("blob:")) ? rawCover : FALLBACK_PHOTO;
                const targetUrl = `/${broker.slug || DEMO_BROKER.slug}/${item.slug}`;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-slate-50/60 dark:hover:bg-slate-900/30 rounded-2xl px-2 sm:px-3 -mx-2 sm:-mx-3"
                  >
                    {/* Media + Info */}
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="relative h-20 w-20 sm:h-24 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                        <img
                          src={coverPhoto}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_PHOTO;
                          }}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Active
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {item.bhk ? `${item.bhk} BHK` : ""} {item.property_type}
                          </span>
                        </div>

                        {/* Title: Not overly bold, wrap safely */}
                        <h3 className="text-xs sm:text-sm font-semibold text-[#0a1128] dark:text-white leading-snug line-clamp-2 break-words">
                          {item.title}
                        </h3>

                        {/* Price & Specs */}
                        <div className="pt-0.5">
                          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {item.display_price}
                          </div>

                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                              <MapPin className="h-3 w-3 shrink-0 text-[#c5a059]" />
                              <span className="truncate">{item.location_locality}, {item.location_city}</span>
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 shrink-0">
                              <Eye className="h-3 w-3 text-slate-400" />
                              {item.views_count || 1} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (Clean row on mobile and desktop) */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 sm:border-0 sm:pt-0 dark:border-slate-800/80 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyLink(item.slug)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#c5a059] hover:bg-[#fbf6ec]/50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {copiedSlug === item.slug ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={targetUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-xl bg-[#0a1128] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm border border-[#c5a059]/40 transition hover:bg-[#16234b] active:scale-95 dark:bg-[#c5a059] dark:text-[#0a1128]"
                      >
                        <span>Open Live</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

