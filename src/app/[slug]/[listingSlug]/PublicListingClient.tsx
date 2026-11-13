"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  MessageCircle,
  Phone,
  Share2,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  FileText,
  Maximize2,
  X,
  Calculator,
  Compass,
  Building2,
  Car,
  Layers,
  Key,
  BadgeCheck,
  ArrowUpRight,
  Check,
  Bed,
  Sofa,
  Clock,
  Home,
  CheckCheck,
} from "lucide-react";
import { getListingFromMemory, INITIAL_LISTINGS, DEMO_BROKER } from "@/lib/store";
import { Listing } from "@/types/database";

interface ClientProps {
  slug: string;
  listingSlug: string;
  initialListing?: Listing;
}

const DEFAULT_GALLERY_PHOTOS = [
  {
    id: "def-1",
    listing_id: "def",
    photo_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80",
    display_order: 1,
    is_cover: true,
    created_at: "",
  },
  {
    id: "def-2",
    listing_id: "def",
    photo_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&auto=format&fit=crop&q=80",
    display_order: 2,
    is_cover: false,
    created_at: "",
  },
  {
    id: "def-3",
    listing_id: "def",
    photo_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=80",
    display_order: 3,
    is_cover: false,
    created_at: "",
  },
  {
    id: "def-4",
    listing_id: "def",
    photo_url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1400&auto=format&fit=crop&q=80",
    display_order: 4,
    is_cover: false,
    created_at: "",
  },
];

