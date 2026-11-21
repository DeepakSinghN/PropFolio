import { Suspense } from "react";
import BrochureClient from "./BrochureClient";
import BrandedSpinner from "@/components/BrandedSpinner";
import { INITIAL_LISTINGS } from "@/lib/store";
import { getListingFromDisk } from "@/lib/server-store";

interface PageProps {
  params: Promise<{
    slug: string;
    listingSlug: string;
  }>;
}

export default async function BrochurePage({ params }: PageProps) {
  const { slug, listingSlug } = await params;
  const listing = getListingFromDisk(listingSlug) || INITIAL_LISTINGS.find(l => l.slug === listingSlug);

  return (
    <Suspense
      fallback={
        <BrandedSpinner
          message="Preparing luxury PDF brochure..."
          subMessage="Formatting high-resolution layouts"
        />
      }
    >
      <BrochureClient slug={slug} listingSlug={listingSlug} initialListing={listing} />
    </Suspense>
  );
}
