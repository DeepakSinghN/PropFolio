import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionFromDisk, getAllListingsFromDisk } from "@/lib/server-store";
import { DEMO_BROKER } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/server";
import CollectionClient from "./CollectionClient";

interface PageProps {
  params: Promise<{
    slug: string;
    collectionSlug: string;
  }>;
}

async function resolveBrokerBySlug(slug: string) {
  const supabase = createAdminClient();
  if (supabase && slug && slug !== "broker" && slug !== "l") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (profile) return profile;
    } catch {
      // Fallback to DEMO_BROKER
    }
  }
  return DEMO_BROKER;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, collectionSlug } = await params;
  const collection = getCollectionFromDisk(collectionSlug);

  if (!collection) {
    return { title: "Collection Not Found — Property Snaps" };
  }

  const broker = await resolveBrokerBySlug(slug);
  const allListings = getAllListingsFromDisk();
  const listingMap = new Map(allListings.map((l) => [l.slug, l]));
  const curatedListings = collection.listing_slugs
    .map((s) => listingMap.get(s))
    .filter(Boolean);

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.propertysnaps.in";
  const firstListing = curatedListings[0];
  const rawCover = firstListing?.photos?.[0]?.photo_url;
  let coverPhoto: string | undefined;

  if (rawCover && !rawCover.startsWith("blob:")) {
    if (rawCover.startsWith("data:image/") && firstListing?.slug) {
      coverPhoto = `${appBaseUrl}/api/listings/${firstListing.slug}/cover`;
    } else if (rawCover.startsWith("http://") || rawCover.startsWith("https://")) {
      coverPhoto = rawCover;
    } else if (rawCover.startsWith("/")) {
      coverPhoto = `${appBaseUrl}${rawCover}`;
    }
  }

  const title = `📋 ${collection.title} (${curatedListings.length} Properties) | ${broker.full_name}`;
  const description =
    collection.description ||
    `Explore ${curatedListings.length} verified luxury properties hand-picked by ${broker.full_name}. Tap to view property shortlists and schedule private site visits.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Property Snaps Collections",
      ...(coverPhoto
        ? {
            images: [
              {
                url: coverPhoto,
                width: 1200,
                height: 630,
                alt: collection.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(coverPhoto ? { images: [coverPhoto] } : {}),
    },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug, collectionSlug } = await params;
  const collection = getCollectionFromDisk(collectionSlug);

  if (!collection) {
    notFound();
  }

  const broker = await resolveBrokerBySlug(slug);
  const allListings = getAllListingsFromDisk();
  const listingMap = new Map(allListings.map((l) => [l.slug, l]));
  const curatedListings = collection.listing_slugs
    .map((s) => listingMap.get(s))
    .filter(Boolean);

  return (
    <CollectionClient
      collection={collection}
      listings={curatedListings as any}
      broker={broker}
    />
  );
}

