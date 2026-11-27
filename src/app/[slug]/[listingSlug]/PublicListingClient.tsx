"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Zap,
  Droplets,
  Camera,
  Waves,
  Dumbbell,
  Trees,
  ArrowUpDown,
  Bath,
  FileCheck,
  Landmark,
  IndianRupee,
  Train,
  Calendar,
  Sun,
  UtensilsCrossed,
  Wind,
  Eye,
  LayoutGrid,
  ArrowLeft,
  Pencil,
  ClipboardList,
  ExternalLink,
} from "lucide-react";
import { getListingFromMemory, saveListingToMemory, INITIAL_LISTINGS, DEMO_BROKER } from "@/lib/store";
import { Listing, ListingPhoto, Profile } from "@/types/database";

interface ClientProps {
  slug: string;
  listingSlug: string;
  initialListing?: Listing;
  initialBroker?: Profile;
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

function getFeatureIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("config") || l.includes("bhk") || l.includes("bed")) return Bed;
  if (l.includes("carpet") || l.includes("area") || l.includes("size") || l.includes("sq")) return Maximize2;
  if (l.includes("built") || l.includes("super") || l.includes("layout")) return Layers;
  if (l.includes("bath") || l.includes("wash") || l.includes("toilet")) return Bath;
  if (l.includes("floor") || l.includes("storey") || l.includes("tower")) return Building2;
  if (l.includes("furnish") || l.includes("sofa")) return Sofa;
  if (l.includes("facing") || l.includes("direction") || l.includes("highway") || l.includes("road")) return Compass;
  if (l.includes("possession") || l.includes("date") || l.includes("age") || l.includes("year")) return Calendar;
  if (l.includes("balcony") || l.includes("terrace") || l.includes("light") || l.includes("sun")) return Sun;
  if (l.includes("kitchen") || l.includes("cooking")) return UtensilsCrossed;
  if (l.includes("wardrobe") || l.includes("closet")) return Layers;
  if (l.includes("air") || l.includes("ac") || l.includes("ventilat") || l.includes("wind")) return Wind;
  if (l.includes("view") || l.includes("sight")) return Eye;
  if (l.includes("park") || l.includes("car") || l.includes("vehicle") || l.includes("visitor")) return Car;
  if (l.includes("lift") || l.includes("elevator")) return ArrowUpDown;
  if (l.includes("kid") || l.includes("child") || l.includes("play")) return Sparkles;
  if (l.includes("society") || l.includes("community") || l.includes("building")) return Building2;
  if (l.includes("water") || l.includes("supply")) return Droplets;
  if (l.includes("power") || l.includes("backup") || l.includes("electr")) return Zap;
  if (l.includes("security") || l.includes("guard")) return ShieldCheck;
  if (l.includes("cctv") || l.includes("camera")) return Camera;
  if (l.includes("intercom") || l.includes("phone")) return Phone;
  if (l.includes("pool") || l.includes("swim")) return Waves;
  if (l.includes("gym") || l.includes("fitness")) return Dumbbell;
  if (l.includes("club") || l.includes("party")) return Building2;
  if (l.includes("jogging") || l.includes("track") || l.includes("lawn") || l.includes("yoga") || l.includes("garden")) return Trees;
  if (l.includes("rera") || l.includes("title")) return FileCheck;
  if (l.includes("loan") || l.includes("bank")) return Landmark;
  if (l.includes("maint") || l.includes("cost") || l.includes("price") || l.includes("fee")) return IndianRupee;
  if (l.includes("negotiable")) return Sparkles;
  if (l.includes("metro") || l.includes("station") || l.includes("train")) return Train;
  return CheckCircle2;
}

const EMPTY_LISTING: Listing = {
  id: "",
  broker_id: "",
  title: "Property Listing",
  slug: "",
  description: "",
  property_type: "Apartment",
  listing_type: "Sale",
  price_amount: 0,
  display_price: "",
  currency: "INR",
  location_city: "",
  location_locality: "",
  amenities: [],
  ai_highlights: [],
  ai_neighborhood_highlights: [],
  status: "active",
  views_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  photos: [],
};

