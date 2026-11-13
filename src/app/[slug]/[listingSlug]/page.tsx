import { Suspense } from "react";
import type { Metadata } from "next";
import PublicListingClient from "./PublicListingClient";
import { INITIAL_LISTINGS, DEMO_BROKER } from "@/lib/store";
import { getListingFromDisk } from "@/lib/server-store";

interface PageProps {
  params: Promise<{
    slug: string;
    listingSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, listingSlug } = await params;
  const listing =
    getListingFromDisk(listingSlug) ||
    INITIAL_LISTINGS.find((l) => l.slug === listingSlug) ||
    INITIAL_LISTINGS[0];

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://prop-folio-eosin.vercel.app";

  let coverPhoto = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&auto=format&fit=crop&q=80";
  const rawCover = listing.photos?.[0]?.photo_url;

  if (rawCover) {
    if (rawCover.startsWith("data:image/")) {
      coverPhoto = `${appBaseUrl}/api/listings/${listing.slug}/cover`;
    } else if (rawCover.startsWith("http://") || rawCover.startsWith("https://")) {
      coverPhoto = rawCover;
    } else if (rawCover.startsWith("/")) {
      coverPhoto = `${appBaseUrl}${rawCover}`;
    }
  }

  // Exact clean title format (e.g. "3 BHK Apartment for Sale in Satellite, Ahmedabad")
  const title = `${listing.bhk ? `${listing.bhk} BHK ` : ""}${listing.property_type || "Apartment"} for ${
    listing.listing_type || "Sale"
  } in ${listing.location_locality || listing.location_city}`;

  // Clean single-paragraph description for WhatsApp preview bubble
  const description = listing.description
    ? listing.description.replace(/\n+/g, " ").trim().slice(0, 190) + "..."
    : `This premium ${listing.bhk ? `${listing.bhk} BHK ` : ""}${listing.property_type || "apartment"} in ${
        listing.location_locality || listing.location_city
      } offers a spacious ${listing.carpet_area_sqft ? `${listing.carpet_area_sqft.toLocaleString()} Sq.Ft. super built-up area.` : "living area."} Move-in ready.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "PropFolio",
      images: [
        {
          url: coverPhoto,
          width: 1200,
          height: 800,
          type: "image/jpeg",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverPhoto],
    },
  };
}

export default async function PublicListingPage({ params }: PageProps) {
  const { slug, listingSlug } = await params;
  const listing =
    getListingFromDisk(listingSlug) ||
    INITIAL_LISTINGS.find((l) => l.slug === listingSlug) ||
    INITIAL_LISTINGS[0];

  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading listing...</div>}>
      <PublicListingClient slug={slug} listingSlug={listingSlug} initialListing={listing} />
    </Suspense>
  );
}
