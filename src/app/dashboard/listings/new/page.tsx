"use client";

import { useState, useRef, useCallback, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  UploadCloud,
  X,
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clock,
  ChevronRight,
  Bed,
  Maximize2,
  Sofa,
  Camera,
  Video,
  GripVertical,
  Plus,
  Home as HomeIcon,
  Store,
  Warehouse,
  LandPlot,
  Building,
  IndianRupee,
  DollarSign,
  Bath,
  Pencil,
  Layers,
  Compass,
  Calendar,
  Car,
  Zap,
  Shield,
  Dumbbell,
  Trees,
  Waves,
  Baby,
  Gamepad2,
  BookOpen,
  School,
  Hospital,
  Train,
  ShoppingCart,
  Sun,
  Droplets,
  Flame,
  Phone as PhoneIcon,
  Eye,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowUpDown,
  Tag,
  TrendingDown,
  LayoutGrid,
  Wind,
  UtensilsCrossed,
  FileCheck,
  Landmark,
  Mail,
} from "lucide-react";
import { ParsedPropertyData, PropertyType, ListingType, Listing } from "@/types/database";
import { saveListingToMemory, getListingFromMemory, getAllMemoryListings, INITIAL_LISTINGS, DEMO_BROKER } from "@/lib/store";

/* ======================================================================== */
/* CONSTANTS                                                                 */
/* ======================================================================== */

const PROPERTY_CATEGORIES = [
  { id: "residential", value: "Apartment", label: "RESIDENTIAL", icon: HomeIcon, color: "text-emerald-600" },
  { id: "comm_office", value: "Commercial", label: "COMMERCIAL OFFICE", icon: Building, color: "text-blue-600" },
  { id: "comm_shop", value: "Commercial", label: "COMMERCIAL SHOP", icon: Store, color: "text-purple-600" },
  { id: "warehouse", value: "Commercial", label: "WAREHOUSE", icon: Warehouse, color: "text-orange-600" },
  { id: "plot", value: "Plot", label: "PLOT / LAND", icon: LandPlot, color: "text-amber-600" },
  { id: "whole_building", value: "Villa", label: "WHOLE BUILDING", icon: Building2, color: "text-rose-600" },
] as const;

const TRANSACTION_TYPES: ListingType[] = ["Sale", "Rent"];

const AMENITY_OPTIONS = [
  "Lift", "Power Backup", "24x7 Water", "Security/CCTV",
  "Gated Community", "Visitor Parking", "Swimming Pool", "Gymnasium",
  "Clubhouse", "Kids Play Area", "Jogging Track", "Tennis Court",
  "Badminton Court", "Indoor Games", "Library", "Community Hall",
  "Amphitheatre", "Shopping Centre", "School", "Hospital Nearby",
  "Metro Nearby", "Vastu Compliant", "Rainwater Harvesting", "Solar Panels",
  "EV Charging", "Pet Friendly", "Intercom", "Gas Pipeline",
  "Maintenance Staff", "Guard", "Video Door Phone", "Fire Safety",
  "Earthquake Resistant",
];

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

const AI_WHATSAPP_PRESETS = [
  {
    label: "4 BHK Bodakdev (Sale)",
    text: "4 BHK Flat for sale in Bodakdev Ahmedabad. 1650 sqft carpet, 2450 super built-up, 12th floor, 4 attached baths, 2 covered car parking, west facing, ready to move, asking 3.25 Cr negotiable, modular kitchen, amenities: gym, swimming pool, 24x7 security, club house."
  },
  {
    label: "3 BHK Satellite (Furnished)",
    text: "Ultra modern 3 BHK Fully Furnished apartment in Satellite, Ahmedabad. 1450 sqft carpet, 7th floor, 3 baths, 2 balconies, east facing, 5-year-old society, asking 1.45 Cr negotiable. Amenities: lift, 100% power backup, CCTV, kids play area."
  },
  {
    label: "2 BHK Rental (Near Metro)",
    text: "2 BHK apartment for rent in Andheri West Mumbai. 850 sqft carpet, semi-furnished with modular kitchen, 15th floor, 2 baths, road facing, rent 65,000 per month. 5 mins walk to metro station, 24x7 water supply, 1 covered parking."
  }
];

export interface PropertyFeatureItem {
  id: string;
  section: string;
  label: string;
  value: string;
  placeholder?: string;
}

const INITIAL_PROPERTY_FEATURES: PropertyFeatureItem[] = [
  // Home Details
  { id: "hf-1", section: "Home Details", label: "CONFIGURATION", value: "", placeholder: "4 BHK" },
  { id: "hf-2", section: "Home Details", label: "CARPET AREA", value: "", placeholder: "1,650 Sq.Ft." },
  { id: "hf-3", section: "Home Details", label: "SUPER BUILT-UP AREA", value: "", placeholder: "2,450 Sq.Ft." },
  { id: "hf-4", section: "Home Details", label: "BATHROOMS", value: "", placeholder: "4 attached" },
  { id: "hf-5", section: "Home Details", label: "FLOOR", value: "", placeholder: "12th Floor" },
  { id: "hf-6", section: "Home Details", label: "FURNISHING", value: "", placeholder: "Semi-Furnished" },
  { id: "hf-7", section: "Home Details", label: "FACING", value: "", placeholder: "West Facing" },
  { id: "hf-8", section: "Home Details", label: "POSSESSION", value: "", placeholder: "Ready to Move, Immediate Possession" },
  { id: "hf-9", section: "Home Details", label: "BALCONY", value: "", placeholder: "Open Balcony" },
  { id: "hf-10", section: "Home Details", label: "KITCHEN", value: "", placeholder: "Modular Kitchen" },
  { id: "hf-11", section: "Home Details", label: "WARDROBES", value: "", placeholder: "Included" },
  { id: "hf-12", section: "Home Details", label: "AIR CONDITIONING", value: "", placeholder: "5 AC included" },
  { id: "hf-13", section: "Home Details", label: "NATURAL LIGHT", value: "", placeholder: "Excellent" },
  { id: "hf-14", section: "Home Details", label: "VENTILATION", value: "", placeholder: "Cross ventilation" },
  { id: "hf-15", section: "Home Details", label: "VIEW", value: "", placeholder: "City view" },

  // Building & Amenities
  { id: "ba-1", section: "Building & Amenities", label: "KIDS PLAY AREA", value: "", placeholder: "Yes" },
  { id: "ba-2", section: "Building & Amenities", label: "CAR PARKING", value: "", placeholder: "2 Covered" },
  { id: "ba-3", section: "Building & Amenities", label: "VISITOR PARKING", value: "", placeholder: "1 Visitor Slot" },
  { id: "ba-4", section: "Building & Amenities", label: "PROPERTY AGE", value: "", placeholder: "5-Year-Old" },
  { id: "ba-5", section: "Building & Amenities", label: "BUILDING", value: "", placeholder: "Premium High-Rise Tower" },
  { id: "ba-6", section: "Building & Amenities", label: "LIFTS", value: "", placeholder: "2 High-Speed Lifts per Tower" },
  { id: "ba-7", section: "Building & Amenities", label: "SOCIETY", value: "", placeholder: "Peaceful, Green & Gated Residential Society" },
  { id: "ba-8", section: "Building & Amenities", label: "WATER SUPPLY", value: "", placeholder: "24×7" },
  { id: "ba-9", section: "Building & Amenities", label: "POWER BACKUP", value: "", placeholder: "100%" },
  { id: "ba-10", section: "Building & Amenities", label: "SECURITY", value: "", placeholder: "24×7" },
  { id: "ba-11", section: "Building & Amenities", label: "CCTV", value: "", placeholder: "Yes" },
  { id: "ba-12", section: "Building & Amenities", label: "INTERCOM", value: "", placeholder: "Yes" },
  { id: "ba-13", section: "Building & Amenities", label: "SWIMMING POOL", value: "", placeholder: "Yes" },
  { id: "ba-14", section: "Building & Amenities", label: "GYM", value: "", placeholder: "Yes" },
  { id: "ba-15", section: "Building & Amenities", label: "CLUBHOUSE", value: "", placeholder: "Yes" },
  { id: "ba-16", section: "Building & Amenities", label: "JOGGING TRACK", value: "", placeholder: "Yes" },
  { id: "ba-17", section: "Building & Amenities", label: "YOGA DECK", value: "", placeholder: "Yes" },
  { id: "ba-18", section: "Building & Amenities", label: "PARTY LAWN", value: "", placeholder: "Yes" },

  // Ownership & Costs
  { id: "oc-1", section: "Ownership & Costs", label: "RERA", value: "", placeholder: "Registered" },
  { id: "oc-2", section: "Ownership & Costs", label: "TITLE", value: "", placeholder: "Clear title" },
  { id: "oc-3", section: "Ownership & Costs", label: "BANK LOAN", value: "", placeholder: "Approved (SBI, HDFC, ICICI)" },
  { id: "oc-4", section: "Ownership & Costs", label: "MAINTENANCE", value: "", placeholder: "₹6,000/month" },
  { id: "oc-5", section: "Ownership & Costs", label: "NEGOTIABLE", value: "", placeholder: "Yes, for genuine buyers" },

  // Nearby & Enquiry
  { id: "ne-1", section: "Nearby & Enquiry", label: "METRO STATION", value: "", placeholder: "2 km away" },
  { id: "ne-2", section: "Nearby & Enquiry", label: "SG HIGHWAY", value: "", placeholder: "1.5 km away" },
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
  if (l.includes("kid") || l.includes("child") || l.includes("play")) return Baby;
  if (l.includes("society") || l.includes("community") || l.includes("building")) return Building;
  if (l.includes("water") || l.includes("supply")) return Droplets;
  if (l.includes("power") || l.includes("backup") || l.includes("electr")) return Zap;
  if (l.includes("security") || l.includes("guard")) return Shield;
  if (l.includes("cctv") || l.includes("camera")) return Camera;
  if (l.includes("intercom") || l.includes("phone")) return PhoneIcon;
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

/* ======================================================================== */
/* HELPER: Compress image before storing                                     */
/* ======================================================================== */
async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target?.result as string; };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 1200;
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
      else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL("image/jpeg", 0.78)); }
      else resolve(img.src);
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

