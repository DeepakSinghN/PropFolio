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

  const broker = listing.broker || DEMO_BROKER;
  const rawCover = listing.photos?.[0]?.photo_url;
  const coverPhoto =
    rawCover && !rawCover.startsWith("blob:")
      ? rawCover
      : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80";

  // Formatted for WhatsApp rich card unfurling
  const title = `🏡 ${listing.display_price} · ${listing.title} | ${broker.full_name}`;
  const description = `📍 ${listing.location_locality ? `${listing.location_locality}, ` : ""}${listing.location_city} · ${
    listing.bhk ? `${listing.bhk} BHK ` : ""
  }${listing.property_type} · ${
    listing.carpet_area_sqft ? `${listing.carpet_area_sqft.toLocaleString()} sq.ft · ` : ""
  }Verified Title. Tap to view luxury photos, video walkthrough & schedule direct site visit.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "PropFolio Luxury Private Office",
      images: [
        {
          url: coverPhoto,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: listing.title,
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
