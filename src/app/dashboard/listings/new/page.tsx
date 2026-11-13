"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Home,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  UploadCloud,
  X,
  Building,
  MapPin,
  Tag,
  ArrowRight,
  Loader2,
  Layers,
  ChevronRight
} from "lucide-react";
import { ParsedPropertyData, PropertyType, ListingType } from "@/types/database";
import { saveListingToMemory, DEMO_BROKER } from "@/lib/store";

const PRESET_EXAMPLES = [
  {
    label: "3 BHK Flat (Ahmedabad)",
    text: "3 BHK ekdum prime flat in Satellite Ahmedabad, 1.35 Cr final, fully furnished with covered parking and lift, near ISRO, 1750 sqft carpet area."
  },
  {
    label: "4 BHK Villa (Dubai)",
    text: "Ultra luxury 4 bedroom villa in Palm Jumeirah Dubai, private pool, sea view, 4500 sqft, maid room, vacant on transfer, asking AED 14,500,000."
  },
  {
    label: "2 BHK Rental (Mumbai)",
    text: "2 BHK for rent in Andheri West Mumbai, fully modular kitchen, high floor, 70,000 per month, 10 mins to metro station, family or working bachelors allowed."
  }
];

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80"
];

export default function NewListingPage() {
  const router = useRouter();

  // State
  const [rawNotes, setRawNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Parsed Listing State
  const [listingData, setListingData] = useState<ParsedPropertyData | null>(null);
  const [photos, setPhotos] = useState<string[]>(DEFAULT_PHOTOS);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Call AI API
  async function handleGenerateAI() {
    if (!rawNotes.trim()) {
      setGenerationError("Please enter some property notes or select an example above.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: rawNotes }),
      });

      const res = await response.json();

      if (!response.ok || !res.success) {
        throw new Error(res.error || "Failed to generate listing with AI");
      }

      setListingData(res.data);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Failed to communicate with AI model.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Publish Listing
  function handlePublish() {
    if (!listingData) return;

    // Save to runtime store
    const fullListing = {
      id: "listing-" + Date.now(),
      broker_id: DEMO_BROKER.id,
      title: listingData.title,
      slug: listingData.slug,
      description: listingData.description,
      property_type: listingData.property_type,
      listing_type: listingData.listing_type,
      bhk: listingData.bhk,
      bedrooms: listingData.bedrooms,
      bathrooms: listingData.bathrooms,
      carpet_area_sqft: listingData.carpet_area_sqft,
      price_amount: listingData.price_amount,
      display_price: listingData.display_price,
      currency: listingData.currency,
      location_city: listingData.location_city,
      location_locality: listingData.location_locality,
      amenities: listingData.amenities,
      ai_highlights: listingData.ai_highlights,
      ai_neighborhood_highlights: listingData.ai_neighborhood_highlights,
      status: "active" as const,
      views_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photos: photos.map((url, i) => ({
        id: `p-${i}`,
        listing_id: "listing-" + Date.now(),
        photo_url: url,
        display_order: i + 1,
        is_cover: i === 0,
        created_at: new Date().toISOString()
      })),
      broker: DEMO_BROKER
    };

    saveListingToMemory(fullListing);

    // Save to persistent file store via API
    fetch("/api/listings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullListing),
    }).catch((err) => console.warn("Background disk save:", err));

    // Trigger celebration confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    const url = `/${DEMO_BROKER.slug}/${listingData.slug}`;
    setPublishedUrl(url);
  }

  function handleCopy() {
    if (!publishedUrl) return;
    const fullUrl = window.location.origin + publishedUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-zinc-900 dark:text-white">AI Listing Creator</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by Groq Cloud (Qwen AI)</span>
          </div>
        </div>
      </div>

      <main className="mx-auto mt-8 max-w-5xl px-4">
        {/* Success Modal / Banner */}
        {publishedUrl && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-lg shadow-emerald-500/10 dark:border-emerald-800 dark:bg-emerald-950/40">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-200">
                  🎉 Property Live Ho Gayi!
                </h3>
                <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
                  Aapka branded micro-site ready hai. Is link ko WhatsApp par buyers ya broker groups me share karein:
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="rounded-lg bg-white/80 px-3 py-1.5 font-semibold text-emerald-900 shadow-sm dark:bg-zinc-900 dark:text-emerald-300">
                    {typeof window !== "undefined" ? window.location.origin + publishedUrl : publishedUrl}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50 dark:border-emerald-700 dark:bg-zinc-900 dark:text-emerald-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy Link"}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this property: ${typeof window !== "undefined" ? window.location.origin + publishedUrl : publishedUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Share on WhatsApp
                </a>

                <Link
                  href={publishedUrl}
                  target="_blank"
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Live Page
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Raw Input & Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  1. Raw Notes ya WhatsApp Message
                </h2>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Step 1
                </span>
              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Tooti-phooti Hindi, Hinglish, ya English me property ke baare me likhein ya paste karein.
              </p>

              {/* Presets */}
              <div className="mt-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Quick Examples Try Karein:
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESET_EXAMPLES.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRawNotes(ex.text)}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="mt-4">
                <textarea
                  rows={6}
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="e.g. 3 BHK fully furnished in Satellite, 1.35 Cr, car parking, lift, ready to move..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              {generationError && (
                <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                  {generationError}
                </p>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating || !rawNotes.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 py-3 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI Analysing Property (400ms)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>✨ AI se Listing Banao</span>
                  </>
                )}
              </button>
            </div>

            {/* Photos Manager */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  2. Property Photos ({photos.length})
                </h3>
                <span className="text-xs text-zinc-400">Auto-compressed</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((src, i) => (
                  <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={src}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                      className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 py-3 text-xs font-semibold text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                <UploadCloud className="h-4 w-4" />
                <span>Upload More Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const newUrls = Array.from(e.target.files).map((f) => URL.createObjectURL(f));
                      setPhotos([...photos, ...newUrls]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Right Column: AI Output & Live Preview Form */}
          <div className="lg:col-span-7">
            {listingData ? (
              <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Step 2: AI Result
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                      Review & Publish Listing
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handlePublish}
                    className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    <span>Publish Listing</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Listing Title
                    </label>
                    <input
                      type="text"
                      value={listingData.title}
                      onChange={(e) => setListingData({ ...listingData, title: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>

                  {/* Grid: Price, BHK, Carpet Area, Property Type */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Display Price
                      </label>
                      <input
                        type="text"
                        value={listingData.display_price}
                        onChange={(e) => setListingData({ ...listingData, display_price: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-bold text-emerald-600 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Bedrooms (BHK)
                      </label>
                      <input
                        type="number"
                        value={listingData.bhk || ""}
                        onChange={(e) => setListingData({ ...listingData, bhk: Number(e.target.value) })}
                        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Carpet Area (sq.ft)
                      </label>
                      <input
                        type="number"
                        value={listingData.carpet_area_sqft || ""}
                        onChange={(e) => setListingData({ ...listingData, carpet_area_sqft: Number(e.target.value) })}
                        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Property Type
                      </label>
                      <input
                        type="text"
                        value={listingData.property_type}
                        onChange={(e) => setListingData({ ...listingData, property_type: e.target.value as PropertyType })}
                        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Locality / Neighborhood
                      </label>
                      <input
                        type="text"
                        value={listingData.location_locality}
                        onChange={(e) => setListingData({ ...listingData, location_locality: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        City
                      </label>
                      <input
                        type="text"
                        value={listingData.location_city}
                        onChange={(e) => setListingData({ ...listingData, location_city: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                  </div>

                  {/* 5 AI Highlights */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      5 Key Highlights (AI Generated)
                    </label>
                    <div className="mt-2 space-y-2">
                      {listingData.ai_highlights.map((hl, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={hl}
                            onChange={(e) => {
                              const updated = [...listingData.ai_highlights];
                              updated[idx] = e.target.value;
                              setListingData({ ...listingData, ai_highlights: updated });
                            }}
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Amenities Detected
                    </label>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {listingData.amenities.map((am, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Sales Description
                    </label>
                    <textarea
                      rows={4}
                      value={listingData.description}
                      onChange={(e) => setListingData({ ...listingData, description: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99] dark:from-white dark:to-zinc-200 dark:text-zinc-900"
                  >
                    <span>Publish Listing to {DEMO_BROKER.slug}.propfolio.co</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Empty Placeholder */
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white/60 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h4 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                  AI Listing Preview
                </h4>
                <p className="mt-1 max-w-sm text-xs text-zinc-500">
                  Left side me property ke notes likhein aur <span className="font-semibold text-zinc-800 dark:text-zinc-200">"AI se Listing Banao"</span> par click karein. AI instantly yahan full listing create kar dega!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

