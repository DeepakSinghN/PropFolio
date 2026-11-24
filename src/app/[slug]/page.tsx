import type { Metadata } from "next";
import { getAllListingsFromDisk, getListingFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS, DEMO_BROKER } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/server";
import BrokerProfileClient from "./BrokerProfileClient";
import PublicListingClient from "./[listingSlug]/PublicListingClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let brokerName = DEMO_BROKER.full_name;

  const supabase = createAdminClient();
  if (supabase) {
    try {
      // 1. Check if slug is a broker profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("slug", slug)
        .maybeSingle();

      if (profile?.full_name) {
        brokerName = profile.full_name;
        const title = `${brokerName} | Property Portfolio & Verified Listings`;
        const description = `Explore all luxury flats, villas, and verified properties listed by ${brokerName} on Property Snaps.`;
        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: "profile",
            siteName: "Property Snaps",
          },
        };
      }

      // 2. Check if slug is actually a listing slug requested directly
      const { data: listing } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .eq("slug", slug)
        .maybeSingle();

      if (listing) {
        const title = `${listing.title} | ${listing.display_price}`;
        const description =
          listing.description?.slice(0, 160) ||
          `${listing.bhk || ""} BHK ${listing.property_type} in ${listing.location_locality}, ${listing.location_city}. Verified listing with instant WhatsApp inquiry.`;
        const photos = (listing.listing_photos || []).sort(
          (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
        );
        const coverPhoto =
          photos?.[0]?.photo_url ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&auto=format&fit=crop&q=80";

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            images: [{ url: coverPhoto, width: 1200, height: 630, alt: listing.title }],
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
    } catch {}
  }

  // Also check memory / disk for listing fallback
  const diskListing = getListingFromDisk(slug) || INITIAL_LISTINGS.find((l) => l.slug === slug);
  if (diskListing) {
    const title = `${diskListing.title} | ${diskListing.display_price}`;
    return {
      title,
      description: diskListing.description?.slice(0, 160) || "Property listing on Property Snaps.",
    };
  }

  const title = `${brokerName} | Property Portfolio & Verified Listings`;
  const description = `Explore all luxury flats, villas, and verified properties listed by ${brokerName} on Property Snaps.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "Property Snaps",
    },
  };
}

export default async function BrokerProfilePage({ params }: PageProps) {
  const { slug } = await params;

  let allListings = getAllListingsFromDisk();
  let currentBroker = DEMO_BROKER;

  const supabase = createAdminClient();
  if (supabase) {
    try {
      // 1. Check for broker profile matching slug
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (profile) {
        currentBroker = {
          ...DEMO_BROKER,
          ...profile,
        };

        const { data: supaListings } = await supabase
          .from("listings")
          .select("*, listing_photos(*)")
          .eq("broker_id", profile.id)
          .order("created_at", { ascending: false });

        if (supaListings && supaListings.length > 0) {
          allListings = supaListings.map((l: any) => ({
            ...l,
            photos: (l.listing_photos || []).sort(
              (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
            ),
          }));
        }

        const brokerListings = allListings.length > 0 ? allListings : INITIAL_LISTINGS;
        return (
          <BrokerProfileClient
            slug={slug}
            initialBroker={currentBroker}
            initialListings={brokerListings}
          />
        );
      }

      // 2. Fallback: If no broker profile matches, check if this slug is actually a listing slug!
      const { data: listingData } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .eq("slug", slug)
        .maybeSingle();

      if (listingData) {
        const photos = (listingData.listing_photos || []).sort(
          (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
        );

        let brokerData = listingData.broker;
        if (!brokerData && listingData.broker_id) {
          const { data: profById } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", listingData.broker_id)
            .maybeSingle();
          if (profById) brokerData = profById;
        }

        const fullListing = {
          ...listingData,
          photos: photos.length > 0 ? photos : listingData.photos || [],
          broker: brokerData || listingData.broker,
        };

        return (
          <PublicListingClient
            slug={brokerData?.slug || "broker"}
            listingSlug={slug}
            initialListing={fullListing}
            initialBroker={brokerData || undefined}
          />
        );
      }
    } catch (e) {
      console.warn("Supabase broker profile error:", e);
    }
  }

  // 3. Fallback: Check local disk/memory for listing
  const diskListing = getListingFromDisk(slug) || INITIAL_LISTINGS.find((l) => l.slug === slug);
  if (diskListing) {
    return (
      <PublicListingClient
        slug={diskListing.broker?.slug || "broker"}
        listingSlug={slug}
        initialListing={diskListing}
        initialBroker={diskListing.broker}
      />
    );
  }

  const brokerListings = allListings.length > 0 ? allListings : INITIAL_LISTINGS;

  return (
    <BrokerProfileClient
      slug={slug}
      initialBroker={currentBroker}
      initialListings={brokerListings}
    />
  );
}
