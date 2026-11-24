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

// Design Tokens
const PRIMARY = "#1F5C3A";
const PRIMARY_LIGHT = "#EAF4EE";
const TEXT_MAIN = "#111111";
const TEXT_MUTED = "#8A8A8A";
const CARD_BG = "#FAFAFA";
const BORDER_COLOR = "#EEEEEE";

const styles = StyleSheet.create({
  page: {
    size: "A4",
    paddingLeft: 36,
    paddingRight: 36,
    paddingTop: 28,
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
    backgroundColor: "#EEEEEE",
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 8,
    color: "#8A8A8A",
  },
  footerAgent: {
    fontWeight: 700,
    color: "#444444",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // Cover Page
  heroImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    objectFit: "cover",
    marginBottom: 10,
  },
  thumbnailRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  thumbnail: {
    flex: 1,
    height: 82,
    borderRadius: 14,
    objectFit: "cover",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 8.5,
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  listingTypePill: {
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listingTypeText: {
    fontSize: 9,
    fontWeight: 700,
    color: PRIMARY,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  priceText: {
    fontSize: 28,
    fontWeight: 800,
    color: PRIMARY,
  },
  negotiablePill: {
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 20,
  },
  negotiableText: {
    fontSize: 8.5,
    fontWeight: 700,
    color: PRIMARY,
  },
  agentBar: {
    marginTop: "auto",
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  agentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  agentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  agentAvatarText: {
    fontSize: 13,
    fontWeight: 800,
    color: PRIMARY,
  },
  agentAvatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    objectFit: "cover",
  },
  agentName: {
    fontSize: 13,
    fontWeight: 800,
    color: "#FFFFFF",
  },
  agentPhoneBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    textDecoration: "none",
  },
  agentPhoneText: {
    fontSize: 10,
    fontWeight: 800,
    color: PRIMARY,
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: TEXT_MAIN,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  grid2Col: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48.5%",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextCol: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginBottom: 1.5,
  },
  cardValue: {
    fontSize: 9.5,
    fontWeight: 700,
    color: TEXT_MAIN,
  },
  aboutParagraph: {
    fontSize: 9.5,
    lineHeight: 1.6,
    color: "#333333",
  },

  // Amenities Chips
  amenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 14,
  },
  amenityChip: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  amenityText: {
    fontSize: 8.5,
    fontWeight: 700,
    color: TEXT_MAIN,
  },

  // Highlights
  highlightCard: {
    width: "48.5%",
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
  highlightText: {
    fontSize: 9,
    fontWeight: 600,
    color: TEXT_MAIN,
    flex: 1,
  },

  // Photo Gallery
  galleryImage: {
    width: "100%",
    height: 230,
    borderRadius: 14,
    objectFit: "cover",
    marginBottom: 14,
  },
});

// SVG Icons
function PinIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke="#8A8A8A"
        strokeWidth={2}
        fill="none"
      />
      <Circle cx={12} cy={10} r={3} stroke="#8A8A8A" strokeWidth={2} fill="none" />
    </Svg>
  );
}

function HouseIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24">
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
    <Svg width={11} height={11} viewBox="0 0 24 24">
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
    <Svg width={12} height={12} viewBox="0 0 24 24">
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

