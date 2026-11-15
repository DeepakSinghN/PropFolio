"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
  Building2,
  MapPin,
  Share2,
  QrCode,
  Pencil,
  Plus,
  ExternalLink,
  Copy,
  Check,
  X,
  Download,
  MessageCircle,
  SlidersHorizontal,
  Home,
  CheckCircle2,
} from "lucide-react";
import { Listing, Profile } from "@/types/database";

interface BrokerProfileClientProps {
  slug: string;
  initialBroker: Profile;
  initialListings: Listing[];
}

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80";

export default function BrokerProfileClient({
  slug,
  initialBroker,
  initialListings,
}: BrokerProfileClientProps) {
  const [broker, setBroker] = useState<Profile>(initialBroker);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [filterType, setFilterType] = useState<"all" | "Sale" | "Rent">("all");
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // Set current URL and fetch fresh user / listings
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(`${window.location.origin}/${slug}`);

      // Try reading local storage listings if present
      try {
        const stored = localStorage.getItem("propfolio_listings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setListings((prev) => {
              const combined = [...parsed, ...prev];
              const unique = Array.from(new Map(combined.map((item) => [item.slug, item])).values());
              return unique;
            });
          }
        }
      } catch {}

      // Fetch fresh listings from API
      fetch("/api/listings")
        .then((res) => res.json())
        .then((data) => {
          if (data.listings && data.listings.length > 0) {
            setListings((prev) => {
              const combined = [...data.listings, ...prev];
              return Array.from(new Map(combined.map((item) => [item.slug, item])).values());
            });
          }
        })
        .catch(() => {});

      // Fetch fresh auth user
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setBroker((prev) => ({
              ...prev,
              full_name: data.user.full_name || prev.full_name,
              phone_number: data.user.phone_number || prev.phone_number,
              company_name: data.user.company_name || prev.company_name,
              city: data.user.city || prev.city,
            }));
          }
        })
        .catch(() => {});
    }
  }, [slug]);

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleShare = () => {
    if (navigator.share && currentUrl) {
      navigator
        .share({
          title: `${broker.full_name}'s Property Portfolio`,
          text: `Check out verified property listings by ${broker.full_name}`,
          url: currentUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const downloadQrCode = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-property-qr.png`;
    a.click();
  };

  // Filter active listings
  const filteredListings = listings.filter((l) => {
    if (l.status === "sold") return false;
    if (filterType === "all") return true;
    return l.listing_type === filterType;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#0a1128] antialiased selection:bg-[#1c5436]/20 selection:text-[#0a1128] dark:bg-[#070b14] dark:text-slate-100">
      
      {/* ── TOP NAVBAR (Matching Competitor Header) ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#0c1222]/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c5436] text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0a1128] dark:text-white">
              Property Snaps
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-[#1c5436] dark:hover:text-emerald-400 transition">
              Home
            </Link>
            <Link href="/pricing" className="hover:text-[#1c5436] dark:hover:text-emerald-400 transition">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-[#1c5436] dark:hover:text-emerald-400 transition">
              Contact
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer transition active:scale-95"
            >
              <QrCode className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              <span className="hidden sm:inline">QR code</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-xl bg-[#1c5436] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#15422a] cursor-pointer transition active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── GREEN HERO BANNER (Image 3 Style) ── */}
      <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-[#0d2a23] via-[#1a3c34] to-[#124237] shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(46,125,50,0.25),transparent_70%)]" />
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        
        {/* Profile Card & Properties Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-20 sm:-mt-24">
          
          {/* ── LEFT COLUMN: FLOATING BROKER PROFILE & QR CARD ── */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="relative z-10 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#0c1222]">
              
              {/* Avatar Circle */}
              <div className="flex justify-center -mt-16 sm:-mt-20">
                <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-3xl font-extrabold text-[#1c5436] shadow-lg dark:border-[#0c1222] dark:bg-emerald-950 dark:text-emerald-300">
                  {broker.full_name ? broker.full_name[0].toUpperCase() : "D"}
                </div>
              </div>

              {/* Broker Name & Company */}
              <div className="mt-4 text-center">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a1128] dark:text-white">
                  {broker.full_name}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {broker.company_name} {broker.city ? `· ${broker.city}` : ""}
                </p>

                {/* Edit profile button */}
                <div className="mt-4 flex justify-center">
                  <Link
                    href="/dashboard"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1c5436] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#15422a] transition active:scale-95"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit profile</span>
                  </Link>
                </div>
              </div>

              {/* ── EMBEDDED QR CODE CARD (Exact Competitor Image 3) ── */}
              <div
                onClick={() => setIsQrModalOpen(true)}
                className="mt-6 flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 shadow-xs transition hover:border-[#1c5436]/40 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                <div className="shrink-0 rounded-xl bg-white p-2 shadow-xs dark:bg-white">
                  {currentUrl ? (
                    <QRCodeSVG value={currentUrl} size={64} level="M" />
                  ) : (
                    <div className="h-16 w-16 bg-slate-100 animate-pulse rounded" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#0a1128] dark:text-white">
                    Open on your phone
                  </h4>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                    Point your phone camera here to save {broker.full_name}&apos;s page.
                  </p>
                </div>
              </div>

              {/* Direct share / copy buttons */}
              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${broker.full_name}'s verified property listings: ${currentUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-xl bg-[#25D366] p-2 text-white shadow-xs hover:bg-[#20ba59] transition"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick stats badge */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0c1222] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Verified Agent Profile
              </span>
              <span className="font-bold text-[#1c5436] dark:text-emerald-400">
                {listings.length} Active Listings
              </span>
            </div>
          </div>

          {/* ── RIGHT COLUMN: PROPERTIES LIST (Image 3 Grid) ── */}
          <div className="lg:col-span-8 pt-4 lg:pt-0">
            
            {/* Properties Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a1128] dark:text-white">
                  Properties
                </h2>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#1c5436] px-2 text-xs font-bold text-white shadow-xs">
                  {filteredListings.length}
                </span>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    filterType === "all"
                      ? "bg-[#1c5436] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  All ({listings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("Sale")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    filterType === "Sale"
                      ? "bg-[#1c5436] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  For Sale
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("Rent")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    filterType === "Rent"
                      ? "bg-[#1c5436] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  For Rent
                </button>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Existing Listings */}
              {filteredListings.map((item) => {
                const cover = item.photos?.[0]?.photo_url || FALLBACK_PHOTO;
                return (
                  <Link
                    key={item.slug}
                    href={`/${slug}/${item.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-lg hover:border-[#1c5436]/40 dark:border-slate-800 dark:bg-[#0c1222]"
                  >
                    {/* Photo Container */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={cover}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_PHOTO;
                        }}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {/* Tag: For Sale / Rent */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                          {item.listing_type === "Sale" ? "For Sale" : "For Rent"}
                        </span>
                        {item.bhk && (
                          <span className="rounded-full bg-white/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs">
                            {item.bhk} BHK
                          </span>
                        )}
                      </div>

                      {/* Price Pill at Bottom Left */}
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-xl bg-[#1c5436] px-3 py-1 text-sm font-extrabold text-white shadow-md">
                          {item.display_price}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#0a1128] dark:text-white line-clamp-1 group-hover:text-[#1c5436] transition">
                          {item.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">
                            {item.location_locality || item.location_city}
                          </span>
                        </p>
                      </div>

                      {/* Specs badges */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800">
                        <span>{item.carpet_area_sqft ? `${item.carpet_area_sqft.toLocaleString()} Sq.Ft.` : item.property_type}</span>
                        <span className="font-semibold text-[#1c5436] dark:text-emerald-400 flex items-center gap-0.5">
                          <span>View Property</span>
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Dashed "+ Add listing" Card (Image 3 Style) */}
              <Link
                href="/dashboard/listings/new"
                className="group flex aspect-[16/10] sm:aspect-auto sm:min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-6 text-center shadow-xs transition hover:border-[#1c5436] hover:bg-emerald-50/20 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-emerald-700"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-[#1c5436] group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
                  <Plus className="h-6 w-6" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1c5436]">
                  Add listing
                </h4>
                <p className="mt-1 text-xs text-slate-400 max-w-[200px]">
                  Add a new property to showcase on your public portfolio
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── HIGH RESOLUTION QR CODE MODAL ── */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsQrModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0c1222] text-center">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-[#1c5436] dark:bg-emerald-950 dark:text-emerald-300">
                <QrCode className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-3 text-lg font-bold text-[#0a1128] dark:text-white">
              {broker.full_name}&apos;s Portfolio QR
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Anyone can scan this with their phone camera to instantly view your full listings page.
            </p>

            {/* Canvas QR Code for clean download */}
            <div
              ref={qrCanvasRef}
              className="mt-5 flex justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-white"
            >
              {currentUrl && (
                <QRCodeCanvas
                  value={currentUrl}
                  size={200}
                  level="H"
                  marginSize={2}
                />
              )}
            </div>

            {/* Target URL */}
            <p className="mt-3 text-xs font-mono text-slate-500 truncate">
              {currentUrl}
            </p>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={downloadQrCode}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c5436] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#15422a] transition active:scale-95 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download QR Code (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-400" />
                    <span>Copy Profile Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
