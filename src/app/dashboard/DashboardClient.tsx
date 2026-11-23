"use client";

import Link from "next/link";
import {
  Sparkles,
  NotebookPen,
  MoveRight,
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
  Wallet,
  MoreVertical,
  Trash2,
  Tag,
  RefreshCw,
  MessageCircle,
  FolderPlus,
  Folder,
  X,
  ExternalLink,
  Share2,
  Pencil,
  QrCode,
  Plus,
  Globe
} from "lucide-react";
import { DEMO_BROKER } from "@/lib/store";
import { useState, useEffect } from "react";
import { Listing } from "@/types/database";
import useSWR from "swr";

const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DashboardClientProps {
  initialBroker: any;
  initialListings: Listing[];
  initialCollections: any[];
}

export default function DashboardClient({
  initialBroker,
  initialListings,
  initialCollections,
}: DashboardClientProps) {
  const [broker, setBroker] = useState<any>(initialBroker || DEMO_BROKER);
  const [activeTab, setActiveTab] = useState<"listings" | "collections">("listings");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedCollectionSlug, setCopiedCollectionSlug] = useState<string | null>(null);
  const [openMenuSlug, setOpenMenuSlug] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "sold">("all");
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);

  // Collection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isSubmittingCol, setIsSubmittingCol] = useState(false);

  // SWR: Instant load with server fallbackData + background revalidation
  const brokerId = broker?.id || broker?.user_id;
  const listingsKey = brokerId ? `/api/listings?broker_id=${encodeURIComponent(brokerId)}` : "/api/listings";

  const { data: listingsData, mutate: mutateListings } = useSWR(
    listingsKey,
    fetcher,
    {
      fallbackData: { listings: initialListings },
      revalidateOnFocus: true,
      dedupingInterval: 4000,
    }
  );

  const { data: collectionsData, mutate: mutateCollections } = useSWR(
    "/api/collections",
    fetcher,
    {
      fallbackData: { collections: initialCollections },
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const listings: Listing[] = listingsData?.listings || initialListings || [];
  const collections: any[] = collectionsData?.collections || initialCollections || [];

  useEffect(() => {
    // 0. Clear legacy un-scoped localStorage to avoid cross-broker data bleeding
    try {
      localStorage.removeItem("propfolio_listings");
    } catch {}

    // 1. Fetch fresh auth profile in background
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setBroker((prev: any) => ({
            ...prev,
            ...data.user,
            id: data.user.id || data.user.user_id || prev.id,
            full_name: data.user.full_name || prev.full_name,
            phone_number: data.user.phone_number || data.user.phone || prev.phone_number,
            company_name: data.user.company_name || prev.company_name,
            city: data.user.city || prev.city,
            slug: data.user.slug || prev.slug,
          }));
        }
      })
      .catch(() => {});

    // 2. Close open menu on outside click
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-listing-actions]")) {
        setOpenMenuSlug(null);
      }
    }
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  function copyLink(slug: string) {
    if (typeof window === "undefined") return;
    const fullUrl = `${window.location.origin}/${broker.slug}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  function copyCollectionLink(slug: string) {
    if (typeof window === "undefined") return;
    const fullUrl = `${window.location.origin}/${broker.slug}/c/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCollectionSlug(slug);
    setTimeout(() => setCopiedCollectionSlug(null), 2000);
  }

  async function handleToggleStatus(slug: string, currentStatus?: string) {
    const nextStatus = currentStatus === "sold" ? "active" : "sold";
    setOpenMenuSlug(null);

    // Optimistic UI update via SWR
    mutateListings(
      (current: any) => ({
        ...current,
        listings: (current?.listings || listings).map((l: any) =>
          l.slug === slug ? { ...l, status: nextStatus as any } : l
        ),
      }),
      false
    );

    try {
      await fetch("/api/listings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "status", status: nextStatus }),
      });
      mutateListings();
    } catch (err) {
      console.warn("Failed to update status:", err);
    }
  }

  async function handleDeleteListing(slug: string, title: string) {
    setOpenMenuSlug(null);
    const confirmed = window.confirm(`Are you sure you want to permanently delete "${title}"?`);
    if (!confirmed) return;

    // Optimistic UI update via SWR
    mutateListings(
      (current: any) => ({
        ...current,
        listings: (current?.listings || listings).filter((l: any) => l.slug !== slug),
      }),
      false
    );

    try {
      await fetch("/api/listings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "delete" }),
      });
      mutateListings();
    } catch (err) {
      console.warn("Failed to delete listing:", err);
    }
  }

  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!newColTitle.trim() || selectedSlugs.length === 0) {
      alert("Please provide a collection title and select at least 1 property.");
      return;
    }

    setIsSubmittingCol(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newColTitle,
          description: newColDesc,
          listing_slugs: selectedSlugs,
          broker_id: broker.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.collection) {
        mutateCollections(
          (curr: any) => ({
            ...curr,
            collections: [data.collection, ...(curr?.collections || collections)],
          }),
          false
        );
        setIsModalOpen(false);
        setNewColTitle("");
        setNewColDesc("");
        setSelectedSlugs([]);
        setActiveTab("collections");
        mutateCollections();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCol(false);
    }
  }

  async function handleDeleteCollection(slug: string, title: string) {
    if (!window.confirm(`Delete collection "${title}"?`)) return;
    mutateCollections(
      (curr: any) => ({
        ...curr,
        collections: (curr?.collections || collections).filter((c: any) => c.slug !== slug),
      }),
      false
    );
    try {
      await fetch(`/api/collections/${slug}`, { method: "DELETE" });
      mutateCollections();
    } catch (err) {
      console.warn("Delete collection error:", err);
    }
  }

  // ── Plan config derived from broker.plan_tier ───────────────────────────
  const rawTier: string = broker.plan_tier || "free";

  type PlanInfo = {
    label: string;
    limit: number;        // 0 = unlimited
    isUnlimited: boolean;
    color: string;        // tailwind text color
    bgColor: string;      // tailwind bg for badge
    borderColor: string;
    upgradeText: string;
    emoji: string;
  };

  const PLAN_MAP: Record<string, PlanInfo> = {
    free: {
      label: "Starter Free",
      limit: 1,
      isUnlimited: false,
      color: "text-slate-600 dark:text-slate-300",
      bgColor: "bg-slate-100 dark:bg-slate-800",
      borderColor: "border-slate-200/90 dark:border-slate-800",
      upgradeText: "Upgrade to Pro",
      emoji: "🆓",
    },
    pay_per_listing: {
      label: "Pay Per Listing",
      limit: 1,
      isUnlimited: false,
      color: "text-emerald-700 dark:text-emerald-300",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200/80 dark:border-emerald-900/40",
      upgradeText: "Pay ₹79 for more",
      emoji: "📋",
    },
    solo_pro: {
      label: "Solo Broker Pro",
      limit: 25,
      isUnlimited: false,
      color: "text-violet-700 dark:text-violet-300",
      bgColor: "bg-violet-50 dark:bg-violet-950/30",
      borderColor: "border-violet-200/80 dark:border-violet-900/40",
      upgradeText: "Upgrade to Agency",
      emoji: "⭐",
    },
    agency_starter: {
      label: "Agency & Builder",
      limit: 0,
      isUnlimited: true,
      color: "text-amber-700 dark:text-amber-300",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200/80 dark:border-amber-900/40",
      upgradeText: "",
      emoji: "🏢",
    },
  };

  const planInfo: PlanInfo = PLAN_MAP[rawTier] ?? PLAN_MAP["free"];
  const planLimit = planInfo.isUnlimited ? 999 : (broker.listing_credits ?? planInfo.limit);

  // Broker metrics
  const activeCount = listings.filter((l) => l.status !== "sold").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;
  const remainingListings = planInfo.isUnlimited ? 999 : Math.max(0, planLimit - activeCount);
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

  // Filtered listings
  const filteredListings = listings.filter((item) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "sold") return item.status === "sold";
    return item.status !== "sold";
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-[#0a1128] transition-colors dark:bg-[#070b14] dark:text-slate-100">
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        
        {/* ── HEADER (Matching Competitor Img 1 & 2) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a1128] dark:text-white">
              Welcome, {broker.full_name?.split(" ")[0] || "Deepak"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Ready to close some deals?
            </p>
          </div>
          <Link
            href={`/${broker.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-[#1c5436] hover:text-[#1c5436] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            <span>View site</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Link>
        </div>

        {/* ── PLAN / LISTINGS REMAINING ALERT BAR (Plan-Aware) ── */}
        {planInfo.isUnlimited ? (
          // Agency — Unlimited, show success bar
          <div className="mb-4 sm:mb-5 flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 sm:px-4 sm:py-3 text-[11px] sm:text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-1.5 sm:gap-2 font-medium text-emerald-900 dark:text-emerald-200 min-w-0">
              <span className="text-sm">🏢</span>
              <span className="truncate">
                <strong className="font-bold">{planInfo.label}</strong>
                <span className="hidden sm:inline"> · Unlimited listings</span>
              </span>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">
              UNLIMITED
            </span>
          </div>
        ) : remainingListings === 0 ? (
          // Limit reached — red warning
          <div className="mb-4 sm:mb-5 flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl border border-rose-200/90 bg-rose-50 px-3 py-2 sm:px-4 sm:py-3 text-[11px] sm:text-xs dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-1.5 sm:gap-2 font-medium text-rose-900 dark:text-rose-200 min-w-0">
              <NotebookPen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600 shrink-0" />
              <span className="truncate">
                <strong className="font-bold">Listing limit reached</strong>
                <span className="hidden sm:inline"> · {planInfo.label} plan ({planLimit} max)</span>
              </span>
            </div>
            <Link
              href="/pricing"
              className="group flex items-center gap-1.5 shrink-0 rounded-lg sm:rounded-xl bg-rose-600 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-bold text-white shadow-xs hover:bg-rose-700 transition whitespace-nowrap"
            >
              <span>Upgrade Now</span>
              <MoveRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : remainingListings <= 3 ? (
          // Low — amber warning
          <div className="mb-4 sm:mb-5 flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl border border-amber-200/90 bg-[#fffbeb] px-3 py-2 sm:px-4 sm:py-3 text-[11px] sm:text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-1.5 sm:gap-2 font-medium text-amber-900 dark:text-amber-200 min-w-0">
              <NotebookPen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 shrink-0" />
              <span className="truncate">
                <strong className="font-bold">{remainingListings} listing{remainingListings !== 1 ? "s" : ""} left</strong>
                <span className="hidden sm:inline"> · {planInfo.label} ({activeCount}/{planLimit} used)</span>
              </span>
            </div>
            <Link
              href="/pricing"
              className="group flex items-center gap-1.5 shrink-0 rounded-lg sm:rounded-xl bg-slate-900 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-bold text-white shadow-xs hover:bg-slate-800 transition dark:bg-white dark:text-slate-900 whitespace-nowrap"
            >
              <span>{planInfo.upgradeText || "Upgrade"}</span>
              <MoveRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : (
          // Healthy — compact info bar matching plan color
          <div className={`mb-4 sm:mb-5 flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl border ${planInfo.borderColor} ${planInfo.bgColor} px-3 py-2 sm:px-4 sm:py-3 text-[11px] sm:text-xs`}>
            <div className={`flex items-center gap-1.5 sm:gap-2 font-medium min-w-0 ${planInfo.color}`}>
              <span className="text-sm shrink-0">{planInfo.emoji}</span>
              <span className="truncate">
                <strong className="font-bold">{planInfo.label}</strong>
                <span className="hidden sm:inline"> · {activeCount}/{planLimit} listings used</span>
              </span>
            </div>
            {planInfo.upgradeText && (
              <Link
                href="/pricing"
                className="group flex items-center gap-1.5 shrink-0 rounded-lg sm:rounded-xl border border-slate-200 bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-700 hover:border-slate-300 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 whitespace-nowrap"
              >
                <span>{planInfo.upgradeText}</span>
                <MoveRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        )}

        {/* ── GREEN HERO CARD: "YOUR WEBSITE IS LIVE!" (Matching Images 1 & 2) ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d2a23] via-[#1a3c34] to-[#124237] p-5 sm:p-7 text-white shadow-xl mb-5">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* LIVE Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          {/* Title & Subtitle */}
          <h2 className="mt-3 text-xl sm:text-2xl font-extrabold tracking-tight">
            Your website is live!
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-emerald-100/80">
            Your branded link. Every listing you share lives here.
          </p>

          {/* White URL Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex flex-1 items-center justify-between rounded-2xl bg-white px-4 py-3 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-400 text-xs">🔒</span>
                <span className="font-mono text-xs sm:text-sm font-semibold truncate text-[#0a1128] dark:text-white">
                  {typeof window !== "undefined"
                    ? `${window.location.host}/${broker.slug}`
                    : `propertysnaps.co/${broker.slug}`}
                </span>
              </div>
              <Link
                href={`/${broker.slug}`}
                target="_blank"
                className="shrink-0 p-1 text-slate-400 hover:text-[#1c5436] dark:hover:text-emerald-400 transition"
                title="Open Website"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Action Buttons: Copy link & View QR/Profile */}
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(`${window.location.origin}/${broker.slug}`);
                  setCopiedProfileLink(true);
                  setTimeout(() => setCopiedProfileLink(false), 2200);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-100 transition cursor-pointer active:scale-95"
            >
              {copiedProfileLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy link</span>
                </>
              )}
            </button>

            <Link
              href={`/${broker.slug}`}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition cursor-pointer"
            >
              <QrCode className="h-3.5 w-3.5 text-emerald-200" />
              <span>QR code & Profile</span>
            </Link>
          </div>
        </div>

        {/* ── BIG "+ CREATE NEW LISTING" BUTTON (Competitor Img 1 & 2) ── */}
        <Link
          href="/dashboard/listings/new"
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00974e] py-3.5 text-sm font-bold text-white shadow-md shadow-[#00974e]/20 transition hover:bg-[#008042] active:scale-98"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Listing</span>
        </Link>

        {/* Metrics Grid - 3 Cards in 1 Single Row on Mobile (Labels wrap cleanly without cut-off) */}
        <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-5 shadow-xs transition hover:border-[#862e9f]/30 dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="flex items-start justify-between gap-1 text-slate-400">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 leading-tight">
                Active<br className="sm:hidden" /> Listings
              </span>
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00974e] shrink-0 mt-0.5" />
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-xl sm:text-3xl font-extrabold text-[#0a1128] dark:text-white tabular-nums leading-none">
                {listings.length}
              </p>
              <p className="mt-1 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-tight">
                <span className="sm:hidden">{listings.length} live on site</span>
                <span className="hidden sm:inline">{listings.length} live on your site</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-5 shadow-xs transition hover:border-[#862e9f]/30 dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="flex items-start justify-between gap-1 text-slate-400">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 leading-tight">
                Collections
              </span>
              <Folder className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#862e9f] shrink-0 mt-0.5" />
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-xl sm:text-3xl font-extrabold text-[#0a1128] dark:text-white tabular-nums leading-none">
                {collections.length}
              </p>
              <p className="mt-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
                <span className="sm:hidden">{collections.length} collections</span>
                <span className="hidden sm:inline">{collections.length} active collections</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-5 shadow-xs transition hover:border-[#862e9f]/30 dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="flex items-start justify-between gap-1 text-slate-400">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 leading-tight">
                Portfolio<br className="sm:hidden" /> Value
              </span>
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00974e] shrink-0 mt-0.5" />
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-sm sm:text-2xl md:text-3xl font-extrabold text-[#0a1128] dark:text-white leading-none whitespace-nowrap">
                {formatPortfolioValue(totalPortfolioValue)}
              </p>
              <p className="mt-1 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-tight">
                <span className="sm:hidden">Total value</span>
                <span className="hidden sm:inline">Total property value</span>
              </p>
            </div>
          </div>
        </div>

        {/* Primary Dashboard Navigation Tabs */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("listings")}
              className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === "listings"
                  ? "border-[#862e9f] text-[#0a1128] dark:text-white"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>All Properties ({listings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === "collections"
                  ? "border-[#862e9f] text-[#0a1128] dark:text-white"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Layers className="h-4 w-4 text-[#862e9f]" />
              <span>Curated Collections ({collections.length})</span>
              <span className="rounded-full bg-[#862e9f]/10 border border-[#862e9f]/20 px-2 py-0.5 text-[9px] font-bold text-[#862e9f] dark:bg-[#862e9f]/20 dark:border-[#862e9f]/30 dark:text-[#a845c4]">
                PITCH DECKS
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedSlugs([]);
              setNewColTitle("");
              setNewColDesc("");
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1128] shadow-sm transition hover:border-[#862e9f] hover:bg-[#862e9f]/5 dark:border-slate-800 dark:bg-[#0c1222] dark:text-white self-start sm:self-auto shrink-0 mb-2 sm:mb-0"
          >
            <FolderPlus className="h-3.5 w-3.5 text-[#862e9f]" />
            <span>+ Create Collection</span>
          </button>
        </div>

        {/* TAB 1: COLLECTIONS VIEW */}
        {activeTab === "collections" ? (
          <div className="mt-6">
            {collections.length === 0 ? (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <Layers className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">No collections created yet</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Group similar properties into a single branded link to send to clients or investors on WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlugs([]);
                    setNewColTitle("");
                    setNewColDesc("");
                    setIsModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0a1128] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16234b] dark:bg-[#862e9f] dark:text-[#0a1128]"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>Create Your First Collection</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((col) => {
                  const targetUrl = `/${broker.slug || DEMO_BROKER.slug}/c/${col.slug}`;
                  const isCopied = copiedCollectionSlug === col.slug;
                  const samplePhotos = col.sample_photos && col.sample_photos.length > 0 
                    ? col.sample_photos 
                    : [FALLBACK_PHOTO];

                  return (
                    <div
                      key={col.id || col.slug}
                      className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition hover:border-[#862e9f]/40 hover:shadow-lg dark:border-slate-800 dark:bg-[#0c1222]"
                    >
                      <div>
                        {/* 4-Photo Collage / Preview */}
                        <div className="grid grid-cols-2 gap-1 p-2 bg-slate-100 dark:bg-slate-800/50 aspect-[16/9] overflow-hidden">
                          {samplePhotos.slice(0, 4).map((pUrl: string, idx: number) => (
                            <div key={idx} className="relative h-full w-full overflow-hidden rounded-lg bg-slate-200">
                              <img src={pUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {samplePhotos.length === 1 && (
                            <div className="col-span-2 relative h-full w-full -m-2">
                              <img src={samplePhotos[0]} alt="" className="h-full w-full object-cover" />
                            </div>
                          )}
                        </div>

                        <div className="p-4 sm:p-5 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-[#862e9f]/10 border border-[#862e9f]/20 px-2 py-0.5 text-[10px] font-bold text-[#862e9f] dark:bg-[#862e9f]/20 dark:border-[#862e9f]/30 dark:text-[#a845c4]">
                              {col.listing_slugs?.length || col.listing_count || 0} PROPERTIES
                            </span>
                            {col.total_value > 0 && (
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                {formatPortfolioValue(col.total_value)}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-[#0a1128] dark:text-white leading-snug">
                            {col.title}
                          </h3>

                          {col.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {col.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-2 pt-3">
                        <button
                          type="button"
                          onClick={() => copyCollectionLink(col.slug)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#862e9f] active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-slate-400" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `*${col.title}*\nI have put together a custom property shortlist for you.\n\nView Curated Collection:\n${typeof window !== "undefined" ? window.location.origin : ""}${targetUrl}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4 fill-white" />
                          </a>

                          <Link
                            href={targetUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-xl bg-[#0a1128] px-3 py-1.5 text-xs font-semibold text-white shadow-sm border border-[#862e9f]/40 transition hover:bg-[#16234b] dark:bg-[#862e9f] dark:text-[#0a1128]"
                          >
                            <span>View Live</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteCollection(col.slug, col.title)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 dark:border-slate-800"
                            title="Delete Collection"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: PROPERTIES VIEW - Clean Flat Mobile Layout without Double Nesting */
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0a1128] dark:text-white">
                    Your Property Portfolio ({listings.length})
                  </h2>
                </div>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Manage active inventory, mark completed deals as Sold, or share direct WhatsApp links.
                </p>

                {/* Status Filter Tabs */}
                <div className="mt-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      statusFilter === "all"
                        ? "bg-[#1c5436] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    All ({listings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("active")}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      statusFilter === "active"
                        ? "bg-[#1c5436] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("sold")}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      statusFilter === "sold"
                        ? "bg-[#1c5436] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    Sold ({soldCount})
                  </button>
                </div>
              </div>

              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-xs transition hover:border-[#1c5436] hover:text-[#1c5436] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 self-start sm:self-auto shrink-0"
              >
                <PlusCircle className="h-3.5 w-3.5 text-[#1c5436] dark:text-emerald-400" />
                <span>+ New Listing</span>
              </Link>
            </div>

            {filteredListings.length === 0 ? (
              <div className="rounded-3xl border border-slate-200/90 bg-white py-16 text-center shadow-xs dark:border-slate-800 dark:bg-[#0c1222]">
                <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">
                  {statusFilter === "sold" ? "No sold properties yet" : "No active listings found"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {statusFilter === "sold"
                    ? "Mark any closed property deal as 'Sold' to showcase your successful transactions."
                    : "Create your first branded real estate listing in under 30 seconds."}
                </p>
                {statusFilter !== "sold" && (
                  <Link
                    href="/dashboard/listings/new"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1c5436] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#15422a]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Create Listing</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredListings.map((item) => {
                  const rawCover = item.photos?.[0]?.photo_url;
                  const coverPhoto = (rawCover && !rawCover.startsWith("blob:")) ? rawCover : FALLBACK_PHOTO;
                  const targetUrl = `/${broker.slug || DEMO_BROKER.slug}/${item.slug}`;
                  const isSold = item.status === "sold";

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-[#0c1222]"
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
                            className={`h-full w-full object-cover transition-transform duration-300 hover:scale-105 ${
                              isSold ? "grayscale-[40%]" : ""
                            }`}
                          />
                          {isSold && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                                SOLD
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isSold ? (
                              <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                SOLD
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Active
                              </span>
                            )}
                            <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400">
                              {item.bhk ? `${item.bhk} BHK` : ""} {item.property_type}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className={`text-sm sm:text-base font-semibold leading-snug line-clamp-2 break-words ${
                            isSold ? "text-slate-500 line-through dark:text-slate-400" : "text-[#0a1128] dark:text-white"
                          }`}>
                            {item.title}
                          </h3>

                          {/* Price & Specs */}
                          <div className="pt-0.5">
                            <div className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">
                              {item.display_price}
                            </div>

                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-1 truncate max-w-[170px] sm:max-w-none">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#862e9f]" />
                                <span className="truncate">{item.location_locality}, {item.location_city}</span>
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 shrink-0">
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                {item.views_count || 1} views
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons with 3-dot Dropdown */}
                      <div
                        className="relative flex items-center justify-end gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 sm:border-0 sm:pt-0 dark:border-slate-800/80 shrink-0"
                        data-listing-actions
                      >
                        <button
                          type="button"
                          onClick={() => copyLink(item.slug)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#862e9f] hover:bg-[#862e9f]/5 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
                          className="inline-flex items-center gap-1 rounded-xl bg-[#0a1128] px-3 py-1.5 text-xs font-semibold text-white shadow-sm border border-[#862e9f]/40 transition hover:bg-[#16234b] active:scale-95 dark:bg-[#862e9f] dark:text-[#0a1128]"
                        >
                          <span>Open Live</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>

                        {/* Dropdown Options Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuSlug(openMenuSlug === item.slug ? null : item.slug);
                          }}
                          aria-label="Listing options"
                          title="Options (Mark as Sold, Add to Collection, Delete, Share)"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#862e9f] hover:text-[#0a1128] active:scale-90 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 pointer-events-auto"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Action Dropdown Menu */}
                        {openMenuSlug === item.slug && (
                          <div className="absolute right-0 top-10 z-40 w-56 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-[#0c1222] animate-in fade-in zoom-in-95 duration-150">
                            
                            {/* 0. Edit Listing */}
                            <Link
                              href={`/dashboard/listings/new?edit=${item.slug}&step=2`}
                              onClick={() => {
                                setOpenMenuSlug(null);
                                try {
                                  localStorage.setItem("propfolio_active_edit_listing", JSON.stringify(item));
                                } catch {}
                              }}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80"
                            >
                              <Pencil className="h-4 w-4 text-[#1c5436] shrink-0" />
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">Edit Listing</p>
                                <p className="text-[10px] text-slate-400">Modify details, price & photos</p>
                              </div>
                            </Link>

                            {/* 1. Add to Collection */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuSlug(null);
                                setSelectedSlugs([item.slug]);
                                setNewColTitle(`Curated Shortlist (${item.title.slice(0, 24)}...)`);
                                setIsModalOpen(true);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80"
                            >
                              <FolderPlus className="h-4 w-4 text-[#862e9f] shrink-0" />
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">+ Add to Collection</p>
                                <p className="text-[10px] text-slate-400">Bundle with other properties</p>
                              </div>
                            </button>

                            {/* 2. Mark as Sold / Active */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item.slug, item.status)}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80"
                            >
                              {isSold ? (
                                <>
                                  <RefreshCw className="h-4 w-4 text-emerald-600 shrink-0" />
                                  <div>
                                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">Reactivate Listing</p>
                                    <p className="text-[10px] text-slate-400">Set back to active status</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Tag className="h-4 w-4 text-amber-600 shrink-0" />
                                  <div>
                                    <p className="font-semibold text-slate-800 dark:text-white">Mark as Sold</p>
                                    <p className="text-[10px] text-slate-400">Show Sold badge on link</p>
                                  </div>
                                </>
                              )}
                            </button>

                            {/* 3. Share to WhatsApp */}
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(
                                `*${item.title}*\nPrice: ${item.display_price}\nLocation: ${item.location_locality}, ${item.location_city}\n\nView Property Details:\n${typeof window !== "undefined" ? window.location.origin : ""}${targetUrl}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setOpenMenuSlug(null)}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80"
                            >
                              <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">Share to WhatsApp</p>
                                <p className="text-[10px] text-slate-400">Send pre-formatted pitch</p>
                              </div>
                            </a>

                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                            {/* 4. Delete Listing */}
                            <button
                              type="button"
                              onClick={() => handleDeleteListing(item.slug, item.title)}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="h-4 w-4 shrink-0" />
                              <div>
                                <p className="font-semibold">Delete Listing</p>
                                <p className="text-[10px] text-rose-400 dark:text-rose-500">Permanently remove</p>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODAL: CREATE CURATED COLLECTION */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0c1222] max-h-[90vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1128] text-[#862e9f] border border-[#862e9f]/30 dark:bg-[#16234b]">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0a1128] dark:text-white">
                      Create Curated Collection
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bundle matching properties into a single shareable pitch deck for WhatsApp.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateCollection} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Collection Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    placeholder="e.g. 4 BHK Luxury Shortlist for Mr. Sharma"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none focus:border-[#862e9f] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Personal Note / Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newColDesc}
                    onChange={(e) => setNewColDesc(e.target.value)}
                    placeholder="e.g. Hand-picked properties with clear title, clubhouse access, and immediate possession."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-[#862e9f] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                {/* Listing Selection */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Select Properties ({selectedSlugs.length} selected) *
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedSlugs(listings.map((l) => l.slug))}
                        className="text-[#862e9f] hover:underline font-medium"
                      >
                        Select All
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setSelectedSlugs([])}
                        className="text-slate-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-2 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
                    {listings.map((l) => {
                      const isSelected = selectedSlugs.includes(l.slug);
                      const cover = l.photos?.[0]?.photo_url || FALLBACK_PHOTO;

                      return (
                        <div
                          key={l.id}
                          onClick={() => {
                            setSelectedSlugs((prev) =>
                              isSelected ? prev.filter((s) => s !== l.slug) : [...prev, l.slug]
                            );
                          }}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl p-2 transition ${
                            isSelected
                              ? "bg-white shadow-sm border border-[#862e9f] dark:bg-slate-900"
                              : "hover:bg-white/60 dark:hover:bg-slate-900/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 rounded accent-[#0a1128]"
                          />
                          <img src={cover} alt="" className="h-10 w-12 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#0a1128] dark:text-white truncate">
                              {l.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {l.display_price} · {l.location_locality}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCol || !newColTitle.trim() || selectedSlugs.length === 0}
                    className="rounded-xl bg-[#0a1128] px-5 py-2 text-xs font-bold text-white shadow-md border border-[#862e9f]/40 hover:bg-[#16234b] disabled:opacity-50 dark:bg-[#862e9f] dark:text-[#0a1128]"
                  >
                    {isSubmittingCol ? "Creating..." : "Create & Get Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