export default function PublicListingClient({
  slug,
  listingSlug,
  initialListing,
  initialBroker,
}: ClientProps) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing>(() => {
    const base = (
      initialListing ||
      getListingFromMemory(listingSlug) ||
      INITIAL_LISTINGS.find((l) => l.slug === listingSlug) ||
      EMPTY_LISTING
    );
    return {
      ...base,
      broker: base.broker || initialBroker || DEMO_BROKER,
    };
  });
  const broker = listing?.broker || initialBroker || DEMO_BROKER;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Keep listing synced if server props update
  useEffect(() => {
    if (initialListing && (initialListing.slug === listingSlug || initialListing.id === listingSlug)) {
      setListing({
        ...initialListing,
        broker: initialListing.broker || initialBroker || DEMO_BROKER,
      });
    }
  }, [initialListing, initialBroker, listingSlug]);

  // Touch Swipe State for Mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fallback to gallery photos if listing has 0 photos
  const initialPhotos = useMemo(() => {
    if (listing.photos && listing.photos.length > 0) {
      return listing.photos;
    }
    return DEFAULT_GALLERY_PHOTOS;
  }, [listing.photos]);

  const [photos, setPhotos] = useState<ListingPhoto[]>(initialPhotos);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [savedOrderToast, setSavedOrderToast] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const user = data.user;
          const cleanUserPhone = (user.phone_number || user.phone || "").replace(/\D/g, "");
          const cleanBrokerPhone = (broker.phone_number || "").replace(/\D/g, "");
          const matchesPhone = Boolean(
            cleanUserPhone &&
            cleanBrokerPhone &&
            (cleanUserPhone.endsWith(cleanBrokerPhone) || cleanBrokerPhone.endsWith(cleanUserPhone))
          );
          const matchesSlug = Boolean(
            user.slug && broker.slug && user.slug.toLowerCase() === broker.slug.toLowerCase()
          );
          const matchesId = Boolean(
            user.id && (user.id === broker.id || user.id === broker.user_id || user.id === listing.broker_id)
          );
          setIsOwner(Boolean(matchesSlug || matchesPhone || matchesId));
        } else {
          setIsOwner(false);
        }
      })
      .catch(() => setIsOwner(false));
  }, [broker.slug, broker.id, broker.phone_number, broker.user_id, listing.broker_id]);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const handleMovePhoto = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= photos.length) return;
    const next = [...photos];
    const item = next.splice(fromIdx, 1)[0];
    next.splice(toIdx, 0, item);
    const updated = next.map((p, i) => ({
      ...p,
      display_order: i + 1,
      is_cover: i === 0,
    }));
    setPhotos(updated);
  };

  const handleMakeCover = (idx: number) => {
    if (idx === 0) return;
    handleMovePhoto(idx, 0);
  };

  const handleSavePhotoOrder = () => {
    const updatedListing: Listing = {
      ...listing,
      photos: photos.map((p, i) => ({
        ...p,
        display_order: i + 1,
        is_cover: i === 0,
      })),
      updated_at: new Date().toISOString(),
    };
    saveListingToMemory(updatedListing);
    setIsReorderModalOpen(false);
    setActivePhotoIdx(0);
    setSavedOrderToast(true);
    setTimeout(() => setSavedOrderToast(false), 3000);
  };

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

  // Categorized Property Features (From saved listing or rich defaults)
  const { homeFeatures, buildingFeatures, ownershipFeatures, nearbyFeatures } = useMemo(() => {
    if (listing.property_features && listing.property_features.length > 0) {
      const active = listing.property_features.filter((f) => f.value && f.value.trim().length > 0);
      return {
        homeFeatures: active.filter((f) => f.section === "Home Details"),
        buildingFeatures: active.filter((f) => f.section === "Building & Amenities"),
        ownershipFeatures: active.filter((f) => f.section === "Ownership & Costs"),
        nearbyFeatures: active.filter((f) => f.section === "Nearby & Enquiry"),
      };
    }

    // Default Fallbacks for listings
    return {
      homeFeatures: [
        { label: "Configuration", value: listing.bhk ? `${listing.bhk} BHK` : "4 BHK" },
        { label: "Carpet Area", value: listing.carpet_area_sqft ? `${listing.carpet_area_sqft.toLocaleString()} Sq.Ft.` : "1,650 Sq.Ft." },
        { label: "Super Built-Up Area", value: "2,450 Sq.Ft." },
        { label: "Bathrooms", value: listing.bathrooms ? `${listing.bathrooms} attached` : "4 attached" },
        { label: "Floor", value: "12th Floor" },
        { label: "Furnishing", value: "Semi-Furnished" },
        { label: "Facing", value: "West Facing" },
        { label: "Possession", value: "Ready to Move, Immediate Possession" },
        { label: "Balcony", value: "Open Balcony" },
        { label: "Kitchen", value: "Modular Kitchen" },
        { label: "Air Conditioning", value: "5 AC included" },
        { label: "Ventilation", value: "Cross ventilation" },
      ],
      buildingFeatures: [
        { label: "Car Parking", value: "2 Covered" },
        { label: "Visitor Parking", value: "1 Visitor Slot" },
        { label: "Property Age", value: "5-Year-Old" },
        { label: "Building", value: "Premium High-Rise Tower" },
        { label: "Lifts", value: "2 High-Speed Lifts per Tower" },
        { label: "Society", value: "Peaceful, Green & Gated Society" },
        { label: "Water Supply", value: "24×7" },
        { label: "Power Backup", value: "100%" },
        { label: "Security", value: "24×7 Surveillance" },
        { label: "CCTV", value: "Yes" },
        { label: "Swimming Pool", value: "Yes" },
        { label: "Gym", value: "Yes" },
      ],
      ownershipFeatures: [
        { label: "RERA", value: "Registered" },
        { label: "Title", value: "Clear title" },
        { label: "Bank Loan", value: "Approved (SBI, HDFC, ICICI)" },
        { label: "Maintenance", value: "₹6,000/month" },
        { label: "Negotiable", value: "Yes, for genuine buyers" },
      ],
      nearbyFeatures: [
        { label: "Metro Station", value: "2 km away" },
        { label: "SG Highway", value: "1.5 km away" },
      ],
    };
  }, [listing]);

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

  // Resolve broker phone number reliably
  const rawBrokerPhone = broker?.phone_number || initialBroker?.phone_number || initialListing?.broker?.phone_number || "";
  const cleanPhoneDigits = rawBrokerPhone.replace(/\D/g, "");

  // Derive human broker name
  let brokerName = (broker?.full_name || initialBroker?.full_name || "").trim();
  if (!brokerName || brokerName.toLowerCase() === "real estate broker") {
    // If generic fallback, extract clean display name from broker's slug (e.g. "deepak-202" -> "Deepak")
    if (slug && slug !== "broker") {
      const cleanSlugPart = slug.split("-")[0];
      if (cleanSlugPart && cleanSlugPart.length > 1) {
        brokerName = cleanSlugPart.charAt(0).toUpperCase() + cleanSlugPart.slice(1);
      }
    }
  }

  // Format phone number for tel: link (+91... for Indian mobile numbers)
  const telNumber = cleanPhoneDigits.length === 10
    ? `+91${cleanPhoneDigits}`
    : cleanPhoneDigits.length > 10
      ? `+${cleanPhoneDigits}`
      : rawBrokerPhone.trim();
  const telLink = telNumber ? `tel:${telNumber}` : "#";

  // Pre-filled WhatsApp message with property link
  const waPhone = cleanPhoneDigits.length === 10
    ? `91${cleanPhoneDigits}`
    : cleanPhoneDigits.startsWith("91")
      ? cleanPhoneDigits
      : cleanPhoneDigits.length > 0
        ? `91${cleanPhoneDigits}`
        : "917252058269";

  // Resolve true broker slug for clean subdomain URL (e.g. deepak-202.propertysnaps.in)
  const resolvedBrokerSlug =
    (broker?.slug && broker.slug !== "broker" && broker.slug !== "l" ? broker.slug : null) ||
    (initialBroker?.slug && initialBroker.slug !== "broker" && initialBroker.slug !== "l" ? initialBroker.slug : null) ||
    (slug && slug !== "broker" && slug !== "l" ? slug : null) ||
    "broker";

  // Build clean canonical property link for WhatsApp & sharing
  let listingUrl = `https://${resolvedBrokerSlug}.propertysnaps.in/l/${listingSlug}`;
  if (typeof window !== "undefined") {
    const host = window.location.host;
    if (host.includes("localhost")) {
      listingUrl = `${window.location.protocol}//${resolvedBrokerSlug}.localhost:3000/l/${listingSlug}`;
    } else if (resolvedBrokerSlug !== "broker") {
      listingUrl = `https://${resolvedBrokerSlug}.propertysnaps.in/l/${listingSlug}`;
    }
  }

  const propertyHeading = listing.title || `${listing.bhk ? `${listing.bhk} BHK ` : ""}${listing.property_type || "Property"} in ${listing.location_locality || listing.location_city}`;

  const waGreeting = brokerName && brokerName.toLowerCase() !== "real estate broker"
    ? `Hi ${brokerName},`
    : "Hello,";

  const waMessage = [
    waGreeting,
    `I am interested in your property listing: *${propertyHeading}* (${listing.display_price}).`,
    `🔗 Property Link: ${listingUrl}`,
    `Is this property still available? Can we schedule a site visit?`,
  ].join("\n\n");

  const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;

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
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (!listing.slug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] p-6 text-center dark:bg-[#070b14]">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-sm dark:bg-[#0c1222]">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">Property Not Found</h1>
          <p className="mt-2 text-sm text-slate-500">This property listing does not exist or may have been removed.</p>
          <Link href="/" className="mt-6 inline-block rounded-xl bg-[#00974e] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#008243]">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-32 sm:pb-36 text-[#0a1128] antialiased selection:bg-[#862e9f]/20 selection:text-[#0a1128] dark:bg-[#070b14] dark:text-slate-100">

      {/* MAIN CONTAINER WITH RESPONSIVE DESKTOP & MOBILE GRID */}
      <main className="mx-auto max-w-6xl px-0 sm:px-6 pt-0 sm:pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* ========================================================= */}
          {/* LEFT COLUMN: HERO GALLERY & PROPERTY SPECS (8 Cols Desktop) */}
          {/* ========================================================= */}
          <div className="space-y-0 sm:space-y-6 lg:col-span-8">

            {/* Gallery Section - Full bleed edge-to-edge on mobile */}
            <section className="space-y-0 sm:space-y-3">
              <div
                className="group relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden rounded-none sm:rounded-3xl bg-slate-200 shadow-none sm:shadow-xl ring-0 sm:ring-1 ring-slate-900/5 select-none dark:bg-slate-900 dark:ring-white/10"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={currentPhoto.photo_url}
                  alt={listing.title}
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_GALLERY_PHOTOS[0].photo_url;
                  }}
                  onClick={() => setIsLightboxOpen(true)}
                  className="h-full w-full cursor-zoom-in object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
                />

                {/* Top Badges */}
                <div className="absolute left-3.5 top-3.5 sm:left-4 sm:top-4 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-none">
                  <span className="rounded-full bg-[#0a1128]/85 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md shadow-sm">
                    {listing.listing_type === "Sale" ? "FOR SALE" : "FOR RENT"}
                  </span>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md shadow-sm">
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
                  className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 z-30 flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-full bg-[#0a1128]/70 border border-[#862e9f]/30 text-white shadow-lg backdrop-blur-md transition hover:bg-[#0a1128]/95 hover:scale-105 active:scale-95 pointer-events-auto"
                  title="View Fullscreen"
                  aria-label="View Fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {/* Photo Counter Pill */}
                <div className="absolute bottom-9 right-4 sm:bottom-4 sm:right-4 z-20 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold tracking-wider text-white backdrop-blur-md pointer-events-none shadow-md">
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
                      className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 cursor-pointer items-center justify-center rounded-full bg-[#0a1128]/60 border border-[#862e9f]/30 text-white shadow-lg backdrop-blur-md transition hover:bg-[#0a1128]/90 active:scale-90 pointer-events-auto"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 cursor-pointer items-center justify-center rounded-full bg-[#0a1128]/60 border border-[#862e9f]/30 text-white shadow-lg backdrop-blur-md transition hover:bg-[#0a1128]/90 active:scale-90 pointer-events-auto"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails without ugly native scrollbars */}
              {photos.length > 1 && (
                <div className="hidden sm:flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative aspect-[4/3] w-18 sm:w-24 shrink-0 cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all pointer-events-auto ${activePhotoIdx === idx
                        ? "border-[#862e9f] scale-[0.98] shadow-md shadow-[#862e9f]/25 ring-2 ring-[#862e9f]/30"
                        : "border-transparent opacity-65 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={p.photo_url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_GALLERY_PHOTOS[0].photo_url;
                        }}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Property Key Details & Pricing - Curved Sheet Overlap Effect on Mobile */}
            <section className="relative z-10 -mt-6 sm:mt-0 rounded-t-[32px] sm:rounded-3xl border-t sm:border border-slate-200/90 bg-white p-5 sm:p-6 shadow-none dark:border-slate-800 dark:bg-[#0c1222] overflow-hidden">

              {/* Action Buttons: If Owner -> Show Edit, Reorder, Add Form | If Buyer/Visitor -> Show Download Brochure, Share */}
              {isOwner ? (
                <div className="grid grid-cols-2 sm:flex sm:flex-nowrap items-center gap-2 sm:gap-2.5 mb-5">
                  <Link
                    href={`/dashboard/listings/new?edit=${listing.slug}&step=2`}
                    onClick={() => {
                      try {
                        localStorage.setItem("propfolio_active_edit_listing", JSON.stringify(listing));
                      } catch { }
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1c5436] hover:bg-[#15422a] py-2 px-3 text-xs font-semibold text-white shadow-sm transition active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5 text-emerald-200" />
                    <span>Edit Listing</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsReorderModalOpen(true)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 shadow-sm transition active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    <Camera className="h-3.5 w-3.5 text-slate-500" />
                    <span>Reorder Photos</span>
                  </button>

                  <a
                    href={`/${broker.slug}/${listing.slug}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 shadow-sm transition active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 whitespace-nowrap"
                  >
                    <FileText className="h-3.5 w-3.5 text-purple-600" />
                    <span>Download PDF</span>
                  </a>

                  <Link
                    href={`/dashboard/listings/new?edit=${listing.slug}&section=enquiry-form#enquiry-form`}
                    onClick={() => {
                      try {
                        localStorage.setItem("propfolio_active_edit_listing", JSON.stringify(listing));
                      } catch { }
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 shadow-sm transition active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 whitespace-nowrap"
                  >
                    <ClipboardList className="h-3.5 w-3.5 text-slate-500" />
                    <span>{listing.enquiry_form_url ? "Edit Form" : "Add form"}</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-5">
                  <a
                    href={`/${broker.slug}/${listing.slug}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 py-2 px-3.5 text-xs font-bold text-purple-700 shadow-xs transition active:scale-95 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-300 whitespace-nowrap"
                  >
                    <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Download PDF Brochure</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${listing.bhk ? `${listing.bhk} BHK ` : ""}${listing.property_type || "Property"} in ${listing.location_locality || listing.location_city}`,
                          url: window.location.href,
                        }).catch(() => { });
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                        setShareToast(true);
                        setTimeout(() => setShareToast(false), 2500);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 py-2 px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Share Property</span>
                  </button>

                  {listing.enquiry_form_url && (
                    <a
                      href={listing.enquiry_form_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 py-2 px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 whitespace-nowrap"
                    >
                      <ClipboardList className="h-3.5 w-3.5 text-slate-500" />
                      <span>Online Inquiry Form</span>
                    </a>
                  )}
                </div>
              )}

              {/* Location Landmark Tag (Clean & Elegant Modern Styling) */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wider text-slate-600 dark:text-slate-300 uppercase">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="break-words">
                  {listing.location_locality ? `${listing.location_locality}, ` : ""}
                  {listing.location_city}
                </span>
              </div>

              {/* Title (Editorial Hierarchy - Clean & Not Overly Bold) */}
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0a1128] dark:text-white leading-snug break-words">
                {listing.bhk ? `${listing.bhk} BHK ` : ""}{listing.property_type || "Apartment"} for {listing.listing_type || "Sale"} in {listing.location_locality || listing.location_city}
              </h1>

              {/* For Sale Tag Pill (Soft light green pill matching reference) */}
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                  <span>🏠</span>
                  <span>For {listing.listing_type || "Sale"}</span>
                </span>
              </div>

              {/* Price Row (Dark green prominent display) */}
              <div className="mt-2.5 flex flex-wrap items-baseline gap-2 sm:gap-3 border-b border-slate-100 pb-5 dark:border-slate-800/80">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#00974e] dark:text-[#00b85f]">
                  {listing.display_price}
                </span>
                {ratePerSqft && (
                  <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                    · Approx. ₹{ratePerSqft.toLocaleString("en-IN")} / sq.ft
                  </span>
                )}
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Negotiable
                </span>
              </div>

              {/* Quick Summary Badges (Clean Strip) */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {listing.bhk && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200">
                    <Bed className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {listing.bhk} BHK
                  </span>
                )}
                {listing.carpet_area_sqft && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200">
                    <Maximize2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {listing.carpet_area_sqft.toLocaleString()} Sq.Ft.
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {listing.property_type || "Apartment"}
                </span>
              </div>
            </section>

            {/* 1. PROPERTY HIGHLIGHTS */}
            {listing.ai_highlights && listing.ai_highlights.length > 0 && (
              <section className="mt-4 sm:mt-0 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-none sm:shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#862e9f]" />
                    <span>PROPERTY HIGHLIGHTS</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                    Verified
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {listing.ai_highlights.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-[#f8f9fc] p-3 sm:p-3.5 transition-all hover:border-[#862e9f]/30 dark:border-slate-800/80 dark:bg-[#090e1c]"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a1128] text-xs font-bold text-white border border-[#862e9f]/30 dark:bg-[#16234b]">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-normal leading-relaxed text-slate-700 dark:text-slate-300 break-words">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. HOME DETAILS */}
            {homeFeatures.length > 0 && (
              <section className="mt-4 sm:mt-0 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-none sm:shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Home className="h-4 w-4 text-[#862e9f]" />
                    <span>Home Details</span>
                  </h3>
                  <span className="text-xs font-medium text-slate-400">
                    {homeFeatures.length} Specifications
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                  {homeFeatures.map((item, idx) => {
                    const Icon = getFeatureIcon(item.label);
                    const isLong = (item.value || "").length > 22;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 sm:gap-3 rounded-2xl border border-slate-100 bg-[#f8f9fc] p-3 min-w-0 dark:border-slate-800 dark:bg-[#090e1c] ${isLong ? "col-span-2 sm:col-span-2 md:col-span-1" : "col-span-1"
                          }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm border border-slate-200/70 dark:bg-[#17130a] dark:text-[#a845c4] dark:border-[#3d331d] mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
                            {item.label}
                          </span>
                          <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0a1128] dark:text-white leading-snug break-words">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. BUILDING & AMENITIES */}
            {buildingFeatures.length > 0 && (
              <section className="mt-4 sm:mt-0 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-none sm:shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#862e9f]" />
                    <span>Building & Amenities</span>
                  </h3>
                  <span className="text-xs font-medium text-slate-400">
                    {buildingFeatures.length} Features
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                  {buildingFeatures.map((item, idx) => {
                    const Icon = getFeatureIcon(item.label);
                    const isLong = (item.value || "").length > 22;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 sm:gap-3 rounded-2xl border border-slate-100 bg-[#f8f9fc] p-3 min-w-0 dark:border-slate-800 dark:bg-[#090e1c] ${isLong ? "col-span-2 sm:col-span-2 md:col-span-1" : "col-span-1"
                          }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm border border-slate-200/70 dark:bg-[#17130a] dark:text-[#a845c4] dark:border-[#3d331d] mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
                            {item.label}
                          </span>
                          <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0a1128] dark:text-white leading-snug break-words">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. OWNERSHIP & COSTS */}
            {ownershipFeatures.length > 0 && (
              <section className="mt-4 sm:mt-0 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-none sm:shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-[#862e9f]" />
                    <span>Ownership & Costs</span>
                  </h3>
                  <span className="text-xs font-medium text-slate-400">
                    {ownershipFeatures.length} Records
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                  {ownershipFeatures.map((item, idx) => {
                    const Icon = getFeatureIcon(item.label);
                    const isLong = (item.value || "").length > 22;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 sm:gap-3 rounded-2xl border border-slate-100 bg-[#f8f9fc] p-3 min-w-0 dark:border-slate-800 dark:bg-[#090e1c] ${isLong ? "col-span-2 sm:col-span-2 md:col-span-1" : "col-span-1"
                          }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm border border-slate-200/70 dark:bg-[#17130a] dark:text-[#a845c4] dark:border-[#3d331d] mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
                            {item.label}
                          </span>
                          <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0a1128] dark:text-white leading-snug break-words">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 5. AMENITIES & FACILITIES */}
            {listing.amenities && listing.amenities.length > 0 && (
              <section className="mt-4 sm:mt-0 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-none sm:shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#862e9f]" />
                    <span>Amenities & Facilities</span>
                  </h3>
                  <span className="text-xs font-medium text-slate-400">{listing.amenities.length} Verified Facilities</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {listing.amenities.map((am, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-[#f8f9fc] p-2.5 text-xs sm:text-sm font-semibold text-[#0a1128] transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-[#090e1c] dark:text-slate-200 min-w-0"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="leading-snug break-words">{am}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. LOCATION ADVANTAGES & CONNECTIVITY */}
            {((listing.ai_neighborhood_highlights && listing.ai_neighborhood_highlights.length > 0) || nearbyFeatures.length > 0) && (
              <section className="mt-4 sm:mt-0 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-none sm:shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-[#862e9f]" />
                    <span>Location Advantages & Connectivity</span>
                  </h3>
                </div>

                {nearbyFeatures.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                    {nearbyFeatures.map((item, idx) => {
                      const Icon = getFeatureIcon(item.label);
                      const isLong = (item.value || "").length > 22;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-2.5 sm:gap-3 rounded-2xl border border-slate-100 bg-[#f8f9fc] p-3 min-w-0 dark:border-slate-800 dark:bg-[#090e1c] ${isLong ? "col-span-2 sm:col-span-2 md:col-span-1" : "col-span-1"
                            }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm border border-slate-200/70 dark:bg-[#17130a] dark:text-[#a845c4] dark:border-[#3d331d] mt-0.5">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
                              {item.label}
                            </span>
                            <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0a1128] dark:text-white leading-snug break-words">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {listing.ai_neighborhood_highlights && listing.ai_neighborhood_highlights.length > 0 && (
                  <div className="mt-3.5 space-y-2">
                    {listing.ai_neighborhood_highlights.map((nh, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 rounded-xl bg-[#f8f9fc] p-2.5 sm:p-3 text-xs sm:text-sm font-medium text-slate-700 dark:bg-[#090e1c] dark:text-slate-300 break-words"
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#862e9f]" />
                        <span className="break-words leading-relaxed">{nh}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 6b. PROPERTY VIDEO WALKTHROUGH */}
            {listing.video_url && !listing.video_url.startsWith("blob:") && (() => {
              const vUrl = listing.video_url.trim();
              const ytMatch = vUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/);
              const ytEmbedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
              return (
                <section className="mt-4 sm:mt-0 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-none sm:shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Video Walkthrough
                    </h3>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-2xl bg-black">
                    {ytEmbedUrl ? (
                      <iframe
                        src={ytEmbedUrl}
                        title={`${listing.title} Video Walkthrough`}
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : /\.(mp4|webm|mov)(\?|$)/i.test(vUrl) ? (
                      <video src={vUrl} controls className="aspect-video w-full bg-black" />
                    ) : (
                      <div className="flex items-center justify-between bg-slate-900 p-4 text-white">
                        <span className="text-sm font-medium">Property Video Tour Available</span>
                        <a
                          href={vUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-[#00974e] px-4 py-2 text-xs font-bold text-white hover:bg-[#007a3f]"
                        >
                          Watch Video →
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              );
            })()}

            {/* 7. ABOUT THIS PROPERTY */}
            <section className="mt-4 sm:mt-0 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-none sm:shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#862e9f]" />
                  <span>About this Property</span>
                </h3>
              </div>
              <div className="mt-3 text-base sm:text-lg leading-relaxed text-slate-600 whitespace-pre-line dark:text-slate-300 break-words">
                {listing.description}
              </div>
            </section>

            {/* Interactive Live EMI Estimator */}
            <section className="mt-4 sm:mt-0 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-none sm:shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
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
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#862e9f] dark:bg-slate-800 pointer-events-auto"
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
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#862e9f] dark:bg-slate-800 pointer-events-auto"
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
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#862e9f] dark:bg-slate-800 pointer-events-auto"
                    />
                  </div>
                </div>

                {/* Monthly Summary Box */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-gradient-to-tr from-white to-[#862e9f]/5 p-5 md:col-span-5 dark:border-slate-800 dark:from-[#0c1222] dark:to-[#862e9f]/10">
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
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#862e9f]" />
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
              <div id="inquiry-form" className="rounded-3xl border-2 border-[#862e9f]/40 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-[#862e9f]/30 dark:bg-[#0c1222] dark:shadow-none">
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
                    href={telLink}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-[#f8f9fa] py-3 text-xs font-semibold text-[#0a1128] transition hover:bg-white hover:border-[#862e9f] active:scale-95 dark:border-slate-800 dark:bg-[#090e1c] dark:text-white pointer-events-auto"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Call Broker {rawBrokerPhone ? `(${rawBrokerPhone})` : ""}</span>
                  </a>

                  {/* PDF Download */}
                  <a
                    href={`/${broker.slug}/${listing.slug}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-700 transition hover:border-[#862e9f] hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0c1222] dark:text-slate-300"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#862e9f]" />
                    <span>Download PDF Brochure</span>
                  </a>

                  {listing.enquiry_form_url && (
                    <a
                      href={listing.enquiry_form_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-600/30 bg-emerald-50/70 py-2.5 text-xs font-bold text-[#1c5436] transition hover:bg-emerald-100/70 active:scale-95 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300 pointer-events-auto"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>Share Requirement (Google Form)</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
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
                    alt={brokerName || broker.full_name}
                    className="h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-md dark:border-slate-800"
                  />
                  <div>
                    <h4 className="text-base font-bold text-[#0a1128] dark:text-white flex items-center gap-1.5">
                      {brokerName || broker.full_name}
                      <ShieldCheck className="h-4 w-4 text-[#862e9f]" />
                    </h4>
                    {(broker.company_name || broker.city) && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {broker.company_name}
                        {broker.company_name && broker.city ? " · " : ""}
                        {broker.city || ""}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] font-semibold text-[#862e9f]">
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

      {/* 3. MOBILE FLOATING STICKY ACTION BAR (Screens < 1024px) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white/95 px-4 py-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-[#070b14]/95 pointer-events-auto">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">

          {/* Price Preview */}
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              For {listing.listing_type || "Sale"}
            </span>
            <span className="block truncate text-base font-bold text-emerald-700 dark:text-emerald-400">
              {listing.display_price}
            </span>
          </div>

          {/* Quick Buttons: Call + WhatsApp */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={telLink}
              aria-label="Call Broker"
              className="flex h-10 w-10 sm:h-11 sm:w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-[#f8f9fa] text-slate-700 shadow-sm transition hover:border-[#862e9f] active:scale-95 dark:border-slate-800 dark:bg-[#0c1222] dark:text-slate-200"
            >
              <Phone className="h-4 w-4 text-emerald-600" />
            </a>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 sm:h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-600 px-3.5 sm:px-5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
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

      {/* ========================================================= */}
      {/* 5. REORDER PHOTOS MODAL (OWNER ONLY)                       */}
      {/* ========================================================= */}
      {isOwner && isReorderModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm pointer-events-auto select-none"
          onClick={() => setIsReorderModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#1c5436] dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0a1128] dark:text-white">
                    Reorder Photos
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Use arrows to adjust the sequence. Photo #1 is your cover/hero photo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReorderModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Photo Grid */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className={`relative rounded-2xl border overflow-hidden p-2 transition bg-white dark:bg-slate-900 ${idx === 0
                      ? "border-[#1c5436] ring-2 ring-[#1c5436]/20 shadow-md"
                      : "border-slate-200 dark:border-slate-800"
                      }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <img
                        src={p.photo_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {/* Badge */}
                      <div className="absolute top-2 left-2">
                        {idx === 0 ? (
                          <span className="rounded-full bg-[#1c5436] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            ★ Cover Photo
                          </span>
                        ) : (
                          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                            #{idx + 1}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controls below each photo */}
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePhoto(idx, idx - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          title="Move earlier"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === photos.length - 1}
                          onClick={() => handleMovePhoto(idx, idx + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          title="Move later"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleMakeCover(idx)}
                          className="text-[10px] font-bold text-[#1c5436] hover:underline dark:text-emerald-400"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <Link
                href={`/dashboard/listings/new?edit=${listing.slug}&step=1`}
                className="text-xs font-semibold text-slate-600 hover:text-[#1c5436] dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1"
              >
                <span>Full Photo Editor & Uploads</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(false)}
                  className="flex-1 sm:flex-initial rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePhotoOrder}
                  className="flex-1 sm:flex-initial rounded-xl bg-[#1c5436] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#15422a] transition active:scale-95"
                >
                  Save Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Saved Toast */}
      {savedOrderToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-emerald-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>Photo sequence updated successfully!</span>
        </div>
      )}

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-[#0a1128] px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl dark:bg-white dark:text-[#0a1128] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>Property link copied to clipboard!</span>
        </div>
      )}

    </div>
  );
}