// Generic Feature Icon based on name
function FeatureIcon({ type }: { type?: string }) {
  const t = (type || "").toLowerCase();

  if (t.includes("bed") || t.includes("config")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("area") || t.includes("sq")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("bath")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d="M9 6h6M12 3v3M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("park") || t.includes("car")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Circle cx={7} cy={17} r={2} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Circle cx={17} cy={17} r={2} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("water")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("power") || t.includes("backup")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("security") || t.includes("cctv") || t.includes("rera") || t.includes("title")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("lift") || t.includes("floor")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("sun") || t.includes("light") || t.includes("facing")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={5} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("loan") || t.includes("maintenance") || t.includes("cost") || t.includes("price")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path d="M6 3h12M6 8h12M6 13l6 8M6 13h3a4.5 4.5 0 0 0 0-9" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  if (t.includes("route") || t.includes("nearby") || t.includes("metro") || t.includes("highway")) {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Circle cx={6} cy={19} r={3} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" stroke={PRIMARY} strokeWidth={1.8} fill="none" />
        <Circle cx={18} cy={5} r={3} stroke={PRIMARY} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }

  // Default Leaf / Check / Sparkle
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24">
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

  const thumbnails = sortedPhotos
    .filter((p) => p.photo_url !== heroPhoto)
    .slice(0, 3);

  // Remaining gallery photos
  const galleryPhotos = sortedPhotos.slice(1);

  const cleanDigits = (broker.phone_number || "").replace(/\D/g, "");
  const waPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
  const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `Hi ${broker.full_name}, I saw the brochure for "${listing.title}". Can we schedule a site visit?`
  )}`;

  // Parse home detail cards
  const homeDetailCards = [
    { label: "Configuration", value: listing.bhk ? `${listing.bhk} BHK` : null, type: "bed" },
    { label: "Carpet Area", value: listing.carpet_area_sqft ? `${listing.carpet_area_sqft.toLocaleString("en-IN")} Sq.Ft.` : null, type: "area" },
    { label: "Super Built-Up Area", value: listing.super_built_up_sqft ? `${listing.super_built_up_sqft.toLocaleString("en-IN")} Sq.Ft.` : null, type: "area" },
    { label: "Bathrooms", value: listing.bathrooms ? `${listing.bathrooms} attached` : null, type: "bath" },
    { label: "Floor", value: listing.floor ? `${listing.floor}${listing.total_floors ? ` of ${listing.total_floors}` : ""}` : null, type: "floor" },
    { label: "Furnishing", value: listing.furnishing || null, type: "sofa" },
    { label: "Facing", value: listing.facing || null, type: "sun" },
    { label: "Possession", value: listing.possession || null, type: "clock" },
    { label: "Balcony", value: listing.balcony || null, type: "balcony" },
    { label: "Kitchen", value: listing.kitchen || null, type: "kitchen" },
    { label: "Wardrobes", value: listing.wardrobes || null, type: "wardrobe" },
    { label: "Air Conditioning", value: listing.ac_count ? `${listing.ac_count} AC included` : null, type: "ac" },
    { label: "Natural Light", value: listing.natural_light || null, type: "sun" },
    { label: "Ventilation", value: listing.ventilation || null, type: "wind" },
    { label: "View", value: listing.view || null, type: "eye" },
  ].filter((c) => Boolean(c.value));

  // Building & Amenities Cards
  const buildingCards = [
    { label: "Kids Play Area", value: "Yes", type: "play" },
    { label: "Car Parking", value: listing.parking_covered ? `${listing.parking_covered} Covered` : "2 Covered", type: "car" },
    { label: "Visitor Parking", value: listing.parking_visitor ? `${listing.parking_visitor} Visitor Slot` : "1 Visitor Slot", type: "car" },
    { label: "Property Age", value: listing.property_age || "5-Year-Old", type: "clock" },
    { label: "Building", value: listing.building_type || "Premium High-Rise Tower", type: "building" },
    { label: "Lifts", value: listing.lifts || "2 High-Speed Lifts per Tower", type: "lift" },
    { label: "Society", value: listing.society_description || "Peaceful, Green & Gated Residential Society", type: "society" },
    { label: "Water Supply", value: listing.water_supply || "24x7 Water Supply", type: "water" },
    { label: "Power Backup", value: listing.power_backup || "100% Power Backup", type: "power" },
    { label: "Security", value: listing.security || "24x7 Security & Guard", type: "security" },
    { label: "CCTV", value: "Yes", type: "cctv" },
    { label: "Intercom", value: "Yes", type: "intercom" },
    { label: "Swimming Pool", value: "Yes", type: "pool" },
    { label: "Gym", value: "Yes", type: "gym" },
    { label: "Clubhouse", value: "Yes", type: "club" },
    { label: "Jogging Track", value: "Yes", type: "track" },
    { label: "Yoga Deck", value: "Yes", type: "yoga" },
    { label: "Party Lawn", value: "Yes", type: "lawn" },
  ].filter((c) => Boolean(c.value));

  // Ownership & Costs Cards
  const ownershipCards = [
    { label: "RERA", value: listing.rera_number ? `Registered (${listing.rera_number})` : listing.rera_status || "Registered", type: "rera" },
    { label: "Title", value: listing.title_status || "Clear title", type: "title" },
    { label: "Bank Loan", value: listing.bank_loans && listing.bank_loans.length > 0 ? `Approved (${listing.bank_loans.join(", ")})` : "Approved (SBI, HDFC, ICICI)", type: "loan" },
    { label: "Maintenance", value: listing.maintenance_monthly ? `₹${Number(listing.maintenance_monthly).toLocaleString("en-IN")}/month` : "₹6,000/month", type: "maintenance" },
    { label: "Negotiable", value: listing.is_negotiable !== false ? "Yes, for genuine buyers" : "Fixed price", type: "price" },
  ].filter((c) => Boolean(c.value));

  // Nearby Cards
  const nearbyCards = (listing.nearby && listing.nearby.length > 0
    ? listing.nearby
    : [
        { label: "Metro Station", distance: "2 km away" },
        { label: "SG Highway", distance: "1.5 km away" },
      ]
  ).map((n) => ({
    label: n.label,
    value: n.distance,
    type: "route",
  }));

  // Amenities list
  const amenitiesList =
    listing.amenities && listing.amenities.length > 0
      ? listing.amenities
      : [
          "2 High-Speed Lifts per Tower",
          "24×7 Water Supply",
          "100% Power Backup",
          "24×7 Security",
          "CCTV",
          "Intercom",
          "Swimming Pool",
          "Gym",
          "Clubhouse",
          "Kids Play Area",
          "Jogging Track",
          "Yoga Deck",
          "Party Lawn",
        ];

  // Property highlights
  const highlightsList =
    listing.ai_highlights && listing.ai_highlights.length > 0
      ? listing.ai_highlights
      : [
          "City view from open balcony",
          "Excellent natural light",
          "Cross ventilation",
          "High-speed lift access",
          "Swimming pool and gym",
          "Clubhouse and party lawn",
        ];

  return (
    <Document
      title={`${listing.title} - Luxury Brochure`}
      author={broker.full_name}
      subject="Property Brochure"
      creator="PropertySnaps"
    >
      {/* ----------------- PAGE 1: COVER ----------------- */}
      <Page size="A4" style={styles.page}>
        {/* Hero Cover Photo */}
        <Image src={heroPhoto} style={styles.heroImage} />

        {/* 3 Thumbnails */}
        {thumbnails.length > 0 && (
          <View style={styles.thumbnailRow}>
            {thumbnails.map((t, idx) => (
              <Image key={idx} src={t.photo_url} style={styles.thumbnail} />
            ))}
          </View>
        )}

        {/* Location Label */}
        <View style={styles.locationRow}>
          <PinIcon />
          <Text style={styles.locationText}>
            {listing.location_locality ? `${listing.location_locality}, ` : ""}
            {listing.location_city}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.titleH1}>{listing.title}</Text>

        {/* Type & Negotiable Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.listingTypePill}>
            <HouseIcon />
            <Text style={styles.listingTypeText}>
              For {listing.listing_type || "Sale"}
            </Text>
          </View>
          <View style={styles.negotiablePill}>
            <Text style={styles.negotiableText}>Negotiable</Text>
          </View>
        </View>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{listing.display_price}</Text>
        </View>

        {/* Agent Bar */}
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
                <Text style={{ fontSize: 8.5, color: "#D1E7DD", marginTop: 1 }}>
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
            {!isPaidPlan && <Text>Made using PropSite</Text>}
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber}/${totalPages}`
              }
            />
          </View>
        </View>
      </Page>

      {/* ----------------- PAGE 2: HOME DETAILS & BUILDING ----------------- */}
      <Page size="A4" style={styles.page}>
        {/* Section: Home Details */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>HOME DETAILS</Text>
          <View style={styles.grid2Col}>
            {homeDetailCards.map((card, idx) => (
              <View key={idx} style={styles.card} wrap={false}>
                <View style={styles.iconBox}>
                  <FeatureIcon type={card.type} />
                </View>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardValue}>{card.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Section: Building & Amenities (first part) */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>BUILDING & AMENITIES</Text>
          <View style={styles.grid2Col}>
            {buildingCards.slice(0, 8).map((card, idx) => (
              <View key={idx} style={styles.card} wrap={false}>
                <View style={styles.iconBox}>
                  <FeatureIcon type={card.type} />
                </View>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardValue}>{card.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Fixed Footer */}
        <View style={styles.footerLine} fixed />
        <View style={styles.footer} fixed>
          <Text style={styles.footerAgent}>
            {broker.full_name} · {broker.phone_number || "+91 72520 58269"}
          </Text>
          <View style={styles.footerRight}>
            {!isPaidPlan && <Text>Made using PropSite</Text>}
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber}/${totalPages}`
              }
            />
          </View>
        </View>
      </Page>

      {/* ----------------- PAGE 3: BUILDING (CONT), OWNERSHIP & ABOUT ----------------- */}
      <Page size="A4" style={styles.page}>
        {/* Building & Amenities (remaining part) */}
        {buildingCards.length > 8 && (
          <View style={styles.section} wrap={false}>
            <View style={styles.grid2Col}>
              {buildingCards.slice(8).map((card, idx) => (
                <View key={idx} style={styles.card} wrap={false}>
                  <View style={styles.iconBox}>
                    <FeatureIcon type={card.type} />
                  </View>
                  <View style={styles.cardTextCol}>
                    <Text style={styles.cardLabel}>{card.label}</Text>
                    <Text style={styles.cardValue}>{card.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Section: Ownership & Costs */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>OWNERSHIP & COSTS</Text>
          <View style={styles.grid2Col}>
            {ownershipCards.map((card, idx) => (
              <View key={idx} style={styles.card} wrap={false}>
                <View style={styles.iconBox}>
                  <FeatureIcon type={card.type} />
                </View>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardValue}>{card.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Section: Nearby & Connectivity */}
        {nearbyCards.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>NEARBY & CONNECTIVITY</Text>
            <View style={styles.grid2Col}>
              {nearbyCards.map((card, idx) => (
                <View key={idx} style={styles.card} wrap={false}>
                  <View style={styles.iconBox}>
                    <FeatureIcon type={card.type} />
                  </View>
                  <View style={styles.cardTextCol}>
                    <Text style={styles.cardLabel}>{card.label}</Text>
                    <Text style={styles.cardValue}>{card.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Section: About this property */}
        {listing.description ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>ABOUT THIS PROPERTY</Text>
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
            {!isPaidPlan && <Text>Made using PropSite</Text>}
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber}/${totalPages}`
              }
            />
          </View>
        </View>
      </Page>

      {/* ----------------- PAGE 4: AMENITIES & HIGHLIGHTS ----------------- */}
      <Page size="A4" style={styles.page}>
        {/* Amenities Section */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>AMENITIES</Text>
          <View style={styles.amenitiesWrap}>
            {amenitiesList.map((item, idx) => (
              <View key={idx} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Property Highlights Section */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>PROPERTY HIGHLIGHTS</Text>
          <View style={styles.grid2Col}>
            {highlightsList.map((hl, idx) => (
              <View key={idx} style={styles.highlightCard} wrap={false}>
                <CheckIcon />
                <Text style={styles.highlightText}>{hl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fixed Footer */}
        <View style={styles.footerLine} fixed />
        <View style={styles.footer} fixed>
          <Text style={styles.footerAgent}>
            {broker.full_name} · {broker.phone_number || "+91 72520 58269"}
          </Text>
          <View style={styles.footerRight}>
            {!isPaidPlan && <Text>Made using PropSite</Text>}
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber}/${totalPages}`
              }
            />
          </View>
        </View>
      </Page>

      {/* ----------------- PAGE 5+: PHOTO GALLERY (2 per page) ----------------- */}
      {galleryPhotos.length > 0 &&
        Array.from({ length: Math.ceil(galleryPhotos.length / 2) }).map(
          (_, pageIdx) => {
            const pagePhotos = galleryPhotos.slice(pageIdx * 2, pageIdx * 2 + 2);
            return (
              <Page key={pageIdx} size="A4" style={styles.page}>
                {pageIdx === 0 && (
                  <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>
                    PHOTO GALLERY
                  </Text>
                )}
                {pagePhotos.map((photo, photoIdx) => (
                  <Image
                    key={photoIdx}
                    src={photo.photo_url}
                    style={styles.galleryImage}
                  />
                ))}

                {/* Fixed Footer */}
                <View style={styles.footerLine} fixed />
                <View style={styles.footer} fixed>
                  <Text style={styles.footerAgent}>
                    {broker.full_name} · {broker.phone_number || "+91 72520 58269"}
                  </Text>
                  <View style={styles.footerRight}>
                    {!isPaidPlan && <Text>Made using PropSite</Text>}
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

