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
  Building2,
  MapPin,
  Tag,
  ArrowRight,
  Loader2,
  Layers,
  ChevronRight,
  Bed,
  Maximize2,
  Sofa,
  Eye,
  Edit3,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { ParsedPropertyData, PropertyType, ListingType } from "@/types/database";
import { saveListingToMemory, DEMO_BROKER } from "@/lib/store";

const PRESET_EXAMPLES = [
  {
    label: "3 BHK Flat (Ahmedabad)",
    text: "3 BHK prime luxury flat in Satellite Ahmedabad, 1.35 Cr final, fully furnished with reserved parking and lift, near ISRO, 1,750 sqft carpet area."
  },
  {
    label: "4 BHK Villa (Jaipur)",
    text: "Ultra luxury 4 bedroom villa in Malviya Nagar Jaipur, private terrace garden, road facing, 4200 sqft, servant quarters, immediate possession, asking 3.80 Cr."
  },
  {
    label: "2 BHK Rental (Mumbai)",
    text: "2 BHK for rent in Andheri West Mumbai, fully modular kitchen, high floor, 70,000 per month, 10 mins to metro station, family or corporate executives."
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
  const [previewTab, setPreviewTab] = useState<"preview" | "edit">("preview");

  // Call AI API
  async function handleGenerateAI() {
    if (!rawNotes.trim()) {
      setGenerationError("Please enter some property notes or select a sample template above.");
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
      setPreviewTab("preview");
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

    // Save to disk via API
    fetch("/api/listings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullListing),
    }).catch((err) => console.warn("Background disk save:", err));

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
    const fullUrl = `${window.location.origin}${publishedUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-[#0a1128] transition-colors dark:bg-[#070b14] dark:text-slate-100">
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-[#0a1128] dark:hover:text-white transition">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[#0a1128] dark:text-white">Create New Listing</span>
        </div>

        {/* Success Modal / Banner */}
        {publishedUrl && (
          <div className="mb-8 rounded-3xl border border-emerald-500/40 bg-emerald-50 p-6 text-emerald-950 shadow-lg dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Property Listing Published Live!</h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Your luxury listing page is now ready to share on WhatsApp with prospective buyers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50 dark:bg-emerald-900/60 dark:text-emerald-200"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copied ? "Copied Link!" : "Copy Link"}</span>
                </button>

                <Link
                  href={publishedUrl}
                  target="_blank"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
                >
                  <span>Open Live Page</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Column: Raw Input & Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Input */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0a1128] dark:text-white">
                  1. Raw Notes or WhatsApp Text
                </h2>
                <span className="rounded-md bg-[#fbf6ec] border border-[#e8d7b3] px-2 py-0.5 text-[11px] font-semibold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
                  Step 1
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Paste any unstructured text, rough specs, or forwarded broker messages.
              </p>

              {/* Sample Templates */}
              <div className="mt-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Sample Templates:
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESET_EXAMPLES.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRawNotes(ex.text)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-[#c5a059] hover:bg-[#fbf6ec]/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
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
                  placeholder="e.g. 3 BHK fully furnished in Satellite Ahmedabad, 1.35 Cr, car parking, lift, ready to move, 1750 sqft..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8f9fc] p-3.5 text-sm text-[#0a1128] outline-none transition focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#c5a059]"
                />
              </div>

              {generationError && (
                <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {generationError}
                </p>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating || !rawNotes.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a1128] py-3.5 text-sm font-bold text-white shadow-md shadow-[#0a1128]/20 border border-[#c5a059]/40 transition hover:bg-[#16234b] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#0f182e]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#c5a059]" />
                    <span>AI Parsing Property Details (~400ms)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-[#c5a059]" />
                    <span>Generate Listing with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Photos Manager */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0a1128] dark:text-white">
                  2. Property Photographs ({photos.length})
                </h3>
                <span className="text-xs text-slate-400">Auto-compressed</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((src, i) => (
                  <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <img
                      src={src}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded-md bg-[#0a1128]/85 px-1.5 py-0.5 text-[9px] font-bold text-white">
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

              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-600 transition hover:border-[#c5a059] hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900">
                <UploadCloud className="h-4 w-4 text-[#c5a059]" />
                <span>Upload More Property Photos</span>
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

          {/* Right Column: AI Output & Live Preview / Edit */}
          <div className="lg:col-span-7">
            {listingData ? (
              <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                
                {/* Header with Switcher Tabs & Publish Action */}
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        AI Generated
                      </span>
                      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs dark:border-slate-700 dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => setPreviewTab("preview")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition ${
                            previewTab === "preview"
                              ? "bg-white text-[#0a1128] shadow dark:bg-slate-800 dark:text-white"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <Eye className="h-3.5 w-3.5 text-[#c5a059]" />
                          <span>Live Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTab("edit")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition ${
                            previewTab === "edit"
                              ? "bg-white text-[#0a1128] shadow dark:bg-slate-800 dark:text-white"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <Edit3 className="h-3.5 w-3.5 text-[#c5a059]" />
                          <span>Edit Details</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePublish}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0a1128] px-5 py-2.5 text-xs font-bold text-white shadow-md border border-[#c5a059]/40 transition hover:bg-[#16234b] active:scale-95 dark:bg-[#c5a059] dark:text-[#0a1128]"
                  >
                    <span>Publish Listing</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* TAB 1: LIVE PREVIEW (Exact match to the reference mockup, mobile-safe) */}
                {previewTab === "preview" && (
                  <div className="mx-auto w-full max-w-sm sm:max-w-md rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xl dark:border-slate-700 dark:bg-[#090e1c] overflow-hidden">
                    
                    {/* Top Carousel Preview */}
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-200">
                      <img
                        src={photos[0] || DEFAULT_PHOTOS[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 rounded-full bg-[#0a1128]/80 px-2 py-0.5 text-[9px] font-semibold text-white">
                        FOR {listingData.listing_type.toUpperCase()}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 rounded-full bg-[#0a1128]/80 px-2 py-0.5 text-[9px] font-medium text-white">
                        1/{photos.length}
                      </div>
                    </div>

                    {/* Meta & Title */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37] max-w-full truncate">
                          <MapPin className="h-3 w-3 text-[#c5a059] shrink-0" />
                          <span className="truncate">{listingData.location_locality}, {listingData.location_city}</span>
                        </span>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/40 dark:text-emerald-300">
                          🏡 For {listingData.listing_type}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-semibold text-[#0a1128] dark:text-white leading-snug break-words">
                        {listingData.title}
                      </h4>

                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                          {listingData.display_price}
                        </span>
                      </div>
                    </div>

                    {/* 2x2 Overview Cards */}
                    <div className="mt-3.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        PROPERTY OVERVIEW
                      </p>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 rounded-xl border border-slate-200/80 bg-[#f8f9fa] p-2 dark:border-slate-800 dark:bg-[#0c1222] min-w-0 overflow-hidden">
                          <Bed className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 truncate">Configuration</span>
                            <span className="font-semibold text-xs text-[#0a1128] dark:text-white truncate block">{listingData.bhk ? `${listingData.bhk} BHK` : "Spacious"}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 rounded-xl border border-slate-200/80 bg-[#f8f9fa] p-2 dark:border-slate-800 dark:bg-[#0c1222] min-w-0 overflow-hidden">
                          <Maximize2 className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 truncate">Super Built-Up</span>
                            <span className="font-semibold text-xs text-[#0a1128] dark:text-white truncate block">{listingData.carpet_area_sqft} Sq. Ft.</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 rounded-xl border border-slate-200/80 bg-[#f8f9fa] p-2 dark:border-slate-800 dark:bg-[#0c1222] min-w-0 overflow-hidden">
                          <Sofa className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 truncate">Furnishing</span>
                            <span className="font-semibold text-xs text-[#0a1128] dark:text-white truncate block">Fully Furnished</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 rounded-xl border border-slate-200/80 bg-[#f8f9fa] p-2 dark:border-slate-800 dark:bg-[#0c1222] min-w-0 overflow-hidden">
                          <Building2 className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 truncate">Property Type</span>
                            <span className="font-semibold text-xs text-[#0a1128] dark:text-white truncate block">{listingData.property_type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mt-3 space-y-1 border-t border-slate-100 pt-2.5 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      {listingData.ai_highlights.slice(0, 3).map((hl, idx) => (
                        <p key={idx} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{hl}</span>
                        </p>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp Broker</span>
                      </button>
                      <button
                        type="button"
                        className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                )}

                {/* TAB 2: EDIT DETAILS */}
                {previewTab === "edit" && (
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Listing Title
                      </label>
                      <input
                        type="text"
                        value={listingData.title}
                        onChange={(e) => setListingData({ ...listingData, title: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Grid: Price, BHK, Area, Property Type */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Display Price
                        </label>
                        <input
                          type="text"
                          value={listingData.display_price}
                          onChange={(e) => setListingData({ ...listingData, display_price: e.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold text-emerald-600 outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Bedrooms (BHK)
                        </label>
                        <input
                          type="number"
                          value={listingData.bhk || ""}
                          onChange={(e) => setListingData({ ...listingData, bhk: Number(e.target.value) })}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Carpet Area (sq.ft)
                        </label>
                        <input
                          type="number"
                          value={listingData.carpet_area_sqft || ""}
                          onChange={(e) => setListingData({ ...listingData, carpet_area_sqft: Number(e.target.value) })}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Property Type
                        </label>
                        <input
                          type="text"
                          value={listingData.property_type}
                          onChange={(e) => setListingData({ ...listingData, property_type: e.target.value as PropertyType })}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Locality / Neighborhood
                        </label>
                        <input
                          type="text"
                          value={listingData.location_locality}
                          onChange={(e) => setListingData({ ...listingData, location_locality: e.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          City
                        </label>
                        <input
                          type="text"
                          value={listingData.location_city}
                          onChange={(e) => setListingData({ ...listingData, location_city: e.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    {/* 5 Highlights */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Curated Highlights
                      </label>
                      <div className="mt-2 space-y-2">
                        {listingData.ai_highlights.map((hl, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fbf6ec] text-[10px] font-bold text-[#8a6828] border border-[#e8d7b3]">
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
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Sales Description
                      </label>
                      <textarea
                        rows={4}
                        value={listingData.description}
                        onChange={(e) => setListingData({ ...listingData, description: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a1128] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#16234b] active:scale-95 border border-[#c5a059]/40 dark:bg-[#c5a059] dark:text-[#0a1128]"
                  >
                    <span>Publish Listing to {DEMO_BROKER.slug}.propfolio.in</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            ) : (
              /* Empty Placeholder */
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-12 text-center dark:border-slate-800 dark:bg-[#0c1222]/60">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbf6ec] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#15120a]">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h4 className="mt-4 text-base font-bold text-[#0a1128] dark:text-white">
                  AI Listing Preview
                </h4>
                <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  Enter property notes on the left and click <span className="font-semibold text-[#0a1128] dark:text-white">"Generate Listing with AI"</span>. Your formatted mobile & web preview will appear here in seconds.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
