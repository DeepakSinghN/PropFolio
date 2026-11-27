import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { getListingFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/server";
import PublicListingClient from "./PublicListingClient";
import ListingSkeleton from "@/components/ListingSkeleton";

interface PageProps {
  params: Promise<{
    slug: string;
    listingSlug: string;
  }>;
}

// React cache() guarantees single execution per request (deduplicates between generateMetadata and Page)
const getCachedListingData = cache(async (slug: string, listingSlug: string) => {
  let listing: any = null;
  let brokerProfile: any = null;

  const supabase = createAdminClient();
  if (supabase) {
    try {
      // 1. Single query: Fetch listing, photos, and linked broker profile together
      const { data } = await supabase
        .from("listings")
        .select("*, listing_photos(*), broker:profiles(*)")
        .eq("slug", listingSlug)
        .maybeSingle();

      if (data) {
        const photos = (data.listing_photos || []).sort(
          (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
        );

        brokerProfile = data.broker;

        // Fallback: lookup broker by id if join didn't populate
        if (!brokerProfile && data.broker_id) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.broker_id)
            .maybeSingle();
          if (prof) brokerProfile = prof;
        }

        // Fallback: lookup broker by slug from URL if not yet found
        if (!brokerProfile && slug && slug !== "l" && slug !== "broker") {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
          if (prof) brokerProfile = prof;
        }

        listing = {
          ...data,
          photos: photos.length > 0 ? photos : data.photos || [],
          broker: brokerProfile || data.broker,
        };
      }
    } catch (err) {
      console.warn("Cached listing fetch error:", err);
    }
  }

  // Fallback to local memory/disk store
  if (!listing) {
    listing =
      getListingFromDisk(listingSlug) ||
      INITIAL_LISTINGS.find((l) => l.slug === listingSlug) ||
      null;
  }

  if (listing && brokerProfile) {
    listing.broker = brokerProfile;
  }

  return { listing, brokerProfile: brokerProfile || listing?.broker || null };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, listingSlug } = await params;
  const { listing } = await getCachedListingData(slug, listingSlug);

  if (!listing) {
    return {
      title: "Property Listing | Property Snaps",
      description: "Verified luxury property listing on Property Snaps.",
    };
  }

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.propertysnaps.in";

  let coverPhoto =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&auto=format&fit=crop&q=80";
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
  const { listing, brokerProfile } = await getCachedListingData(slug, listingSlug);

  return (
    <Suspense fallback={<ListingSkeleton />}>
      <PublicListingClient
        slug={slug}
        listingSlug={listingSlug}
        initialListing={listing || undefined}
        initialBroker={brokerProfile || listing?.broker || undefined}
      />
    </Suspense>
  );
}
