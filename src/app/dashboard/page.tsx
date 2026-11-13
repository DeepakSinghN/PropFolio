"use client";

import Link from "next/link";
import {
  Sparkles,
  Building2,
  Eye,
  CreditCard,
  PlusCircle,
  ExternalLink,
  Share2,
  Copy,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react";
import { getAllMemoryListings, DEMO_BROKER } from "@/lib/store";
import { useState, useEffect } from "react";
import { Listing } from "@/types/database";

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

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* Broker Welcome Banner */}
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-zinc-200/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:flex-row sm:items-center dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <img
              src={broker.avatar_url}
              alt={broker.full_name}
              className="h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-sm dark:border-zinc-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
                  {broker.full_name}
                </h1>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  Solo Pro
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {broker.company_name} · {broker.city} ·{" "}
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {broker.slug}.propfolio.co
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/listings/new"
              className="flex items-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <Sparkles className="h-4 w-4 text-amber-400 dark:text-amber-600" />
              <span>Nayi Listing Banao (AI)</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Listings</span>
              <Building2 className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
              {listings.length}
            </p>
            <p className="mt-1 text-xs text-emerald-600">All live on public links</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Buyer Views</span>
              <Eye className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
              {listings.reduce((sum, l) => sum + (l.views_count || 0), 0)}
            </p>
            <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+34% this week</span>
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Credits Remaining</span>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
              {DEMO_BROKER.listing_credits} / 30
            </p>
            <p className="mt-1 text-xs text-zinc-400">Renews next month</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">AI Engine</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">
              Groq (Qwen 27B)
            </p>
            <p className="mt-1 text-xs text-emerald-600">Avg 400ms latency</p>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Aapki Active Listings ({listings.length})
              </h2>
              <p className="text-xs text-zinc-500">
                Har listing ka ek direct shareable link hai jo WhatsApp aur social media par khulta hai.
              </p>
            </div>

            <Link
              href="/dashboard/listings/new"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Nayi Listing</span>
            </Link>
          </div>

          <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            {listings.map((item) => {
              const coverPhoto = item.photos?.[0]?.photo_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80";
              const targetUrl = `/${DEMO_BROKER.slug}/${item.slug}`;

              return (
                <div key={item.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={coverPhoto}
                      alt={item.title}
                      className="h-20 w-24 rounded-xl object-cover shadow-sm shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active
                        </span>
                        <span className="text-xs font-semibold text-zinc-400">
                          {item.bhk ? `${item.bhk} BHK` : ""} {item.property_type}
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-zinc-900 dark:text-white">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {item.display_price}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location_locality}, {item.location_city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.views_count} views
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(item.slug)}
                      className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedSlug === item.slug ? "Copied!" : "Copy Link"}</span>
                    </button>

                    <Link
                      href={targetUrl}
                      target="_blank"
                      className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                    >
                      <span>Open Live</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