export default function PublicListingClient({ slug, listingSlug, initialListing }: ClientProps) {
  const listing =
    initialListing ||
    getListingFromMemory(listingSlug) ||
    INITIAL_LISTINGS.find((l) => l.slug === listingSlug) ||
    INITIAL_LISTINGS[0];
  const broker = listing.broker || DEMO_BROKER;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Touch Swipe State for Mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fallback to gallery photos if listing has 0 photos
  const photos = useMemo(() => {
    if (listing.photos && listing.photos.length > 0) {
      return listing.photos;
    }
    return DEFAULT_GALLERY_PHOTOS;
  }, [listing.photos]);

  const currentPhoto = photos[activePhotoIdx] || photos[0];

  // Financials & Calculator
  const priceAmount = listing.price_amount || 13500000;
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);

  // Rate per sqft
  const ratePerSqft = useMemo(() => {
    if (listing.carpet_area_sqft && listing.carpet_area_sqft > 0 && priceAmount > 0) {
      return Math.round(priceAmount / listing.carpet_area_sqft);
    }
    return null;
  }, [priceAmount, listing.carpet_area_sqft]);

  // Real-time Monthly EMI
  const { monthlyEmi, loanPrincipal, totalInterest, totalPayable } = useMemo(() => {
    const downPayment = (priceAmount * downPaymentPercent) / 100;
    const principal = Math.max(0, priceAmount - downPayment);
    const monthlyRate = interestRate / 12 / 100;
    const months = loanTenureYears * 12;

    if (principal <= 0 || monthlyRate <= 0 || months <= 0) {
      return { monthlyEmi: 0, loanPrincipal: 0, totalInterest: 0, totalPayable: 0 };
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const total = emi * months;
    const interest = total - principal;

    return {
      monthlyEmi: Math.round(emi),
      loanPrincipal: Math.round(principal),
      totalInterest: Math.round(interest),
      totalPayable: Math.round(total),
    };
  }, [priceAmount, downPaymentPercent, loanTenureYears, interestRate]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      }
      if (e.key === "ArrowRight") {
        setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, photos.length]);

  // Touch Swipe Handlers for Mobile Carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Photo
      setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev Photo
      setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    }
  };

  // Format Currency (Indian Lakh / Crore)
  function formatINR(amount: number) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  // Pre-filled WhatsApp message
  const waText = encodeURIComponent(
    `Hi ${broker.full_name}, I saw your listing "${listing.title}" for ${listing.display_price}. Is it available? Can we schedule a site visit?`
  );
  const waLink = `https://wa.me/${broker.phone_number.replace(/\D/g, "")}?text=${waText}`;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator
        .share({
          title: listing.title,
          text: `${listing.title} for ${listing.display_price}`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-28 sm:pb-32 text-[#0a1128] antialiased selection:bg-[#c5a059]/20 selection:text-[#0a1128] dark:bg-[#070b14] dark:text-slate-100">
      
      {/* 1. TOP STICKY HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f8f9fa]/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#070b14]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          
          {/* Broker Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  broker.avatar_url ||
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80"
                }
                alt={broker.full_name}
                className="h-10 w-10 rounded-full border border-[#c5a059]/40 object-cover ring-2 ring-white shadow-sm dark:border-[#c5a059]/30 dark:ring-slate-900"
              />
              <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white ring-2 ring-white dark:ring-slate-900">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-[#0a1128] dark:text-white">
                  {broker.full_name}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2 py-0.5 text-[10px] font-semibold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
                  <BadgeCheck className="h-3 w-3 text-[#c5a059]" />
                  Verified Broker
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {broker.company_name || "Exclusive Advisory"} · {broker.city || "Representative"}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link
              href={`/${broker.slug}/${listing.slug}/brochure`}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0a1128] shadow-sm transition hover:border-[#c5a059] hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-[#0f182e] dark:text-slate-200 dark:hover:border-[#c5a059] dark:hover:bg-[#16234b]"
            >
              <FileText className="h-3.5 w-3.5 text-[#c5a059]" />
              <span className="hidden sm:inline">PDF Brochure</span>
            </Link>

            <button
              onClick={handleShare}
              type="button"
              aria-label="Share property"
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0a1128] shadow-sm transition hover:border-[#c5a059] hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-[#0f182e] dark:text-slate-300 dark:hover:border-[#c5a059]"
            >
              {copiedShare ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER WITH RESPONSIVE DESKTOP & MOBILE GRID */}
      <main className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: HERO GALLERY & PROPERTY SPECS (8 Cols Desktop) */}
          {/* ========================================================= */}
          <div className="space-y-6 lg:col-span-8">
            
            {/* Gallery Section */}
            <section className="space-y-3">
              <div
                className="group relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-200 shadow-xl ring-1 ring-slate-900/5 select-none dark:bg-slate-900 dark:ring-white/10"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={currentPhoto.photo_url}
                  alt={listing.title}
                  onClick={() => setIsLightboxOpen(true)}
                  className="h-full w-full cursor-zoom-in object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
                />

                {/* Top Badges */}
                <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
                  <span className="rounded-full bg-[#0a1128]/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-sm">
                    {listing.listing_type === "Sale" ? "FOR SALE" : "FOR RENT"}
                  </span>
                  <span className="rounded-full bg-[#0a1128]/85 border border-[#c5a059]/40 px-3 py-1 text-xs font-semibold text-[#d4af37] backdrop-blur-md shadow-sm">
                    {listing.property_type.toUpperCase()}
                  </span>
                </div>

                {/* Expand Fullscreen Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="absolute right-4 top-4 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#0a1128]/70 border border-[#c5a059]/30 text-white shadow-lg backdrop-blur-md transition hover:bg-[#0a1128]/95 hover:scale-105 active:scale-95 pointer-events-auto"
                  title="View Fullscreen"
                  aria-label="View Fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {/* Photo Counter Pill (Matching reference mockup) */}
                <div className="absolute bottom-4 right-4 z-20 rounded-full bg-[#0a1128]/75 border border-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-white backdrop-blur-md pointer-events-none">
                  {activePhotoIdx + 1}/{photos.length}
                </div>

                {/* Arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#0a1128]/60 border border-[#c5a059]/30 text-white shadow-lg backdrop-blur-md transition hover:bg-[#0a1128]/90 active:scale-90 pointer-events-auto"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#0a1128]/60 border border-[#c5a059]/30 text-white shadow-lg backdrop-blur-md transition hover:bg-[#0a1128]/90 active:scale-90 pointer-events-auto"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative aspect-[4/3] w-20 sm:w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 transition-all pointer-events-auto ${
                        activePhotoIdx === idx
                          ? "border-[#c5a059] scale-95 shadow-md shadow-[#c5a059]/25"
                          : "border-transparent opacity-65 hover:opacity-100"
                      }`}
                    >
                      <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Property Key Details & Pricing */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222] overflow-hidden">
              {/* Location Tag */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37] max-w-full">
                  <MapPin className="h-3 w-3 text-[#c5a059] shrink-0" />
                  <span className="truncate">
                    {listing.location_locality ? `${listing.location_locality}, ` : ""}
                    {listing.location_city}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                  <Home className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>For {listing.listing_type || "Sale"}</span>
                </span>
              </div>

              {/* Title (Editorial Hierarchy - Clean & Not Overly Bold) */}
              <h1 className="mt-3 text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#0a1128] dark:text-white leading-snug break-words">
                {listing.title}
              </h1>

              {/* Price Row */}
              <div className="mt-3 flex flex-wrap items-baseline gap-2 sm:gap-3 border-b border-slate-100 pb-5 dark:border-slate-800/80">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                  {listing.display_price}
                </span>
                {ratePerSqft && (
                  <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                    · Approx. ₹{ratePerSqft.toLocaleString("en-IN")} / sq.ft
                  </span>
                )}
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Negotiable
                </span>
              </div>

              {/* ======================================================= */}
              {/* 2x2 PROPERTY OVERVIEW CARDS (Mobile-Safe, Never Overflow) */}
              {/* ======================================================= */}
              <div className="mt-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  Property Overview
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3.5">
                  {/* Configuration */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 rounded-2xl border border-slate-200/90 bg-[#f8f9fc] p-3 sm:p-3.5 min-w-0 overflow-hidden dark:border-slate-800 dark:bg-[#090e1c]">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#fbf6ec] text-[#8a6828] border border-[#e8d7b3] dark:bg-[#17130a] dark:text-[#d4af37] dark:border-[#3d331d]">
                      <Bed className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                        Configuration
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-[#0a1128] dark:text-white truncate">
                        {listing.bhk ? `${listing.bhk} BHK` : "Spacious"}
                      </p>
                    </div>
                  </div>

                  {/* Super Built-Up Area */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 rounded-2xl border border-slate-200/90 bg-[#f8f9fc] p-3 sm:p-3.5 min-w-0 overflow-hidden dark:border-slate-800 dark:bg-[#090e1c]">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#fbf6ec] text-[#8a6828] border border-[#e8d7b3] dark:bg-[#17130a] dark:text-[#d4af37] dark:border-[#3d331d]">
                      <Maximize2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                        Super Built-Up Area
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-[#0a1128] dark:text-white truncate">
                        {listing.carpet_area_sqft ? `${listing.carpet_area_sqft.toLocaleString()} Sq. Ft.` : "Generous"}
                      </p>
                    </div>
                  </div>

                  {/* Furnishing */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 rounded-2xl border border-slate-200/90 bg-[#f8f9fc] p-3 sm:p-3.5 min-w-0 overflow-hidden dark:border-slate-800 dark:bg-[#090e1c]">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#fbf6ec] text-[#8a6828] border border-[#e8d7b3] dark:bg-[#17130a] dark:text-[#d4af37] dark:border-[#3d331d]">
                      <Sofa className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                        Furnishing
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-[#0a1128] dark:text-white truncate">
                        Fully Furnished
                      </p>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 rounded-2xl border border-slate-200/90 bg-[#f8f9fc] p-3 sm:p-3.5 min-w-0 overflow-hidden dark:border-slate-800 dark:bg-[#090e1c]">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#fbf6ec] text-[#8a6828] border border-[#e8d7b3] dark:bg-[#17130a] dark:text-[#d4af37] dark:border-[#3d331d]">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                        Property Type
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-[#0a1128] dark:text-white truncate">
                        {listing.property_type || "Apartment"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Curated Highlights */}
            {listing.ai_highlights && listing.ai_highlights.length > 0 && (
              <section className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>Curated Highlights</span>
                  </h3>
                  <span className="text-[10px] font-medium text-slate-400">AI Verified</span>
                </div>

                <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {listing.ai_highlights.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-[#f8f9fc] p-3 sm:p-3.5 transition-all hover:border-[#c5a059]/30 dark:border-slate-800/80 dark:bg-[#090e1c]"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a1128] text-[10px] font-bold text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#16234b]">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-normal leading-relaxed text-slate-700 dark:text-slate-300 break-words">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* About this Property (Description) */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                About this Property
              </h3>
              <div className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-line dark:text-slate-300 break-words">
                {listing.description}
              </div>
            </section>

            {/* Amenities & Infrastructure */}
            {listing.amenities && listing.amenities.length > 0 && (
              <section className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    Amenities & Facilities
                  </h3>
                  <span className="text-[10px] text-slate-400">{listing.amenities.length} Verified Facilities</span>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {listing.amenities.map((am, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-[#f8f9fc] p-2.5 text-xs font-medium text-[#0a1128] transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-[#090e1c] dark:text-slate-200 min-w-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="truncate">{am}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Location Advantages */}
            {listing.ai_neighborhood_highlights && listing.ai_neighborhood_highlights.length > 0 && (
              <section className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-[#c5a059]" />
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    Location Advantages & Connectivity
                  </h3>
                </div>

                <div className="mt-3 space-y-2">
                  {listing.ai_neighborhood_highlights.map((nh, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl bg-[#f8f9fc] p-2.5 sm:p-3 text-xs font-medium text-slate-700 dark:bg-[#090e1c] dark:text-slate-300 break-words"
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#c5a059]" />
                      <span className="break-words">{nh}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Interactive Live EMI Estimator */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                    <Calculator className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0a1128] dark:text-white">
                      Monthly EMI & Loan Estimator
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Estimate your monthly installments
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-12">
                <div className="space-y-4 md:col-span-7">
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">
                        Down Payment: {downPaymentPercent}%
                      </span>
                      <span className="text-[#0a1128] dark:text-white font-bold">
                        {formatINR((priceAmount * downPaymentPercent) / 100)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#c5a059] dark:bg-slate-800 pointer-events-auto"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">
                        Tenure: {loanTenureYears} Years ({loanTenureYears * 12} Mos)
                      </span>
                      <span className="text-[#0a1128] dark:text-white font-bold">{loanTenureYears} yrs</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={loanTenureYears}
                      onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#c5a059] dark:bg-slate-800 pointer-events-auto"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">Interest Rate: {interestRate}% p.a.</span>
                      <span className="text-[#0a1128] dark:text-white font-bold">Home Loan</span>
                    </div>
                    <input
                      type="range"
                      min="7.0"
                      max="12.0"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#c5a059] dark:bg-slate-800 pointer-events-auto"
                    />
                  </div>
                </div>

                {/* Monthly Summary Box */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-gradient-to-tr from-white to-[#fbf6ec]/60 p-5 md:col-span-5 dark:border-slate-800 dark:from-[#0c1222] dark:to-[#17130a]">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Estimated Monthly EMI
                    </span>
                    <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      ₹{monthlyEmi.toLocaleString("en-IN")}
                      <span className="text-xs font-semibold text-slate-400"> / mo</span>
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs border-t border-slate-200/60 pt-3 dark:border-slate-800">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Loan Principal:</span>
                        <span className="font-semibold text-[#0a1128] dark:text-white">{formatINR(loanPrincipal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Total Interest:</span>
                        <span className="font-semibold text-[#0a1128] dark:text-white">{formatINR(totalInterest)}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0a1128] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#16234b] active:scale-95 dark:bg-white dark:text-[#0a1128]"
                  >
                    <span>Check Loan Eligibility on WhatsApp</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#c5a059]" />
                  </a>
                </div>
              </div>
            </section>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: STICKY DESKTOP VALUATION & ADVISORY DESK   */}
          {/* ========================================================= */}
          <div className="space-y-6 lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              
              {/* Main Desktop Action Card */}
              <div className="rounded-3xl border-2 border-[#c5a059]/40 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-[#c5a059]/30 dark:bg-[#0c1222] dark:shadow-none">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Offering Price
                </span>
                
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                    {listing.display_price}
                  </span>
                  {ratePerSqft && (
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      ₹{ratePerSqft.toLocaleString("en-IN")}/sqft
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-2.5">
                  {/* Primary WhatsApp CTA */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95 pointer-events-auto"
                  >
                    <MessageCircle className="h-4 w-4 fill-white" />
                    <span>Chat on WhatsApp</span>
                  </a>

                  {/* Secondary Call */}
                  <a
                    href={`tel:${broker.phone_number}`}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-[#f8f9fa] py-3 text-xs font-semibold text-[#0a1128] transition hover:bg-white hover:border-[#c5a059] active:scale-95 dark:border-slate-800 dark:bg-[#090e1c] dark:text-white pointer-events-auto"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Broker ({broker.phone_number})</span>
                  </a>

                  {/* PDF Download */}
                  <Link
                    href={`/${broker.slug}/${listing.slug}/brochure`}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-700 transition hover:border-[#c5a059] hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0c1222] dark:text-slate-300"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>Download PDF Brochure</span>
                  </Link>
                </div>

                {/* Response SLA */}
                <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50/80 py-2 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Direct broker response in under 5 minutes</span>
                </div>
              </div>

              {/* Verified Broker Profile Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center gap-4">
                  <img
                    src={broker.avatar_url}
                    alt={broker.full_name}
                    className="h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-md dark:border-slate-800"
                  />
                  <div>
                    <h4 className="text-base font-bold text-[#0a1128] dark:text-white flex items-center gap-1.5">
                      {broker.full_name}
                      <ShieldCheck className="h-4 w-4 text-[#c5a059]" />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {broker.company_name} · {broker.city}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-[#c5a059]">
                      Verified Property Representative
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 space-y-1.5">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Direct Site Visits Scheduled on Request</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Title Clearance & Legal Documentation Verified</span>
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. MOBILE FLOATING STICKY ACTION BAR (Screens < 1024px)   */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-[#070b14]/95 pointer-events-auto">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          
          {/* Price Preview */}
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              For {listing.listing_type || "Sale"}
            </span>
            <span className="block truncate text-lg font-black text-emerald-700 dark:text-emerald-400">
              {listing.display_price}
            </span>
          </div>

          {/* Quick Buttons: Call + WhatsApp */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${broker.phone_number}`}
              aria-label="Call Broker"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-[#f8f9fa] text-slate-700 shadow-sm transition active:scale-95 dark:border-slate-800 dark:bg-[#0c1222] dark:text-slate-200"
            >
              <Phone className="h-4 w-4" />
            </a>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. FULLSCREEN LIGHTBOX MODAL                              */}
      {/* ========================================================= */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md pointer-events-auto select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Lightbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            className="absolute right-4 top-4 z-[110] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 active:scale-90 pointer-events-auto"
            aria-label="Close Fullscreen"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Photo Navigation in Lightbox */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-90 pointer-events-auto"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-90 pointer-events-auto"
                aria-label="Next photo"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <div
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto.photo_url}
              alt={listing.title}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-3 text-center text-xs font-medium text-white/70">
              Photo {activePhotoIdx + 1} of {photos.length} · Tap anywhere outside or press ESC to exit
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