/* ======================================================================== */
/* COMPONENT                                                                 */
/* ======================================================================== */

export function ListingEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const sectionParam = searchParams.get("section");
  const stepParam = searchParams.get("step");

  /* ── Edit Existing Listing Tracking ── */
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ── Wizard Step ── */
  const [step, setStep] = useState<1 | 2 | 3>(1);

  /* ── Step 1: Photos & Video ── */
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  /* ── Step 2: Property Details ── */
  const [detailsMode, setDetailsMode] = useState<"ai" | "manual">("ai");
  const [selectedCategoryId, setSelectedCategoryId] = useState("residential");
  const [headline, setHeadline] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("Apartment");
  const [transactionType, setTransactionType] = useState<ListingType>("Sale");
  const [currency, setCurrency] = useState("INR");
  const [negotiable, setNegotiable] = useState(true);
  const [displayPrice, setDisplayPrice] = useState("");
  const [priceAmount, setPriceAmount] = useState<number>(0);
  const [bhk, setBhk] = useState<number | undefined>();
  const [bedrooms, setBedrooms] = useState<number | undefined>();
  const [bathrooms, setBathrooms] = useState<number | undefined>();
  const [carpetArea, setCarpetArea] = useState<number | undefined>();
  const [superBuiltUp, setSuperBuiltUp] = useState<number | undefined>();
  const [floor, setFloor] = useState("");
  const [furnishing, setFurnishing] = useState("Semi-Furnished");
  const [facing, setFacing] = useState("");
  const [possession, setPossession] = useState("Ready to Move");
  const [propertyAge, setPropertyAge] = useState("");

  /* ── Dynamic Property Features Sections ── */
  const [featureSections, setFeatureSections] = useState<string[]>([
    "Home Details",
    "Building & Amenities",
    "Ownership & Costs",
    "Nearby & Enquiry",
  ]);
  const [featuresList, setFeaturesList] = useState<PropertyFeatureItem[]>(INITIAL_PROPERTY_FEATURES);
  const [newSectionName, setNewSectionName] = useState("");
  const [showAddSectionInput, setShowAddSectionInput] = useState(false);
  const [locationCity, setLocationCity] = useState("");
  const [locationLocality, setLocationLocality] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenities, setCustomAmenities] = useState<string[]>([
    "2 High-Speed Lifts per Tower",
    "24×7 Water Supply",
    "100% Power Backup",
    "24×7 Security",
    "CCTV",
    "Gym",
    "Yoga Deck",
    "Party Lawn"
  ]);
  const [newAmenityInput, setNewAmenityInput] = useState("");
  const [showAddAmenityInput, setShowAddAmenityInput] = useState(false);

  /* ── AI Content ── */
  const [rawNotes, setRawNotes] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCooldownTimer, setAiCooldownTimer] = useState(0);
  const aiCooldownRef = useRef<NodeJS.Timeout | null>(null);
  const [aiDescription, setAiDescription] = useState("");
  const [aiHighlights, setAiHighlights] = useState<string[]>([]);
  const [aiNeighborhood, setAiNeighborhood] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  // Clear AI cooldown on unmount
  useEffect(() => {
    return () => {
      if (aiCooldownRef.current) clearInterval(aiCooldownRef.current);
    };
  }, []);

  const startAiCooldown = (seconds: number) => {
    if (aiCooldownRef.current) clearInterval(aiCooldownRef.current);
    setAiCooldownTimer(seconds);
    aiCooldownRef.current = setInterval(() => {
      setAiCooldownTimer((prev) => {
        if (prev <= 1) {
          if (aiCooldownRef.current) clearInterval(aiCooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── AI Magic Auto-Fill (WhatsApp / Raw Notes) ── */
  const [aiMagicInput, setAiMagicInput] = useState("");
  const [aiParsedPreview, setAiParsedPreview] = useState<ParsedPropertyData | null>(null);
  const [aiMagicSuccessMsg, setAiMagicSuccessMsg] = useState<string | null>(null);

  /* ── Enrich Your Listing (Optional) ── */
  const [urgencyBadge, setUrgencyBadge] = useState("");
  const [roomSortNote, setRoomSortNote] = useState("");
  const [neighbourhoodNote, setNeighbourhoodNote] = useState("");
  const [priceHistoryNote, setPriceHistoryNote] = useState("");
  const [expandedEnrich, setExpandedEnrich] = useState<string | null>("urgency");

  /* ── Enquiry Form (Google Form integration) ── */
  const [enquiryFormUrl, setEnquiryFormUrl] = useState("");
  const [enquiryFormGate, setEnquiryFormGate] = useState(false);

  /* ── Helper to populate state from any listing object ── */
  const applyListingData = useCallback((existing: any) => {
    if (!existing) return;
    setEditingSlug(existing.slug);
    setEditingId(existing.id);
    setHeadline(existing.title || "");
    setPropertyType(existing.property_type || "Apartment");

    // Match category
    const foundCat = PROPERTY_CATEGORIES.find((c) => c.value === existing.property_type);
    if (foundCat) setSelectedCategoryId(foundCat.id);

    setTransactionType(existing.listing_type || "Sale");
    setDisplayPrice(existing.display_price || "");
    setPriceAmount(existing.price_amount || 0);
    setBhk(existing.bhk);
    setBedrooms(existing.bedrooms || existing.bhk);
    setBathrooms(existing.bathrooms);
    setCarpetArea(existing.carpet_area_sqft);
    setLocationCity(existing.location_city || "");
    setLocationLocality(existing.location_locality || "");
    setSelectedAmenities(existing.amenities || []);
    setAiDescription(existing.description || "");
    if (existing.ai_highlights?.length) {
      setAiHighlights(existing.ai_highlights);
    }
    if (existing.ai_neighborhood_highlights?.length) {
      setAiNeighborhood(existing.ai_neighborhood_highlights);
    }

    // Existing Photos
    if (existing.photos && existing.photos.length > 0) {
      const urls = existing.photos
        .map((p: any) => (typeof p === "string" ? p : p.photo_url))
        .filter(Boolean);
      if (urls.length > 0) setPhotos(urls);
    }

    // Features breakdown
    if (existing.property_features && existing.property_features.length > 0) {
      setFeaturesList(existing.property_features);
    } else {
      // Pre-fill features from existing listing specs so they aren't blank
      setFeaturesList((prev) =>
        prev.map((f) => {
          if (f.label === "CONFIGURATION" && existing.bhk) return { ...f, value: `${existing.bhk} BHK` };
          if (f.label === "CARPET AREA" && existing.carpet_area_sqft) return { ...f, value: `${existing.carpet_area_sqft.toLocaleString()} Sq.Ft.` };
          if (f.label === "SUPER BUILT-UP AREA" && existing.carpet_area_sqft) return { ...f, value: `${Math.round(existing.carpet_area_sqft * 1.4).toLocaleString()} Sq.Ft.` };
          if (f.label === "BATHROOMS" && existing.bathrooms) return { ...f, value: `${existing.bathrooms} attached` };
          if (f.label === "FLOOR") return { ...f, value: "12th Floor" };
          if (f.label === "FURNISHING") return { ...f, value: "Semi-Furnished" };
          if (f.label === "FACING") return { ...f, value: "West Facing" };
          if (f.label === "POSSESSION") return { ...f, value: "Ready to Move, Immediate Possession" };
          if (f.label === "CAR PARKING") return { ...f, value: "2 Covered" };
          if (f.label === "WATER SUPPLY") return { ...f, value: "24×7" };
          if (f.label === "POWER BACKUP") return { ...f, value: "100%" };
          if (f.label === "SECURITY") return { ...f, value: "24×7" };
          if (f.label === "CCTV") return { ...f, value: "Yes" };
          return f;
        })
      );
    }

    // Google Form
    if (existing.enquiry_form_url) {
      setEnquiryFormUrl(existing.enquiry_form_url);
    }
    if (typeof existing.enquiry_form_gate === "boolean") {
      setEnquiryFormGate(existing.enquiry_form_gate);
    }
  }, []);

  /* ── Pre-fill when editing existing listing ── */
  useEffect(() => {
    if (!editParam) return;

    // 1. Try local storage cache
    let found: any = null;
    try {
      const localStr = localStorage.getItem("propfolio_active_edit_listing");
      if (localStr) {
        const parsed = JSON.parse(localStr);
        if (parsed.slug === editParam || parsed.id === editParam) {
          found = parsed;
        }
      }
    } catch {}

    // 2. Try memory / initial
    if (!found) {
      found =
        getListingFromMemory(editParam) ||
        getAllMemoryListings().find((l) => l.slug === editParam || l.id === editParam) ||
        INITIAL_LISTINGS.find((l) => l.slug === editParam || l.id === editParam);
    }

    if (found) {
      applyListingData(found);
    }

    // 3. Also fetch fresh from server
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.listings && data.listings.length > 0) {
          const serverFound = data.listings.find(
            (l: any) => l.slug === editParam || l.id === editParam
          );
          if (serverFound) {
            applyListingData(serverFound);
          }
        }
      })
      .catch(() => {});

    // Step & section navigation
    if (sectionParam === "enquiry-form") {
      setStep(2);
      setTimeout(() => {
        const el = document.getElementById("enquiry-form");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const input = el.querySelector("input");
          input?.focus();
        }
      }, 400);
    } else if (stepParam === "1") {
      setStep(1);
    } else {
      setStep(2);
      if (editParam) {
        setDetailsMode("manual");
      }
    }
  }, [editParam, sectionParam, stepParam, applyListingData]);

  /* ── Step 3: Done ── */
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentBroker, setCurrentBroker] = useState<any>(DEMO_BROKER);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentBroker((prev: any) => ({
            ...prev,
            ...data.user,
            id: data.user.id || data.user.user_id || prev.id,
            slug: data.user.slug || prev.slug,
          }));
        }
      })
      .catch(() => {});
  }, []);

  /* ── Listing Quality Score (debounced to avoid layout jitter) ── */
  const qualityScore = useMemo(() => {
    let score = 0;
    if (photos.length > 0) score += 15;
    if (photos.length >= 3) score += 10;
    if (photos.length >= 6) score += 5;
    if (headline.length > 5) score += 10;
    if (displayPrice.length > 1) score += 10;
    if (bhk) score += 5;
    if (carpetArea) score += 5;
    if (superBuiltUp) score += 5;
    if (bathrooms) score += 3;
    if (floor) score += 2;
    if (locationCity.length > 1) score += 5;
    if (locationLocality.length > 1) score += 5;
    if (selectedAmenities.length > 0) score += 5;
    if (selectedAmenities.length >= 5) score += 5;
    if (aiDescription.length > 10) score += 10;
    return Math.min(score, 100);
  }, [photos.length, headline.length > 5, displayPrice.length > 1, bhk, carpetArea, superBuiltUp, bathrooms, floor, locationCity.length > 1, locationLocality.length > 1, selectedAmenities.length, aiDescription.length > 10]);

  /* ── Photo Upload Handler ── */
  const handlePhotoUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const compressed = await Promise.all(fileArray.map(compressImageFile));
    setPhotos(prev => [...prev, ...compressed.filter(Boolean)]);
  }, []);

  /* ── Drag & Drop Reorder ── */
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    setPhotos(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(dragIdx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
    setDragIdx(null);
  };

  /* ── AI Magic Auto-Fill (WhatsApp / Raw Notes) ── */
  async function handleMagicAIFill(customText?: string) {
    const textToParse = (customText !== undefined ? customText : aiMagicInput).trim();
    if (!textToParse) {
      setAiError("Please paste a WhatsApp message or property notes.");
      return;
    }
    setIsGeneratingAI(true);
    setAiError(null);
    setAiMagicSuccessMsg(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: textToParse }),
      });
      const res = await response.json();
      if (!response.ok || !res.success) {
        if (response.status === 429 && res.retryAfterSec) {
          startAiCooldown(res.retryAfterSec);
        }
        throw new Error(res.error || "AI generation failed");
      }

      const data = res.data as ParsedPropertyData;
      setAiParsedPreview(data);

      // Auto-populate all form fields
      if (data.title) setHeadline(data.title);
      if (data.property_type) {
        setPropertyType(data.property_type);
        const found = PROPERTY_CATEGORIES.find((c) => c.value === data.property_type);
        if (found) setSelectedCategoryId(found.id);
      }
      if (data.listing_type) setTransactionType(data.listing_type);
      if (data.display_price) setDisplayPrice(data.display_price);
      if (data.price_amount) setPriceAmount(data.price_amount);
      if (data.bhk) setBhk(data.bhk);
      if (data.bedrooms) setBedrooms(data.bedrooms);
      if (data.bathrooms) setBathrooms(data.bathrooms);
      if (data.carpet_area_sqft) setCarpetArea(data.carpet_area_sqft);
      if (data.super_built_up_sqft) setSuperBuiltUp(data.super_built_up_sqft);
      if (data.floor) setFloor(data.floor);
      if (data.furnishing) setFurnishing(data.furnishing);
      if (data.facing) setFacing(data.facing);
      if (data.possession) setPossession(data.possession);
      if (data.property_age) setPropertyAge(data.property_age);
      if (data.location_city) setLocationCity(data.location_city);
      if (data.location_locality) setLocationLocality(data.location_locality);

      // Amenities
      if (data.amenities?.length) {
        setSelectedAmenities((prev) => Array.from(new Set([...prev, ...data.amenities])));
        setCustomAmenities((prev) => Array.from(new Set([...prev, ...data.amenities])));
      }

      // Descriptions and highlights
      setAiDescription(data.description || "");
      setAiHighlights(data.ai_highlights || []);
      setAiNeighborhood(data.ai_neighborhood_highlights || []);
      setRawNotes(textToParse);

      // Update dynamic feature items
      setFeaturesList((prev) =>
        prev.map((item) => {
          const id = item.id;
          const label = item.label.toUpperCase();
          if (id === "hf-1" || label.includes("CONFIGURATION")) {
            return { ...item, value: data.bhk ? `${data.bhk} BHK` : item.value };
          }
          if (id === "hf-2" || label.includes("CARPET")) {
            return { ...item, value: data.carpet_area_sqft ? `${data.carpet_area_sqft.toLocaleString()} Sq.Ft.` : item.value };
          }
          if (id === "hf-3" || label.includes("SUPER BUILT-UP")) {
            return { ...item, value: data.super_built_up_sqft ? `${data.super_built_up_sqft.toLocaleString()} Sq.Ft.` : item.value };
          }
          if (id === "hf-4" || label.includes("BATHROOM")) {
            return { ...item, value: data.bathrooms ? `${data.bathrooms} attached` : (data.bhk ? `${data.bhk} attached` : item.value) };
          }
          if (id === "hf-5" || label.includes("FLOOR")) {
            return { ...item, value: data.floor || item.value };
          }
          if (id === "hf-6" || label.includes("FURNISHING")) {
            return { ...item, value: data.furnishing || item.value };
          }
          if (id === "hf-7" || label.includes("FACING")) {
            return { ...item, value: data.facing || item.value };
          }
          if (id === "hf-8" || label.includes("POSSESSION")) {
            return { ...item, value: data.possession || item.value };
          }
          if (id === "ba-2" || label.includes("CAR PARKING")) {
            return { ...item, value: data.parking || item.value };
          }
          if (id === "ba-4" || label.includes("PROPERTY AGE")) {
            return { ...item, value: data.property_age || item.value };
          }
          if (id === "oc-5" || label.includes("NEGOTIABLE")) {
            return { ...item, value: "Yes, for genuine buyers" };
          }
          return item;
        })
      );

      setAiMagicSuccessMsg("✨ All property details extracted! Review the preview below or customize any field.");
    } catch (err: any) {
      setAiError(err.message || "Failed to parse property with AI.");
    } finally {
      setIsGeneratingAI(false);
    }
  }

  /* ── AI Generate ── */
  async function handleGenerateAI() {
    // Build context from the form fields
    const formContext = [
      headline && `Headline: ${headline}`,
      bhk && `BHK: ${bhk}`,
      propertyType && `Property Type: ${propertyType}`,
      transactionType && `Transaction Type: ${transactionType}`,
      carpetArea && `Carpet Area: ${carpetArea} Sq.Ft.`,
      superBuiltUp && `Super Built-Up Area: ${superBuiltUp} Sq.Ft.`,
      displayPrice && `Price: ${displayPrice}`,
      locationLocality && `Locality: ${locationLocality}`,
      locationCity && `City: ${locationCity}`,
      floor && `Floor: ${floor}`,
      furnishing && `Furnishing: ${furnishing}`,
      facing && `Facing: ${facing}`,
      bathrooms && `Bathrooms: ${bathrooms}`,
      possession && `Possession: ${possession}`,
      propertyAge && `Property Age: ${propertyAge}`,
      selectedAmenities.length > 0 && `Amenities: ${selectedAmenities.join(", ")}`,
      rawNotes && `Additional Notes: ${rawNotes}`,
    ].filter(Boolean).join("\n");

    if (!formContext.trim()) {
      setAiError("Please fill in some property details first so AI can generate content.");
      return;
    }

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: formContext }),
      });
      const res = await response.json();
      if (!response.ok || !res.success) {
        if (response.status === 429 && res.retryAfterSec) {
          startAiCooldown(res.retryAfterSec);
        }
        throw new Error(res.error || "AI generation failed");
      }

      const data = res.data as ParsedPropertyData;
      setAiDescription(data.description || "");
      setAiHighlights(data.ai_highlights || []);
      setAiNeighborhood(data.ai_neighborhood_highlights || []);

      // Auto-fill empty fields from AI
      if (!headline && data.title) setHeadline(data.title);
      if (!displayPrice && data.display_price) setDisplayPrice(data.display_price);
      if (!priceAmount && data.price_amount) setPriceAmount(data.price_amount);
      if (!bhk && data.bhk) setBhk(data.bhk);
      if (!bedrooms && data.bedrooms) setBedrooms(data.bedrooms);
      if (!bathrooms && data.bathrooms) setBathrooms(data.bathrooms);
      if (!carpetArea && data.carpet_area_sqft) setCarpetArea(data.carpet_area_sqft);
      if (!locationCity && data.location_city) setLocationCity(data.location_city);
      if (!locationLocality && data.location_locality) setLocationLocality(data.location_locality);
      if (selectedAmenities.length === 0 && data.amenities?.length) {
        setSelectedAmenities(data.amenities);
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to communicate with AI.");
    } finally {
      setIsGeneratingAI(false);
    }
  }

  /* ── Publish ── */
  async function handlePublish() {
    if (isPublishing) return;
    setIsPublishing(true);

    const isEditing = Boolean(editingSlug);
    const slug = isEditing
      ? editingSlug!
      : headline
        ? headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60)
        : `listing-${Date.now()}`;

    const id = editingId || ("listing-" + Date.now());

    const fullListing: Listing = {
      id,
      broker_id: currentBroker.id || currentBroker.user_id || DEMO_BROKER.id,
      title: headline || `${bhk || ""} BHK ${propertyType} for ${transactionType}`,
      slug,
      description: aiDescription || "",
      property_type: propertyType,
      listing_type: transactionType,
      bhk,
      bedrooms: bedrooms || bhk,
      bathrooms,
      carpet_area_sqft: carpetArea || superBuiltUp,
      price_amount: priceAmount,
      display_price: displayPrice || "Price on Request",
      currency,
      location_city: locationCity,
      location_locality: locationLocality,
      amenities: Array.from(new Set([...selectedAmenities, ...customAmenities])),
      ai_highlights: aiHighlights,
      ai_neighborhood_highlights: neighbourhoodNote
        ? Array.from(new Set([...aiNeighborhood, ...neighbourhoodNote.split(",").map(s => s.trim())]))
        : aiNeighborhood,
      property_features: featuresList,
      enquiry_form_url: enquiryFormUrl.trim(),
      enquiry_form_gate: enquiryFormGate,
      status: "active" as const,
      views_count: 142,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photos: (photos.length > 0 ? photos : [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"
      ]).map((url, i) => ({
        id: `p-${i}`,
        listing_id: id,
        photo_url: url,
        display_order: i + 1,
        is_cover: i === 0,
        created_at: new Date().toISOString()
      })),
      broker: currentBroker
    };

    saveListingToMemory(fullListing);

    // Cache current listing specifically for reload resilience
    try {
      localStorage.setItem(`propfolio_listing_${fullListing.slug}`, JSON.stringify(fullListing));
      localStorage.setItem("propfolio_active_edit_listing", JSON.stringify(fullListing));
    } catch (e) {
      console.warn("localStorage save error:", e);
    }

    try {
      const res = await fetch("/api/listings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullListing),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save listing");
      }
    } catch (err: any) {
      console.error("Server save error:", err);
      alert("Save failed: " + (err.message || "Could not save to Supabase"));
      setIsPublishing(false);
      return;
    } finally {
      setIsPublishing(false);
    }

    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    const liveSubdomainUrl = (typeof window !== "undefined" && window.location.host.includes("localhost"))
      ? `http://${currentBroker.slug || "broker"}.localhost:3000/l/${slug}`
      : `https://${currentBroker.slug || "broker"}.propertysnaps.in/l/${slug}`;
    setPublishedUrl(liveSubdomainUrl);
    setStep(3);
  }

  function handleCopy() {
    if (!publishedUrl) return;
    navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── Toggle Amenity ── */
  function toggleAmenity(amenity: string) {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  }

  /* ─────────────────────────────── STEP INDICATOR ──────────────────────────── */
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-6">
      {[
        { num: 1, label: "PHOTOS" },
        { num: 2, label: "DETAILS" },
        { num: 3, label: "DONE" },
      ].map((s, idx) => (
        <div key={s.num} className="flex items-center">
          {idx > 0 && (
            <div className={`h-0.5 w-12 sm:w-20 transition-colors ${step > idx ? "bg-[#1a3c34]" : "bg-slate-200 dark:bg-slate-700"}`} />
          )}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step > s.num
                  ? "bg-[#1a3c34] text-white"
                  : step === s.num
                    ? "bg-[#1a3c34] text-white ring-4 ring-[#1a3c34]/20"
                    : "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
              }`}
            >
              {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
            </div>
            <span className={`text-[10px] font-bold tracking-wider ${
              step >= s.num ? "text-[#0a1128] dark:text-white" : "text-slate-400"
            }`}>
              {s.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  /* ─────────────────────────────── STEP 1: PHOTOS ──────────────────────────── */
  const renderStep1Photos = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Add Photos */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#0c1222]">
        <h2 className="text-lg font-bold text-[#0a1128] dark:text-white">Add photos</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Upload high-quality property photos. First photo becomes the hero/cover image.
        </p>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {photos.map((src, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx)}
                className={`group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 cursor-grab active:cursor-grabbing dark:bg-slate-800 transition ring-2 ${
                  dragIdx === idx ? "ring-[#1a3c34] opacity-60" : "ring-transparent"
                }`}
              >
                <img src={src} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 rounded-md bg-[#1a3c34] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    Hero
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition hover:bg-rose-600"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-70 transition">
                  <GripVertical className="h-4 w-4 text-white drop-shadow" />
                </div>
              </div>
            ))}

            {/* Add more button inside grid */}
            <label className="flex aspect-[4/3] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-[#1a3c34] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-[#862e9f]">
              <Plus className="h-6 w-6 text-slate-400" />
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files)}
              />
            </label>
          </div>
        )}

        {/* Empty State Upload */}
        {photos.length === 0 && (
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-12 transition hover:border-[#1a3c34] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a3c34]/10 text-[#1a3c34]">
              <Camera className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#0a1128] dark:text-white">Click to upload photos</p>
              <p className="mt-0.5 text-xs text-slate-500">JPG, PNG • Multiple select supported</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(e.target.files)}
            />
          </label>
        )}
      </div>

      {/* Property Videos (Optional) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#0c1222]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a1128] dark:text-white">
            Property Videos
          </h3>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Optional
          </span>
        </div>

        {!videoUrl ? (
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 transition hover:border-[#1a3c34] dark:border-slate-700 dark:bg-slate-900">
            <Plus className="h-5 w-5 text-slate-400" />
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setVideoUrl(URL.createObjectURL(file));
              }}
            />
          </label>
        ) : (
          <div className="mt-3 relative rounded-xl overflow-hidden bg-black">
            <video src={videoUrl} controls className="w-full max-h-48 object-contain" />
            <button
              type="button"
              onClick={() => setVideoUrl("")}
              className="absolute top-2 right-2 rounded-md bg-black/70 p-1.5 text-white hover:bg-rose-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center gap-2 rounded-xl bg-[#1a3c34] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0f2a24] active:scale-95"
        >
          <span>Next: Edit Details</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  /* ─────────────────────────────── STEP 2: DETAILS ──────────────────────────── */
  const renderStep2Details = () => (
    <div className="space-y-5 animate-in fade-in duration-300">

      {/* ── 2-OPTION ENTRY MODE SELECTOR (Segmented Pill Switcher) ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xs dark:border-slate-800 dark:bg-[#0c1222]">
        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={() => setDetailsMode("ai")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              detailsMode === "ai"
                ? "bg-white text-emerald-800 shadow-sm dark:bg-emerald-950 dark:text-emerald-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>⚡ AI Quick Fill</span>
            <span className="hidden sm:inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              Save 10m
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDetailsMode("manual")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              detailsMode === "manual"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Pencil className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>✍️ Manual Entry</span>
            <span className="hidden sm:inline-block rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              Full Form
            </span>
          </button>
        </div>
      </div>

      {/* ── ⚡ AI MAGIC LISTING: WHATSAPP TO FORM AUTO-FILL (VISIBLE IN AI MODE) ── */}
      {detailsMode === "ai" && (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30 p-4 sm:p-5 shadow-xs dark:border-emerald-500/20 dark:from-emerald-950/20 dark:via-[#0c1222] dark:to-slate-900">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              ⚡ AI Quick Fill: Paste WhatsApp Message
            </h3>
            <span className="rounded-full bg-emerald-100 border border-emerald-300/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
              Save 10 Mins
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Paste a WhatsApp forward or rough property notes here. AI will extract all 20+ details and fill the form instantly!
          </p>
        </div>

        {/* WhatsApp Text Input */}
        <div className="relative mt-3.5">
          <textarea
            rows={3}
            value={aiMagicInput}
            onChange={(e) => setAiMagicInput(e.target.value)}
            placeholder="Paste WhatsApp message or notes here, for example:&#10;'4 BHK Flat for sale in Bodakdev Ahmedabad. 1650 sqft carpet, 2450 super built-up, 12th floor, 4 attached baths, 2 covered car parking, west facing, ready to move, asking 3.25 Cr negotiable, modular kitchen, amenities: gym, swimming pool, 24x7 security...'"
            className="w-full rounded-xl border border-emerald-200/90 bg-white/95 p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-emerald-500/15 dark:border-emerald-900/50 dark:bg-slate-900/90 dark:text-white dark:placeholder:text-slate-500 transition resize-y min-h-[90px]"
          />
          {aiMagicInput && (
            <button
              type="button"
              onClick={() => {
                setAiMagicInput("");
                setAiMagicSuccessMsg(null);
                setAiParsedPreview(null);
              }}
              className="absolute top-2.5 right-2.5 rounded-md bg-slate-100/90 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Sample Buttons (Horizontal scrolling chips on mobile, clean inline on desktop) */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="shrink-0 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Quick Samples:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {AI_WHATSAPP_PRESETS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiMagicInput(sample.text);
                  handleMagicAIFill(sample.text);
                }}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50/60 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400 cursor-pointer transition active:scale-95"
              >
                <span>📋</span>
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleMagicAIFill()}
            disabled={isGeneratingAI || aiCooldownTimer > 0 || !aiMagicInput.trim()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-500 hover:to-teal-600 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>AI extracting & filling details...</span>
              </>
            ) : aiCooldownTimer > 0 ? (
              <>
                <Clock className="h-4 w-4 animate-pulse text-amber-200" />
                <span>AI Cooldown: Available in {aiCooldownTimer}s</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-200" />
                <span>✨ Auto-Fill All Details with AI</span>
              </>
            )}
          </button>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Extracts BHK, price, area, floor, parking & 15+ amenities
          </span>
        </div>

        {/* Cooldown Active Banner */}
        {aiCooldownTimer > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50/80 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 animate-spin" />
            <span>AI request limit reached. Rate limit resets in <span className="font-mono font-bold text-amber-700 dark:text-amber-300 underline">{aiCooldownTimer}s</span>.</span>
          </div>
        )}

        {/* Error message */}
        {aiError && (
          <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
            ⚠️ {aiError}
          </p>
        )}

        {/* Success Message Banner */}
        {aiMagicSuccessMsg && (
          <div className="mt-3.5 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3 text-xs font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{aiMagicSuccessMsg}</span>
          </div>
        )}

        {/* Instant AI Preview Card (Like WhatsApp Property Summary) */}
        {aiParsedPreview && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                AI Generated Property Preview
              </span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Auto-Filled in Form
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-sm font-bold text-[#0a1128] dark:text-white">
                  {aiParsedPreview.title}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold text-[#1c5436] dark:text-emerald-400">
                    {aiParsedPreview.display_price}
                  </span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Negotiable
                  </span>
                </div>
              </div>

              {/* Key badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {aiParsedPreview.bhk && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    🛏️ {aiParsedPreview.bhk} BHK
                  </span>
                )}
                {aiParsedPreview.carpet_area_sqft && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    📐 {aiParsedPreview.carpet_area_sqft.toLocaleString()} Sq.Ft. Carpet
                  </span>
                )}
                {aiParsedPreview.super_built_up_sqft && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    🏗️ {aiParsedPreview.super_built_up_sqft.toLocaleString()} Sq.Ft. Super
                  </span>
                )}
                {aiParsedPreview.floor && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    🏢 {aiParsedPreview.floor}
                  </span>
                )}
                {aiParsedPreview.furnishing && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    🛋️ {aiParsedPreview.furnishing}
                  </span>
                )}
                {aiParsedPreview.facing && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    🧭 {aiParsedPreview.facing}
                  </span>
                )}
                {aiParsedPreview.possession && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    🔑 {aiParsedPreview.possession}
                  </span>
                )}
                {aiParsedPreview.parking && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    🚗 {aiParsedPreview.parking}
                  </span>
                )}
              </div>

              {/* Location */}
              <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{aiParsedPreview.location_locality}, {aiParsedPreview.location_city}</span>
              </p>

              {/* Highlights preview */}
              {aiParsedPreview.ai_highlights?.length > 0 && (
                <div className="mt-2 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    Key Highlights:
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {aiParsedPreview.ai_highlights.slice(0, 3).map((hl, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Direct link to edit fields */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">
                  You can review or edit any field in the manual form below 👇
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsMode("manual");
                    setTimeout(() => {
                      const el = document.getElementById("property-category-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Review / Edit in Manual Form</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Listing Quality Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-[#0c1222]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">Listing Quality</h3>
              <p className="text-[11px] text-slate-500">Better quality attracts more buyers</p>
            </div>
          </div>
          <span className="text-lg font-bold text-[#0a1128] dark:text-white tabular-nums w-12 text-right">{qualityScore}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-[#1a3c34] transition-all duration-700 ease-out"
            style={{ width: `${qualityScore}%` }}
          />
        </div>
        <p className={`mt-1.5 text-[11px] font-medium transition-opacity duration-300 h-4 ${
          qualityScore < 80 ? "text-[#1a3c34] opacity-100 dark:text-emerald-400" : "opacity-0"
        }`}>
          + Add more details to reach 100%
        </p>
      </div>

      {/* Existing Property Photos Quick Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-[#0c1222]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-[#1a3c34]" />
            <h3 className="text-sm font-bold text-[#0a1128] dark:text-white uppercase tracking-wide">
              PROPERTY PHOTOS ({photos.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs font-bold text-[#1c5436] hover:underline dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <span>Change / Reorder Photos (Step 1)</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {photos.length > 0 ? (
          <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((src, idx) => (
              <div
                key={idx}
                className="group relative aspect-[4/3] w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100 dark:border-slate-800"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
                <div className="absolute bottom-1 left-1">
                  {idx === 0 ? (
                    <span className="rounded bg-[#1c5436] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                      ★ Cover
                    </span>
                  ) : (
                    <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                      #{idx + 1}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-3 w-full rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs font-medium text-slate-500 hover:border-[#1a3c34] hover:bg-slate-50 dark:border-slate-800"
          >
            + No photos yet. Click here to upload photos in Step 1
          </button>
        )}
      </div>

      {/* ── OPTION 2: MANUAL FORM FIELDS (VISIBLE IN MANUAL MODE) ── */}
      {detailsMode === "manual" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Quick toggle banner to AI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-3 sm:px-4 sm:py-2.5 text-xs text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Have WhatsApp text or raw property notes? Auto-fill with AI in 5s.</span>
            </div>
            <button
              type="button"
              onClick={() => setDetailsMode("ai")}
              className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline dark:text-emerald-300 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>Switch to ⚡ Option 1 (AI Magic Fill)</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Property Category */}
          <div id="property-category-section" className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-[#0c1222]">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#0a1128] dark:text-white">
          <span className="h-5 w-1 rounded-full bg-[#1a3c34]" />
          PROPERTY CATEGORY
        </h3>
        <div className="mt-3.5 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PROPERTY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setPropertyType(cat.value as PropertyType);
                }}
                className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition ${
                  isActive
                    ? "border-[#1a3c34] bg-[#1a3c34]/5 dark:border-[#862e9f]"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                }`}
              >
                {isActive && (
                  <div className="absolute -top-1.5 -right-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1a3c34] fill-[#1a3c34] stroke-white" />
                  </div>
                )}
                <Icon className={`h-5 w-5 ${isActive ? "text-[#1a3c34]" : "text-slate-400"}`} />
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide leading-tight ${
                  isActive ? "text-[#1a3c34]" : "text-slate-600 dark:text-slate-400"
                }`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Details */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-[#0c1222]">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#0a1128] dark:text-white">
          <span className="h-5 w-1 rounded-full bg-[#1a3c34]" />
          BASIC DETAILS
        </h3>

        <div className="mt-4 space-y-4">
          {/* Headline */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. 4 BHK Flat for Sale in Bodakdev, Ahmedabad"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-[#1a3c34] focus:ring-2 focus:ring-[#1a3c34]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Property Type & Transaction Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Property Type</label>
                <span className="text-[10px] text-[#1a3c34] font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              </div>
              <input
                type="text"
                value={propertyType === "Apartment" ? "Flat" : propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-[#1a3c34] focus:ring-2 focus:ring-[#1a3c34]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Transaction Type</label>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {(["Sale", "Rent", "Lease"] as string[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      if (t === "Sale" || t === "Rent") setTransactionType(t);
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition ${
                      transactionType === t
                        ? "border-[#1a3c34] bg-[#1a3c34] text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {t === "Sale" && "🏠"}
                    {t === "Rent" && "🔑"}
                    {t === "Lease" && "📋"}
                    {" "}{t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Currency & Negotiable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#1a3c34] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — US Dollar</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Negotiable</label>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setNegotiable(val)}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                      negotiable === val
                        ? "border-[#1a3c34] bg-[#1a3c34] text-white"
                        : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {val ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Display Price</label>
            <input
              type="text"
              value={displayPrice}
              onChange={(e) => setDisplayPrice(e.target.value)}
              placeholder="e.g. ₹1.35 Cr or ₹45,000 / mo"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-emerald-600 outline-none transition focus:border-[#1a3c34] focus:ring-2 focus:ring-[#1a3c34]/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* PROPERTY FEATURES (Full Dynamic Multi-Section Grid) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-6 dark:border-slate-800 dark:bg-[#0c1222] space-y-4 sm:space-y-6">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#0a1128] dark:text-white">
            <span className="h-5 w-1 rounded-full bg-[#1a3c34]" />
            PROPERTY FEATURES
          </h3>
          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
            Tap any label or value to edit it. These show as the icon grid on your public listing — keep each value short (2–4 words) so it looks clean. Each section heading is editable too: rename it to rename the whole section, or use “Move to section” on a single feature to shift just that one.
          </p>
        </div>

        {/* Section Groups */}
        <div className="space-y-4 sm:space-y-6">
          {featureSections.map((secName) => {
            const sectionItems = featuresList.filter((f) => f.section === secName);

            return (
              <div key={secName} className="rounded-xl sm:rounded-2xl border border-slate-100 bg-[#fafbfe] p-2.5 sm:p-4 dark:border-slate-800/80 dark:bg-[#080d19]">
                {/* Editable Section Heading */}
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <LayoutGrid className="h-4 w-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={secName}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setFeatureSections((prev) => prev.map((s) => (s === secName ? newName : s)));
                        setFeaturesList((prev) =>
                          prev.map((f) => (f.section === secName ? { ...f, section: newName } : f))
                        );
                      }}
                      className="bg-transparent text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white outline-none focus:border-b focus:border-[#1a3c34] truncate"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {sectionItems.length} items
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `feat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                        setFeaturesList((prev) => [
                          ...prev,
                          { id: newId, section: secName, label: "NEW FEATURE", value: "", placeholder: "e.g. Enter details..." },
                        ]);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#1a3c34] shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                </div>

                {/* Features Grid for this section (Compact 2-Column Grid on Mobile) */}
                {sectionItems.length > 0 ? (
                  <div className="mt-3.5 grid grid-cols-2 gap-2 sm:gap-3.5">
                    {sectionItems.map((feat) => {
                      const IconComp = getFeatureIcon(feat.label);

                      return (
                        <div
                          key={feat.id}
                          className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                        >
                          {/* Top Row Capsule */}
                          <div className="flex items-center justify-between rounded-full bg-[#f8f9fa] px-2 py-1 sm:px-3 sm:py-1.5 dark:bg-slate-800/80">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                              <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-xs dark:bg-slate-700 dark:text-slate-300">
                                <IconComp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </div>
                              <input
                                type="text"
                                value={feat.label}
                                onChange={(e) => {
                                  const newLabel = e.target.value;
                                  setFeaturesList((prev) =>
                                    prev.map((f) => (f.id === feat.id ? { ...f, label: newLabel } : f))
                                  );
                                }}
                                className="w-full bg-transparent text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 outline-none truncate"
                                placeholder="FEATURE LABEL"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => setFeaturesList((prev) => prev.filter((f) => f.id !== feat.id))}
                              className="text-slate-400 hover:text-rose-500 transition p-0.5 sm:p-1 ml-0.5 sm:ml-1 shrink-0"
                              title="Delete feature"
                            >
                              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                          </div>

                          {/* Middle Editable Value */}
                          <div className="mt-2 sm:mt-2.5 px-0.5 sm:px-1">
                            <input
                              type="text"
                              value={feat.value}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setFeaturesList((prev) =>
                                  prev.map((f) => (f.id === feat.id ? { ...f, value: newVal } : f))
                                );
                              }}
                              placeholder={feat.placeholder || feat.label}
                              className="w-full rounded-lg border border-transparent bg-transparent py-0.5 sm:py-1 text-xs sm:text-base font-semibold text-[#0a1128] placeholder-slate-400 dark:placeholder-slate-500 dark:text-white outline-none focus:bg-slate-50 dark:focus:bg-slate-800/50 truncate"
                            />
                          </div>

                          {/* Bottom Row Capsule (Move to section) */}
                          <div className="mt-2 sm:mt-2.5 flex items-center justify-between rounded-full bg-[#f8f9fa] px-2 py-1 sm:px-3 sm:py-1.5 text-xs text-slate-500 dark:bg-slate-800/80">
                            <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
                              <LayoutGrid className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400 shrink-0" />
                              <select
                                value={feat.section}
                                onChange={(e) => {
                                  const targetSec = e.target.value;
                                  setFeaturesList((prev) =>
                                    prev.map((f) => (f.id === feat.id ? { ...f, section: targetSec } : f))
                                  );
                                }}
                                className="w-full bg-transparent text-[8px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 outline-none cursor-pointer truncate"
                                title="Move to section"
                              >
                                {featureSections.map((sec) => (
                                  <option key={sec} value={sec}>
                                    {sec.toUpperCase()}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-center text-xs text-slate-400 py-3">
                    No features in this section yet. Click "+ Add Feature" above.
                  </p>
                )}

                {/* Bottom Add Feature Button in section */}
                <button
                  type="button"
                  onClick={() => {
                    const newId = `feat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                    setFeaturesList((prev) => [
                      ...prev,
                      { id: newId, section: secName, label: "NEW FEATURE", value: "", placeholder: "e.g. Enter details..." },
                    ]);
                  }}
                  className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#1a3c34] hover:bg-slate-50 hover:text-[#1a3c34] dark:border-slate-700 dark:text-slate-400 dark:hover:border-[#862e9f]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Feature to {secName}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Add New Section Option */}
        <div className="pt-2">
          {showAddSectionInput ? (
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-[#1a3c34] p-2 dark:border-[#862e9f]">
              <input
                type="text"
                autoFocus
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newSectionName.trim() && !featureSections.includes(newSectionName.trim())) {
                      setFeatureSections((prev) => [...prev, newSectionName.trim()]);
                      setNewSectionName("");
                      setShowAddSectionInput(false);
                    }
                  } else if (e.key === "Escape") {
                    setShowAddSectionInput(false);
                  }
                }}
                placeholder="New section title (e.g. Roof & Terrace, Special Amenities)..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs font-medium text-[#0a1128] outline-none dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (newSectionName.trim() && !featureSections.includes(newSectionName.trim())) {
                    setFeatureSections((prev) => [...prev, newSectionName.trim()]);
                    setNewSectionName("");
                    setShowAddSectionInput(false);
                  }
                }}
                className="rounded-xl bg-[#1a3c34] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0f2a24]"
              >
                Add Section
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddSectionInput(false);
                  setNewSectionName("");
                }}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddSectionInput(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3c34] hover:underline dark:text-emerald-400"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add New Section Heading</span>
            </button>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-[#0c1222]">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#0a1128] dark:text-white">
          <span className="h-5 w-1 rounded-full bg-[#1a3c34]" />
          LOCATION
        </h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
            <input
              type="text"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="e.g. Ahmedabad"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#1a3c34] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Locality / Neighborhood</label>
            <input
              type="text"
              value={locationLocality}
              onChange={(e) => setLocationLocality(e.target.value)}
              placeholder="e.g. Bodakdev, Near Rajpath Club"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#1a3c34] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Amenities Checklist */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-[#0c1222]">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#0a1128] dark:text-white">
          <span className="h-5 w-1 rounded-full bg-[#1a3c34]" />
          AMENITIES
        </h3>
        
        {/* Standard Amenity Checkboxes */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
          {AMENITY_OPTIONS.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="h-4 w-4 rounded border-slate-300 text-[#1a3c34] focus:ring-[#1a3c34] accent-[#1a3c34]"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">{amenity}</span>
            </label>
          ))}
        </div>

        {/* OTHER AMENITIES SECTION (as shown in reference image) */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            OTHER AMENITIES
          </h4>
          <p className="mt-0.5 text-[11px] text-slate-400">
            These are not in the list above. Tap one to change it, or remove it.
          </p>

          {/* Custom Amenities 2-Column List */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {customAmenities.map((item, idx) => {
              // Context-aware icon helper
              const lower = item.toLowerCase();
              let IconComp = Sparkles;
              if (lower.includes("lift")) IconComp = ArrowUpDown;
              else if (lower.includes("water")) IconComp = Droplets;
              else if (lower.includes("power") || lower.includes("backup")) IconComp = Zap;
              else if (lower.includes("security") || lower.includes("guard")) IconComp = Shield;
              else if (lower.includes("cctv") || lower.includes("camera")) IconComp = Camera;
              else if (lower.includes("gym") || lower.includes("fitness")) IconComp = Dumbbell;
              else if (lower.includes("yoga") || lower.includes("lawn") || lower.includes("park") || lower.includes("garden")) IconComp = Trees;
              else if (lower.includes("pool") || lower.includes("swim")) IconComp = Waves;
              else if (lower.includes("party") || lower.includes("club")) IconComp = Building;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-full border border-slate-200 bg-[#f8f9fa] px-3.5 py-2 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...customAmenities];
                        updated[idx] = e.target.value;
                        setCustomAmenities(updated);
                      }}
                      className="w-full bg-transparent text-xs font-semibold text-[#0a1128] outline-none dark:text-white truncate"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setCustomAmenities(prev => prev.filter((_, i) => i !== idx))}
                    className="ml-2 text-slate-400 hover:text-rose-500 transition p-1"
                    title="Remove amenity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Amenity Input or Button */}
          {showAddAmenityInput ? (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-dashed border-[#1a3c34] p-2 dark:border-[#862e9f]">
              <input
                type="text"
                autoFocus
                value={newAmenityInput}
                onChange={(e) => setNewAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newAmenityInput.trim()) {
                      setCustomAmenities(prev => [...prev, newAmenityInput.trim()]);
                      setNewAmenityInput("");
                      setShowAddAmenityInput(false);
                    }
                  } else if (e.key === "Escape") {
                    setShowAddAmenityInput(false);
                  }
                }}
                placeholder="e.g. EV Charging Station, Jacuzzi, Rooftop Deck..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs font-medium text-[#0a1128] outline-none dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (newAmenityInput.trim()) {
                    setCustomAmenities(prev => [...prev, newAmenityInput.trim()]);
                    setNewAmenityInput("");
                    setShowAddAmenityInput(false);
                  }
                }}
                className="rounded-xl bg-[#1a3c34] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#0f2a24]"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddAmenityInput(false);
                  setNewAmenityInput("");
                }}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddAmenityInput(true)}
              className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-[#1a3c34] hover:bg-slate-50 hover:text-[#1a3c34] dark:border-slate-700 dark:text-slate-400 dark:hover:border-[#862e9f]"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add amenity</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Content Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-[#f0faf6] p-4 sm:p-5 dark:border-emerald-900/40 dark:bg-[#0a1a14]">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#0a1128] dark:text-white">
          <span className="h-5 w-1 rounded-full bg-[#1a3c34]" />
          AI CONTENT
        </h3>

        {/* Quick Notes for AI (optional extra context) */}
        <div className="mt-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Extra Notes for AI (optional)
          </label>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Any additional details not covered above — broker notes, WhatsApp text, special features.
          </p>
          <textarea
            rows={3}
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder="e.g. Corner flat, Italian marble, near ISRO, society has only 2 flats per floor..."
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#1a3c34] focus:ring-2 focus:ring-[#1a3c34]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Quick Sample Templates */}
        <div className="mt-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick Templates:
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PRESET_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRawNotes(ex.text)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-[#1a3c34] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate AI Button */}
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={isGeneratingAI || aiCooldownTimer > 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3c34] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0f2a24] active:scale-95 disabled:opacity-50"
        >
          {isGeneratingAI ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is writing content...</span>
            </>
          ) : aiCooldownTimer > 0 ? (
            <>
              <Clock className="h-4 w-4 animate-pulse text-amber-300" />
              <span>Cooldown Active: Wait {aiCooldownTimer}s</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{aiDescription ? "✨ Regenerate" : "✨ Generate AI Description & Highlights"}</span>
            </>
          )}
        </button>

        {aiCooldownTimer > 0 && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50/80 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>AI rate limit active. Available again in <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{aiCooldownTimer}s</span>.</span>
          </div>
        )}

        {aiError && (
          <p className="mt-2 text-xs font-semibold text-rose-600">{aiError}</p>
        )}

        {/* AI Generated Description */}
        {aiDescription && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
              <span className="text-[10px] text-[#1a3c34] font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI
              </span>
            </div>
            <textarea
              rows={5}
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm leading-relaxed outline-none focus:border-[#1a3c34] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* AI Highlights */}
        {aiHighlights.length > 0 && (
          <div className="mt-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Highlights</label>
            <div className="mt-2 space-y-2">
              {aiHighlights.map((hl, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <GripVertical className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  <input
                    type="text"
                    value={hl}
                    onChange={(e) => {
                      const updated = [...aiHighlights];
                      updated[idx] = e.target.value;
                      setAiHighlights(updated);
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a3c34] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setAiHighlights(prev => prev.filter((_, i) => i !== idx))}
                    className="text-slate-300 hover:text-rose-500 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAiHighlights(prev => [...prev, ""])}
                className="flex items-center gap-1.5 text-xs font-medium text-[#1a3c34] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add highlight
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ENRICH YOUR LISTING (as shown in reference image) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-[#0c1222]">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#0a1128] dark:text-white">
          <span className="h-5 w-1 rounded-full bg-[#1a3c34]" />
          ENRICH YOUR LISTING
        </h3>
        <p className="mt-1 text-[11px] text-slate-500">
          Optional, each addition increases client engagement
        </p>

        <div className="mt-4 space-y-3">
          {/* 1. Urgency Badge */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 transition dark:border-slate-800 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => setExpandedEnrich(expandedEnrich === "urgency" ? null : "urgency")}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">
                  Urgency badge
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Optional</span>
                {expandedEnrich === "urgency" ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedEnrich === "urgency" && (
              <div className="mt-3 pt-1">
                <input
                  type="text"
                  value={urgencyBadge}
                  onChange={(e) => setUrgencyBadge(e.target.value)}
                  placeholder="e.g. Only 2 units left · Price just reduced"
                  className="w-full rounded-xl border border-slate-200 bg-[#f8f9fa] p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1a3c34] focus:bg-white focus:ring-2 focus:ring-[#1a3c34]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#862e9f]"
                />
              </div>
            )}
          </div>

          {/* 2. Sort photos by room */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 transition dark:border-slate-800 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => setExpandedEnrich(expandedEnrich === "room" ? null : "room")}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <Tag className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">
                  Sort photos by room
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Optional</span>
                {expandedEnrich === "room" ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedEnrich === "room" && (
              <div className="mt-3 pt-1">
                <input
                  type="text"
                  value={roomSortNote}
                  onChange={(e) => setRoomSortNote(e.target.value)}
                  placeholder="e.g. Living room, Master bedroom, Modular kitchen, Balcony views"
                  className="w-full rounded-xl border border-slate-200 bg-[#f8f9fa] p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1a3c34] focus:bg-white focus:ring-2 focus:ring-[#1a3c34]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#862e9f]"
                />
              </div>
            )}
          </div>

          {/* 3. Neighbourhood highlights */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 transition dark:border-slate-800 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => setExpandedEnrich(expandedEnrich === "neighbourhood" ? null : "neighbourhood")}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">
                  Neighbourhood highlights
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Optional</span>
                {expandedEnrich === "neighbourhood" ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedEnrich === "neighbourhood" && (
              <div className="mt-3 pt-1">
                <input
                  type="text"
                  value={neighbourhoodNote}
                  onChange={(e) => setNeighbourhoodNote(e.target.value)}
                  placeholder="e.g. 5 mins to Metro, SG Highway access, Top schools within 1.5 km"
                  className="w-full rounded-xl border border-slate-200 bg-[#f8f9fa] p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1a3c34] focus:bg-white focus:ring-2 focus:ring-[#1a3c34]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#862e9f]"
                />
              </div>
            )}
          </div>

          {/* 4. Price history note */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 transition dark:border-slate-800 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => setExpandedEnrich(expandedEnrich === "priceHistory" ? null : "priceHistory")}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <TrendingDown className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">
                  Price history note
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Optional</span>
                {expandedEnrich === "priceHistory" ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </button>

            {expandedEnrich === "priceHistory" && (
              <div className="mt-3 pt-1">
                <input
                  type="text"
                  value={priceHistoryNote}
                  onChange={(e) => setPriceHistoryNote(e.target.value)}
                  placeholder="e.g. Price reduced from ₹1.45 Cr last week · Motivated seller"
                  className="w-full rounded-xl border border-slate-200 bg-[#f8f9fa] p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1a3c34] focus:bg-white focus:ring-2 focus:ring-[#1a3c34]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#862e9f]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ENQUIRY FORM (Google Form Integration as shown in reference image) */}
      <div
        id="enquiry-form"
        className={`rounded-2xl border bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-[#0c1222] scroll-mt-24 transition-all duration-300 ${
          sectionParam === "enquiry-form"
            ? "border-[#1c5436] ring-4 ring-[#1c5436]/25 shadow-xl"
            : "border-slate-200/80"
        }`}
      >
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#0a1128] dark:text-white uppercase tracking-wide">
          <span className="h-5 w-1 rounded-full bg-[#1a3c34]" />
          ENQUIRY FORM
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Get every buyer&apos;s name, number and budget before you even talk. Paste the link to your own Google Form below and it shows on this listing.
        </p>

        {/* HOW IT WORKS */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <h4 className="text-[11px] font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
            HOW IT WORKS
          </h4>
          <ul className="mt-2.5 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>A <strong className="text-slate-800 dark:text-slate-200">Share your requirement</strong> button appears on this listing and opens your form.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>Turn on <strong className="text-slate-800 dark:text-slate-200">Fill the form first</strong> and buyers must submit your form before they see the photos and price. Each buyer fills it once. After that, all your listings open straight away for them for 30 days.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>Answers go straight to your own Google Form. Property Snaps never sees or stores them.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>You never see the form on your own listing. To try it, open the listing link on another phone.</span>
            </li>
          </ul>
        </div>

        {/* Don't have a form yet? */}
        <div className="mt-4 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Don&apos;t have a form yet?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Make one free on Google Forms, then copy its link and paste it below.
            </p>
          </div>
          <a
            href="https://forms.new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1c5436] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#15422a] transition active:scale-95 shrink-0"
          >
            <span>+ Create a Google Form</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Your form link */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-800 dark:text-white mb-1.5">
            Your form link
          </label>
          <input
            type="url"
            value={enquiryFormUrl}
            onChange={(e) => setEnquiryFormUrl(e.target.value)}
            placeholder="https://docs.google.com/forms/d/e/1FAIpQLSeSfbXZRIBHqEbm0LkCsClh-kjHjeWGLMFeteaPjMZFkKnOFg/viewform?usp=publish-editor"
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1c5436] focus:ring-2 focus:ring-[#1c5436]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          {enquiryFormUrl.trim().length > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Google Form link. It can show before the property opens.</span>
            </p>
          )}
        </div>

        {/* Fill the form first */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center justify-between dark:border-slate-800 dark:bg-slate-900/60">
          <div className="pr-4">
            <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Fill the form first
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Buyers see your form before the property. It opens the moment they submit.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enquiryFormGate}
            onClick={() => setEnquiryFormGate(!enquiryFormGate)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enquiryFormGate ? "bg-[#1c5436]" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enquiryFormGate ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Email hint */}
        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Mail className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
          <span>
            Get an email for every new enquiry: open your form, go to Responses, tap the three dots (⋮) and choose &ldquo;Get email notifications for new responses&rdquo;.
          </span>
        </div>
      </div>
      </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Photos</span>
        </button>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          className="flex items-center gap-2 rounded-xl bg-[#1a3c34] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0f2a24] active:scale-95 disabled:opacity-50"
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{editingSlug ? "Updating..." : "Publishing..."}</span>
            </>
          ) : (
            <>
              <span>{editingSlug ? "Save & Update Listing" : "Publish Listing"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  /* ─────────────────────────────── STEP 3: DONE ──────────────────────────── */
  const renderStep3Done = () => {
    const fullUrl = publishedUrl || "";
    const waText = `*${headline || "New Property Listing"}*\nPrice: ${displayPrice || "On Request"}\nLocation: ${locationLocality}, ${locationCity}\n\nView Property Details:\n${fullUrl}`;
    const waLink = `https://wa.me/?text=${encodeURIComponent(waText)}`;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Success Card */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#0a1128] dark:text-white">
            🎉 Property Published!
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Your listing is now live. Share it with prospective buyers.
          </p>
        </div>

        {/* Link & Copy */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#0c1222]">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Your Listing URL
          </label>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 truncate">
              {fullUrl}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* WhatsApp Share Preview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#0c1222]">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            WhatsApp Share Message
          </label>
          <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm whitespace-pre-wrap text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 leading-relaxed">
            {waText}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Share on WhatsApp</span>
            </a>
            <a
              href={publishedUrl || "/dashboard"}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-[#0a1128] shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <Eye className="h-4 w-4" />
              <span>View Live Listing</span>
            </a>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────── RENDER ──────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-[#0a1128] transition-colors dark:bg-[#070b14] dark:text-slate-100">
      {/* Top Progress Bar */}
      <div className="h-1 w-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-[#1a3c34] transition-all duration-500"
          style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
        />
      </div>

      <main className="mx-auto max-w-3xl px-2.5 sm:px-6 pt-4 sm:pt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/dashboard" className="hover:text-[#0a1128] dark:hover:text-white transition">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[#0a1128] dark:text-white">
            {editingSlug ? "Edit Listing" : "Create New Listing"}
          </span>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Steps */}
        {step === 1 && renderStep1Photos()}
        {step === 2 && renderStep2Details()}
        {step === 3 && renderStep3Done()}
      </main>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
          Loading listing editor...
        </div>
      }
    >
      <ListingEditorContent />
    </Suspense>
  );
}
