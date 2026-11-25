import React from "react";
import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  Svg,
  Path,
  Circle,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import { Listing, Profile } from "@/types/database";

// Register Inter fonts with fallback
try {
  const interRegular = path.resolve(process.cwd(), "public/fonts/Inter.ttf");
  Font.register({
    family: "Inter",
    fonts: [
      { src: interRegular, fontWeight: "normal" },
      { src: interRegular, fontWeight: 600 },
      { src: interRegular, fontWeight: 700 },
      { src: interRegular, fontWeight: 800 },
    ],
  });
} catch (e) {
  console.warn("PDF Font registration note:", e);
}

// Luxury Design Tokens
const PRIMARY = "#1F5C3A";
const PRIMARY_LIGHT = "#EAF4EE";
const TEXT_MAIN = "#111111";
const TEXT_MUTED = "#6B7280";
const CARD_BG = "#F9FAFB";
const BORDER_COLOR = "#E5E7EB";

const styles = StyleSheet.create({
  page: {
    size: "A4",
    paddingLeft: 36,
    paddingRight: 36,
    paddingTop: 30,
    paddingBottom: 48,
    backgroundColor: "#FFFFFF",
    fontFamily: "Inter",
  },
  // Fixed Footer
  footerLine: {
    position: "absolute",
    bottom: 34,
    left: 36,
    right: 36,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 8.5,
    color: "#8A8A8A",
  },
  footerAgent: {
    fontWeight: 700,
    color: "#374151",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // ── Cover Page Layout ──
  heroContainer: {
    width: "100%",
    height: 270,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#F3F4F6",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 9.5,
    fontWeight: 700,
    color: TEXT_MUTED,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  titleH1: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT_MAIN,
    lineHeight: 1.25,
    marginBottom: 10,
  },
  badgeAndPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listingTypePill: {
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  listingTypeText: {
    fontSize: 9.5,
    fontWeight: 700,
    color: PRIMARY,
  },
  negotiablePill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  negotiableText: {
    fontSize: 9,
    fontWeight: 700,
    color: "#4B5563",
  },
  priceText: {
    fontSize: 26,
    fontWeight: 800,
    color: PRIMARY,
  },

  // Cover Page Quick Specs Box (Eliminates Empty Void)
  quickSpecsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  quickSpecCard: {
    width: "31.5%",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickSpecIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  quickSpecLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  quickSpecValue: {
    fontSize: 10.5,
    fontWeight: 700,
    color: TEXT_MAIN,
  },

  // Agent Bar
  agentBar: {
    marginTop: "auto",
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  agentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  agentAvatarText: {
    fontSize: 14,
    fontWeight: 800,
    color: PRIMARY,
  },
  agentAvatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    objectFit: "cover",
  },
  agentName: {
    fontSize: 13.5,
    fontWeight: 800,
    color: "#FFFFFF",
  },
  agentPhoneBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
  },
  agentPhoneText: {
    fontSize: 10.5,
    fontWeight: 800,
    color: PRIMARY,
  },

  // ── Page 2: Specifications & Content ──
  pageTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT_MAIN,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: PRIMARY,
  },
  section: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 800,
    color: TEXT_MAIN,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  grid2Col: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48.5%",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  featureIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTextCol: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 1.5,
  },
  featureValue: {
    fontSize: 10.5,
    fontWeight: 700,
    color: TEXT_MAIN,
  },

  // Amenities & Highlights
  amenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  amenityChip: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  amenityText: {
    fontSize: 9.5,
    fontWeight: 700,
    color: TEXT_MAIN,
  },
  highlightCard: {
    width: "48.5%",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  highlightText: {
    fontSize: 10,
    fontWeight: 600,
    color: TEXT_MAIN,
    flex: 1,
  },
  aboutParagraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#374151",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // ── Page 3+: High-Resolution Photo Gallery ──
  galleryPageTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: TEXT_MAIN,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: PRIMARY,
  },
  galleryStack: {
    flexDirection: "column",
    gap: 14,
    flex: 1,
  },
  galleryBoxDouble: {
    width: "100%",
    height: 330,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  galleryBoxSingle: {
    width: "100%",
    height: 640,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  galleryNaturalImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
});

// SVG Icons
function PinIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke="#6B7280"
        strokeWidth={2}
        fill="none"
      />
      <Circle cx={12} cy={10} r={3} stroke="#6B7280" strokeWidth={2} fill="none" />
    </Svg>
  );
}

function HouseIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={PRIMARY}
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  );
}

function WhatsAppIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24">
      <Path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke={PRIMARY}
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={PRIMARY}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Feature Icon based on name
function FeatureIcon({ type }: { type?: string }) {
  const t = (type || "").toLowerCase();

  if (t.includes("bed") || t.includes("config")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("area") || t.includes("sq")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("bath")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path d="M9 6h6M12 3v3M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("park") || t.includes("car")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Circle cx={7} cy={17} r={2} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Circle cx={17} cy={17} r={2} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("water")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("power") || t.includes("backup")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("security") || t.includes("cctv") || t.includes("rera") || t.includes("title")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("lift") || t.includes("floor")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("sun") || t.includes("light") || t.includes("facing")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={5} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("loan") || t.includes("maintenance") || t.includes("cost") || t.includes("price")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path d="M6 3h12M6 8h12M6 13l6 8M6 13h3a4.5 4.5 0 0 0 0-9" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("route") || t.includes("nearby") || t.includes("metro") || t.includes("highway")) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Circle cx={6} cy={19} r={3} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Circle cx={18} cy={5} r={3} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }

  // Default Leaf / Bullet
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

interface BrochurePdfProps {
  listing: Listing;
  broker: Profile;
  photos: Array<{ photo_url: string; display_order?: number; is_cover?: boolean }>;
  liveUrl?: string;
  isPaidPlan?: boolean;
}

export default function ListingBrochurePdf({
  listing,
  broker,
  photos,
  liveUrl,
  isPaidPlan = false,
}: BrochurePdfProps) {
  const sortedPhotos = [...photos].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  );

  const heroPhoto =
    sortedPhotos.find((p) => p.is_cover)?.photo_url ||
    sortedPhotos[0]?.photo_url ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80";

  // All photos other than the Hero photo will be rendered at the end in their natural resolution
  const galleryPhotos = sortedPhotos.filter((p) => p.photo_url !== heroPhoto);

  const cleanDigits = (broker.phone_number || "").replace(/\D/g, "");
  const waPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
  const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `Hi ${broker.full_name}, I saw the brochure for "${listing.title}". Can we schedule a site visit?`
  )}`;

  // Page 1 Key Specs Grid (Quick Specs)
  const quickSpecs = [
    { label: "Configuration", value: listing.bhk ? `${listing.bhk} BHK` : null, type: "bed" },
    { label: "Carpet Area", value: listing.carpet_area_sqft ? `${listing.carpet_area_sqft.toLocaleString("en-IN")} Sq.Ft.` : null, type: "area" },
    { label: "Super Built-Up", value: listing.super_built_up_sqft ? `${listing.super_built_up_sqft.toLocaleString("en-IN")} Sq.Ft.` : null, type: "area" },
    { label: "Bathrooms", value: listing.bathrooms ? `${listing.bathrooms} Attached` : null, type: "bath" },
    { label: "Floor", value: listing.floor ? `${listing.floor}${listing.total_floors ? ` of ${listing.total_floors}` : ""}` : null, type: "floor" },
    { label: "Furnishing", value: listing.furnishing || null, type: "sofa" },
  ].filter((c) => Boolean(c.value));

  // Page 2 Full Feature Cards (Home Details, Building & Ownership)
  const fullSpecCards = [
    { label: "Configuration", value: listing.bhk ? `${listing.bhk} BHK` : null, type: "bed" },
    { label: "Carpet Area", value: listing.carpet_area_sqft ? `${listing.carpet_area_sqft.toLocaleString("en-IN")} Sq.Ft.` : null, type: "area" },
    { label: "Super Built-Up Area", value: listing.super_built_up_sqft ? `${listing.super_built_up_sqft.toLocaleString("en-IN")} Sq.Ft.` : null, type: "area" },
    { label: "Bathrooms", value: listing.bathrooms ? `${listing.bathrooms} Attached` : null, type: "bath" },
    { label: "Floor", value: listing.floor ? `${listing.floor}${listing.total_floors ? ` of ${listing.total_floors}` : ""}` : null, type: "floor" },
    { label: "Furnishing", value: listing.furnishing || null, type: "sofa" },
    { label: "Facing", value: listing.facing || null, type: "sun" },
    { label: "Possession", value: listing.possession || null, type: "clock" },
    { label: "Car Parking", value: listing.parking_covered ? `${listing.parking_covered} Covered` : "Covered Parking", type: "car" },
    { label: "Visitor Parking", value: listing.parking_visitor ? `${listing.parking_visitor} Visitor Slot` : "Available", type: "car" },
    { label: "Property Age", value: listing.property_age || "Well-Maintained", type: "clock" },
    { label: "Building Type", value: listing.building_type || "Premium Residential Tower", type: "building" },
    { label: "Lifts", value: listing.lifts || "High-Speed Elevators", type: "lift" },
    { label: "Water Supply", value: listing.water_supply || "24x7 Municipal & Borewell", type: "water" },
    { label: "Power Backup", value: listing.power_backup || "100% DG Backup", type: "power" },
    { label: "Security", value: listing.security || "24x7 Manned Security & CCTV", type: "security" },
    { label: "RERA Status", value: listing.rera_number ? `RERA: ${listing.rera_number}` : listing.rera_status || "RERA Approved", type: "rera" },
    { label: "Ownership / Title", value: listing.title_status || "Clear Freehold Title", type: "title" },
    { label: "Bank Loan", value: listing.bank_loans && listing.bank_loans.length > 0 ? `Approved (${listing.bank_loans.join(", ")})` : "Bank Loan Approved", type: "loan" },
    { label: "Maintenance", value: listing.maintenance_monthly ? `₹${Number(listing.maintenance_monthly).toLocaleString("en-IN")}/mo` : null, type: "maintenance" },
  ].filter((c) => Boolean(c.value));

  // Amenities list
  const amenitiesList =
    listing.amenities && listing.amenities.length > 0
      ? listing.amenities
      : [
          "2 High-Speed Lifts per Tower",
          "24×7 Water Supply",
          "100% Power Backup",
          "24×7 Security & CCTV",
          "Swimming Pool",
          "Gym & Fitness Center",
          "Clubhouse",
          "Kids Play Area",
          "Jogging Track",
          "Party Lawn",
        ];

  // Property highlights
  const highlightsList =
    listing.ai_highlights && listing.ai_highlights.length > 0
      ? listing.ai_highlights
      : [
          "High natural ventilation and natural sunlight",
          "Premium location with wide road connectivity",
          "Gated society with peaceful family environment",
          "Ready-to-move with complete documentation",
        ];

  return (
    <Document
      title={`${listing.title} - Luxury Brochure`}
      author={broker.full_name}
      subject="Property Brochure"
      creator="PropertySnaps"
    >
      {/* ═══════════════════════════════════════════════════
          PAGE 1: COVER & EXECUTIVE OVERVIEW
          ═══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        {/* Location Row */}
        <View style={styles.locationRow}>
          <PinIcon />
          <Text style={styles.locationText}>
            {listing.location_locality ? `${listing.location_locality}, ` : ""}
            {listing.location_city}
          </Text>
        </View>

        {/* Property Title */}
        <Text style={styles.titleH1}>{listing.title}</Text>

        {/* Badges & Price Header */}
        <View style={styles.badgeAndPriceRow}>
          <View style={styles.badgeGroup}>
            <View style={styles.listingTypePill}>
              <HouseIcon />
              <Text style={styles.listingTypeText}>
                For {listing.listing_type || "Sale"}
              </Text>
            </View>
            <View style={styles.negotiablePill}>
              <Text style={styles.negotiableText}>
                {listing.is_negotiable !== false ? "Negotiable" : "Fixed Price"}
              </Text>
            </View>
          </View>
          <Text style={styles.priceText}>{listing.display_price}</Text>
        </View>

        {/* Hero Cover Image */}
        <View style={styles.heroContainer}>
          <Image src={heroPhoto} style={styles.heroImage} />
        </View>

        {/* Quick Specs Grid (Fills Page 1 beautifully, zero void) */}
        {quickSpecs.length > 0 && (
          <View style={styles.quickSpecsGrid}>
            {quickSpecs.map((spec, idx) => (
              <View key={idx} style={styles.quickSpecCard}>
                <View style={styles.quickSpecIcon}>
                  <FeatureIcon type={spec.type} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickSpecLabel}>{spec.label}</Text>
                  <Text style={styles.quickSpecValue}>{spec.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Agent Contact Card (Anchored at bottom) */}
        <View style={styles.agentBar}>
          <View style={styles.agentLeft}>
            <View style={styles.agentAvatar}>
              {broker.avatar_url && !broker.avatar_url.includes("brand-logo") ? (
                <Image src={broker.avatar_url} style={styles.agentAvatarImg} />
              ) : (
                <Text style={styles.agentAvatarText}>
                  {broker.full_name?.charAt(0)?.toUpperCase() || "D"}
                </Text>
              )}
            </View>
            <View>
              <Text style={styles.agentName}>{broker.full_name}</Text>
              {broker.company_name ? (
                <Text style={{ fontSize: 9, color: "#D1E7DD", marginTop: 2 }}>
                  {broker.company_name}
                </Text>
              ) : null}
            </View>
          </View>

          <Link src={waLink} style={styles.agentPhoneBtn}>
            <WhatsAppIcon />
            <Text style={styles.agentPhoneText}>
              {broker.phone_number || "+91 72520 58269"}
            </Text>
          </Link>
        </View>

        {/* Fixed Footer */}
        <View style={styles.footerLine} fixed />
        <View style={styles.footer} fixed>
          <Text style={styles.footerAgent}>
            {broker.full_name} · {broker.phone_number || "+91 72520 58269"}
          </Text>
          <View style={styles.footerRight}>
            {!isPaidPlan && <Text>Made using PropertySnaps</Text>}
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber}/${totalPages}`
              }
            />
          </View>
        </View>
      </Page>

      {/* ═══════════════════════════════════════════════════
          PAGE 2: COMPLETE SPECIFICATIONS & DETAILS
          ═══════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>PROPERTY SPECIFICATIONS & DETAILS</Text>

        {/* Full Features Grid (Bold, prominent, comfortable sizes) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>HOME & BUILDING FEATURES</Text>
          <View style={styles.grid2Col}>
            {fullSpecCards.map((card, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <FeatureIcon type={card.type} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureLabel}>{card.label}</Text>
                  <Text style={styles.featureValue}>{card.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Amenities Section */}
        {amenitiesList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>SOCIETY AMENITIES</Text>
            <View style={styles.amenitiesWrap}>
              {amenitiesList.map((item, idx) => (
                <View key={idx} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Property Highlights Section */}
        {highlightsList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>KEY HIGHLIGHTS</Text>
            <View style={styles.grid2Col}>
              {highlightsList.map((hl, idx) => (
                <View key={idx} style={styles.highlightCard}>
                  <CheckIcon />
                  <Text style={styles.highlightText}>{hl}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* About this Property Description */}
        {listing.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>ABOUT THIS PROPERTY</Text>
            <Text style={styles.aboutParagraph}>{listing.description}</Text>
          </View>
        ) : null}

        {/* Fixed Footer */}
        <View style={styles.footerLine} fixed />
        <View style={styles.footer} fixed>
          <Text style={styles.footerAgent}>
            {broker.full_name} · {broker.phone_number || "+91 72520 58269"}
          </Text>
          <View style={styles.footerRight}>
            {!isPaidPlan && <Text>Made using PropertySnaps</Text>}
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber}/${totalPages}`
              }
            />
          </View>
        </View>
      </Page>

      {/* ═══════════════════════════════════════════════════
          PAGE 3+: HIGH-RESOLUTION PHOTO SHOWCASE
          (Photos render in original resolution & aspect ratio)
          ═══════════════════════════════════════════════════ */}
      {galleryPhotos.length > 0 &&
        Array.from({ length: Math.ceil(galleryPhotos.length / 2) }).map(
          (_, pageIdx) => {
            const pagePhotos = galleryPhotos.slice(pageIdx * 2, pageIdx * 2 + 2);
            const isSingle = pagePhotos.length === 1;

            return (
              <Page key={pageIdx} size="A4" style={styles.page}>
                <Text style={styles.galleryPageTitle}>
                  {pageIdx === 0 ? "PROPERTY PHOTO SHOWCASE" : "PROPERTY PHOTO SHOWCASE (CONT.)"}
                </Text>

                <View style={styles.galleryStack}>
                  {pagePhotos.map((photo, photoIdx) => (
                    <View
                      key={photoIdx}
                      style={isSingle ? styles.galleryBoxSingle : styles.galleryBoxDouble}
                    >
                      <Image
                        src={photo.photo_url}
                        style={styles.galleryNaturalImage}
                      />
                    </View>
                  ))}
                </View>

                {/* Fixed Footer */}
                <View style={styles.footerLine} fixed />
                <View style={styles.footer} fixed>
                  <Text style={styles.footerAgent}>
                    {broker.full_name} · {broker.phone_number || "+91 72520 58269"}
                  </Text>
                  <View style={styles.footerRight}>
                    {!isPaidPlan && <Text>Made using PropertySnaps</Text>}
                    <Text
                      render={({ pageNumber, totalPages }) =>
                        `${pageNumber}/${totalPages}`
                      }
                    />
                  </View>
                </View>
              </Page>
            );
          }
        )}
    </Document>
  );
}
