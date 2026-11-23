import { Suspense } from "react";
import BrochureClient from "./BrochureClient";
import BrandedSpinner from "@/components/BrandedSpinner";
import { INITIAL_LISTINGS } from "@/lib/store";
import { getListingFromDisk } from "@/lib/server-store";
import { createAdminClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{
    slug: string;
    listingSlug: string;
  }>;
}

export default async function BrochurePage({ params }: PageProps) {
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

        let brokerData = data.broker;
        if (!brokerData && data.broker_id) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.broker_id)
            .maybeSingle();
          if (prof) brokerData = prof;
        }
        if (!brokerData && slug) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
          if (prof) brokerData = prof;
        }

        listing = {
          ...data,
          photos: photos.length > 0 ? photos : data.photos || [],
          broker: brokerData || data.broker,
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
    <Suspense
      fallback={
        <BrandedSpinner
          message="Preparing luxury PDF brochure..."
          subMessage="Formatting high-resolution layouts"
        />
      }
    >
      <BrochureClient slug={slug} listingSlug={listingSlug} initialListing={listing || undefined} />
    </Suspense>
  );
}
