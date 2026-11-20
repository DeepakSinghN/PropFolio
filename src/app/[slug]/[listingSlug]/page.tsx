import type { Metadata } from "next";
import { Suspense } from "react";
import { getListingFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/server";
import PublicListingClient from "./PublicListingClient";

interface PageProps {
  params: Promise<{
    slug: string;
    listingSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { listingSlug } = await params;

  let listing: any = null;
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .eq("slug", listingSlug)
        .maybeSingle();
      if (data) {
        const photos = (data.listing_photos || []).sort(
          (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
        );
        listing = {
          ...data,
          photos: photos.length > 0 ? photos : data.photos || [],
        };
      }
    } catch {}
  }

  if (!listing) {
    listing =
      getListingFromDisk(listingSlug) ||
      INITIAL_LISTINGS.find((l) => l.slug === listingSlug);
  }

  if (!listing) {
    return {
      title: "Property Listing | Property Snaps",
      description: "Verified luxury property listing on Property Snaps.",
    };
  }

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

  const title = `${listing.title} | ${listing.display_price}`;
  const description =
    listing.description?.slice(0, 160) ||
    `${listing.bhk || ""} BHK ${listing.property_type} in ${listing.location_locality}, ${listing.location_city}. Verified listing with instant WhatsApp inquiry.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: coverPhoto,
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
      type: "website",
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
  let listing: any = null;

  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .eq("slug", listingSlug)
        .maybeSingle();

      if (data) {
        const photos = (data.listing_photos || []).sort(
          (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
        );
        listing = {
          ...data,
          photos: photos.length > 0 ? photos : data.photos || [],
        };
      }
    } catch {}
  }

  if (!listing) {
    listing =
      getListingFromDisk(listingSlug) ||
      INITIAL_LISTINGS.find((l) => l.slug === listingSlug);
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading listing...</div>}>
      <PublicListingClient slug={slug} listingSlug={listingSlug} initialListing={listing || undefined} />
    </Suspense>
  );
}
