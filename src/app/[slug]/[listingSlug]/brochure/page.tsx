import { Suspense } from "react";
import BrochureClient from "./BrochureClient";
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
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading brochure...</div>}>
      <BrochureClient slug={slug} listingSlug={listingSlug} initialListing={listing} />
    </Suspense>
  );
}
