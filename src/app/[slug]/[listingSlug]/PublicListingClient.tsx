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
  Building,
  Car,
  Layers,
  Key,
  BadgeCheck,
  ArrowUpRight,
  Check
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

  // Financials
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

  // Touch Swipe Handlers
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

  // Format Currency
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
    `Hi ${broker.full_name}, I saw your listing "${listing.title}" for ${listing.display_price}. Is it still available? Can we schedule a site visit?`
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
    <div className="min-h-screen bg-[#f8f9fa] pb-32 text-[#0a1128] antialiased selection:bg-[#c5a059]/20 selection:text-[#0a1128] dark:bg-[#070b14] dark:text-slate-100">
      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f8f9fa]/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#070b14]/90">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
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
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2 py-0.5 text-[10px] font-semibold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
                  <BadgeCheck className="h-3 w-3 text-[#c5a059]" />
                  Verified Advisory
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
              <span className="hidden sm:inline">PDF Dossier</span>
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

      {/* Main Luxury Architectural Showcase */}
      <main className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 sm:pt-8">
        {/* 1. Hero Gallery */}
        <section className="space-y-3">
          <div
            className="group relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-3xl bg-zinc-200 shadow-xl ring-1 ring-zinc-900/5 select-none dark:bg-zinc-900 dark:ring-white/10"
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
              <span className="rounded-full bg-[#0a1128]/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {listing.listing_type === "Sale" ? "FOR SALE" : "FOR LEASE"}
              </span>
              <span className="rounded-full bg-[#0a1128]/85 border border-[#c5a059]/40 px-3 py-1 text-xs font-semibold text-[#d4af37] backdrop-blur-md">
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

            {/* Photo Counter */}
            <div className="absolute bottom-4 right-4 z-20 rounded-full bg-[#0a1128]/70 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md pointer-events-none">
              {activePhotoIdx + 1} / {photos.length}
            </div>

            {/* Gallery Navigation Arrows (Swipe / Click) */}
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

          {/* Thumbnail Strip */}
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

        {/* 2. Key Title & Financials Card */}
        <section className="mt-6 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-colors sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                  {listing.property_type}
                </span>
                <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Ready to Move
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl md:text-4xl dark:text-white">
                {listing.title}
              </h1>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  {listing.location_locality}, {listing.location_city}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-5 text-left md:text-right dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Offering Price
              </span>
              <div className="mt-1 flex items-baseline gap-2 md:justify-end">
                <span className="text-3xl font-black tracking-tight text-emerald-600 sm:text-4xl dark:text-emerald-400">
                  {listing.display_price}
                </span>
              </div>
              {ratePerSqft && (
                <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Approx. ₹{ratePerSqft.toLocaleString("en-IN")} / sq.ft
                </p>
              )}
            </div>
          </div>

          {/* Key Metrics Horizontal Strip */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50/80 p-4 dark:bg-zinc-800/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Configuration
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  {listing.bhk ? `${listing.bhk} BHK` : "Spacious"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50/80 p-4 dark:bg-zinc-800/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Carpet Area
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  {listing.carpet_area_sqft ? `${listing.carpet_area_sqft.toLocaleString()} sq.ft` : "Generous"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50/80 p-4 dark:bg-zinc-800/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Parking
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Reserved Slot</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50/80 p-4 dark:bg-zinc-800/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Possession
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Immediate</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. AI Key Selling Highlights */}
        {listing.ai_highlights && listing.ai_highlights.length > 0 && (
          <section className="mt-6 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-colors sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl dark:text-white">
                  Curated Property Highlights
                </h2>
              </div>
              <span className="text-[11px] font-medium text-zinc-400">AI Verified Insights</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {listing.ai_highlights.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 transition-all hover:border-amber-500/30 hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-800/30 dark:hover:border-amber-500/30"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-xs font-bold text-white shadow-sm shadow-amber-500/20">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-200">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Interactive Live EMI Calculator */}
        <section className="mt-6 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-colors sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-5 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                <Calculator className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl dark:text-white">
                  Monthly EMI & Affordability Estimator
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Estimate bank loan installments for this property in real time
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Sliders Column */}
            <div className="space-y-5 lg:col-span-7">
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Down Payment: {downPaymentPercent}%
                  </span>
                  <span className="text-zinc-900 dark:text-white">
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
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-amber-500 dark:bg-zinc-800 pointer-events-auto"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Loan Tenure: {loanTenureYears} Years
                  </span>
                  <span className="text-zinc-900 dark:text-white">{loanTenureYears * 12} Months</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-amber-500 dark:bg-zinc-800 pointer-events-auto"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-600 dark:text-zinc-400">Interest Rate: {interestRate}% p.a.</span>
                  <span className="text-zinc-900 dark:text-white">Standard Home Loan</span>
                </div>
                <input
                  type="range"
                  min="7.0"
                  max="12.0"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-amber-500 dark:bg-zinc-800 pointer-events-auto"
                />
              </div>
            </div>

            {/* Calculated Monthly Summary Column */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-100 bg-gradient-to-tr from-zinc-50 to-amber-50/30 p-6 lg:col-span-5 dark:border-zinc-800 dark:from-zinc-800/40 dark:to-amber-950/10">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Estimated Monthly EMI
                </span>
                <p className="mt-1 text-3xl font-black text-emerald-600 sm:text-4xl dark:text-emerald-400">
                  ₹{monthlyEmi.toLocaleString("en-IN")}
                  <span className="text-xs font-semibold text-zinc-400"> / mo</span>
                </p>

                <div className="mt-5 space-y-2 text-xs border-t border-zinc-200/60 pt-4 dark:border-zinc-700/60">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                    <span>Loan Principal:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {formatINR(loanPrincipal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                    <span>Total Interest:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {formatINR(totalInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                    <span>Total Repayment:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {formatINR(totalPayable)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 pointer-events-auto"
                >
                  <span>Ask Broker for Bank Loan Approval</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Residence Description */}
        <section className="mt-6 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-colors sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl dark:text-white">
            About this Property
          </h2>
          <div className="mt-4 space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-600 whitespace-pre-line dark:text-zinc-300">
            {listing.description}
          </div>
        </section>

        {/* 6. Amenities & Facilities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <section className="mt-6 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-colors sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl dark:text-white">
                Amenities & Infrastructure
              </h2>
              <span className="text-xs text-zinc-400">{listing.amenities.length} Verified Facilities</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.amenities.map((am, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 text-xs sm:text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-800/40 dark:text-zinc-200"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{am}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Neighborhood Perks */}
        {listing.ai_neighborhood_highlights && listing.ai_neighborhood_highlights.length > 0 && (
          <section className="mt-6 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-colors sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                <Compass className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl dark:text-white">
                Location Perks & Strategic Access
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              {listing.ai_neighborhood_highlights.map((nh, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-2xl bg-zinc-50/80 p-3.5 text-xs sm:text-sm font-medium text-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-300"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>{nh}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Verified Broker Advisory Card */}
        <section className="mt-8 rounded-3xl border border-amber-500/20 bg-gradient-to-tr from-amber-500/5 via-white to-transparent p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <img
                src={broker.avatar_url}
                alt={broker.full_name}
                className="h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-md dark:border-zinc-800"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {broker.full_name}
                  </h3>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {broker.company_name} · Professional Real Estate Consultant
                </p>
                <p className="mt-1 font-mono text-xs text-amber-600 dark:text-amber-400">
                  Direct Line: {broker.phone_number}
                </p>
              </div>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-3">
              <a
                href={`tel:${broker.phone_number}`}
                className="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white pointer-events-auto"
              >
                <Phone className="h-4 w-4" />
                <span>Call Broker</span>
              </a>

              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95 pointer-events-auto"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Floating Bottom Sticky Mobile Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/80 bg-white/95 p-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-[#0c0d0e]/95 pointer-events-auto">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="hidden sm:block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Verified Consultant
            </span>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">
              {broker.full_name} · {listing.display_price}
            </p>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <Link
              href={`/${broker.slug}/${listing.slug}/brochure`}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white pointer-events-auto"
            >
              <FileText className="h-4 w-4 text-amber-500" />
              <span className="hidden xs:inline">PDF</span>
            </Link>

            <a
              href={`tel:${broker.phone_number}`}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-3 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-200 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white pointer-events-auto"
            >
              <Phone className="h-4 w-4" />
              <span>Call</span>
            </a>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-95 pointer-events-auto"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp Inquiry</span>
            </a>
          </div>
        </div>
      </div>

      {/* 10. Fullscreen Lightbox Modal */}
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
