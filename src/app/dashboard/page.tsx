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
  Share2
} from "lucide-react";
import { getAllMemoryListings, DEMO_BROKER } from "@/lib/store";
import { useState, useEffect } from "react";
import { Listing } from "@/types/database";

const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80";

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>(getAllMemoryListings());
  const [collections, setCollections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "collections">("listings");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedCollectionSlug, setCopiedCollectionSlug] = useState<string | null>(null);
  const [broker, setBroker] = useState<any>(DEMO_BROKER);
  const [openMenuSlug, setOpenMenuSlug] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "sold">("all");

  // Collection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isSubmittingCol, setIsSubmittingCol] = useState(false);

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

    // 3. Fetch collections
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        if (data.collections) setCollections(data.collections);
      })
      .catch((err) => console.warn("Failed to fetch collections:", err));

    // 4. Close open menu on outside click
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

    // Optimistic UI update
    setListings((prev) =>
      prev.map((l) => (l.slug === slug ? { ...l, status: nextStatus as any } : l))
    );

    try {
      await fetch("/api/listings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "status", status: nextStatus }),
      });
    } catch (err) {
      console.warn("Failed to update status:", err);
    }
  }

  async function handleDeleteListing(slug: string, title: string) {
    setOpenMenuSlug(null);
    const confirmed = window.confirm(`Are you sure you want to permanently delete "${title}"?`);
    if (!confirmed) return;

    // Optimistic UI update
    setListings((prev) => prev.filter((l) => l.slug !== slug));

    try {
      await fetch("/api/listings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "delete" }),
      });
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
        setCollections((prev) => [data.collection, ...prev]);
        setIsModalOpen(false);
        setNewColTitle("");
        setNewColDesc("");
        setSelectedSlugs([]);
        setActiveTab("collections");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCol(false);
    }
  }

  async function handleDeleteCollection(slug: string, title: string) {
    if (!window.confirm(`Delete collection "${title}"?`)) return;
    setCollections((prev) => prev.filter((c) => c.slug !== slug));
    try {
      await fetch(`/api/collections/${slug}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Delete collection error:", err);
    }
  }

  // Broker metrics
  const planLimit = broker.plan_limit || 30;
  const activeCount = listings.filter((l) => l.status !== "sold").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;
  const remainingListings = Math.max(0, planLimit - activeCount);
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

        {/* Primary Dashboard Navigation Tabs */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("listings")}
              className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === "listings"
                  ? "border-[#c5a059] text-[#0a1128] dark:text-white"
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
                  ? "border-[#c5a059] text-[#0a1128] dark:text-white"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Layers className="h-4 w-4 text-[#c5a059]" />
              <span>Curated Collections ({collections.length})</span>
              <span className="rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2 py-0.5 text-[9px] font-bold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
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
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1128] shadow-sm transition hover:border-[#c5a059] hover:bg-[#fbf6ec]/50 dark:border-slate-800 dark:bg-[#0c1222] dark:text-white self-start sm:self-auto shrink-0 mb-2 sm:mb-0"
          >
            <FolderPlus className="h-3.5 w-3.5 text-[#c5a059]" />
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
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0a1128] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16234b] dark:bg-[#c5a059] dark:text-[#0a1128]"
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
                      className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition hover:border-[#c5a059]/40 hover:shadow-lg dark:border-slate-800 dark:bg-[#0c1222]"
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
                            <span className="rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2 py-0.5 text-[10px] font-bold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
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
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#c5a059] active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
                            className="inline-flex items-center gap-1 rounded-xl bg-[#0a1128] px-3 py-1.5 text-xs font-semibold text-white shadow-sm border border-[#c5a059]/40 transition hover:bg-[#16234b] dark:bg-[#c5a059] dark:text-[#0a1128]"
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
          /* TAB 2: PROPERTIES VIEW */
          <div className="mt-6 rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#0a1128] dark:text-white">
                    Your Property Portfolio ({listings.length})
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Manage active inventory, mark completed deals as Sold, or share direct WhatsApp links.
                </p>

                {/* Status Filter Tabs */}
                <div className="mt-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      statusFilter === "all"
                        ? "bg-[#0a1128] text-white dark:bg-[#c5a059] dark:text-[#0a1128]"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    All ({listings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("active")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      statusFilter === "active"
                        ? "bg-[#0a1128] text-white dark:bg-[#c5a059] dark:text-[#0a1128]"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("sold")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      statusFilter === "sold"
                        ? "bg-[#0a1128] text-white dark:bg-[#c5a059] dark:text-[#0a1128]"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    Sold ({soldCount})
                  </button>
                </div>
              </div>

              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 transition hover:border-[#c5a059] hover:bg-[#fbf6ec]/60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 self-start sm:self-auto shrink-0"
              >
                <PlusCircle className="h-3.5 w-3.5 text-[#c5a059]" />
                <span>+ New Listing</span>
              </Link>
            </div>

            {filteredListings.length === 0 ? (
              <div className="py-16 text-center">
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
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0a1128] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16234b]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>Create Listing</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredListings.map((item) => {
                  const rawCover = item.photos?.[0]?.photo_url;
                  const coverPhoto = (rawCover && !rawCover.startsWith("blob:")) ? rawCover : FALLBACK_PHOTO;
                  const targetUrl = `/${broker.slug || DEMO_BROKER.slug}/${item.slug}`;
                  const isSold = item.status === "sold";

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
                              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                SOLD
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Active
                              </span>
                            )}
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {item.bhk ? `${item.bhk} BHK` : ""} {item.property_type}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 break-words ${
                            isSold ? "text-slate-500 line-through dark:text-slate-400" : "text-[#0a1128] dark:text-white"
                          }`}>
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

                      {/* Action buttons with 3-dot Dropdown */}
                      <div
                        className="relative flex items-center justify-end gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 sm:border-0 sm:pt-0 dark:border-slate-800/80 shrink-0"
                        data-listing-actions
                      >
                        <button
                          type="button"
                          onClick={() => copyLink(item.slug)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#c5a059] hover:bg-[#fbf6ec]/50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
                          className="inline-flex items-center gap-1 rounded-xl bg-[#0a1128] px-3 py-1.5 text-xs font-semibold text-white shadow-sm border border-[#c5a059]/40 transition hover:bg-[#16234b] active:scale-95 dark:bg-[#c5a059] dark:text-[#0a1128]"
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
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#c5a059] hover:text-[#0a1128] active:scale-90 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 pointer-events-auto"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Action Dropdown Menu */}
                        {openMenuSlug === item.slug && (
                          <div className="absolute right-0 top-10 z-40 w-56 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-[#0c1222] animate-in fade-in zoom-in-95 duration-150">
                            
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
                              <FolderPlus className="h-4 w-4 text-[#c5a059] shrink-0" />
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#16234b]">
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
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
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
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-[#c5a059] focus:bg-white dark:border-slate-700 dark:bg-slate-900"
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
                        className="text-[#c5a059] hover:underline font-medium"
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
                              ? "bg-white shadow-sm border border-[#c5a059] dark:bg-slate-900"
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
                    className="rounded-xl bg-[#0a1128] px-5 py-2 text-xs font-bold text-white shadow-md border border-[#c5a059]/40 hover:bg-[#16234b] disabled:opacity-50 dark:bg-[#c5a059] dark:text-[#0a1128]"
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

