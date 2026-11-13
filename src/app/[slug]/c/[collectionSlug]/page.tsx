import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionFromDisk, getAllListingsFromDisk } from "@/lib/server-store";
import { DEMO_BROKER } from "@/lib/store";
import CollectionClient from "./CollectionClient";

interface PageProps {
  params: Promise<{
    slug: string;
    collectionSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { collectionSlug } = await params;
  const collection = getCollectionFromDisk(collectionSlug);

  if (!collection) {
    return { title: "Collection Not Found — PropFolio" };
  }

  const allListings = getAllListingsFromDisk();
  const listingMap = new Map(allListings.map((l) => [l.slug, l]));
  const curatedListings = collection.listing_slugs
    .map((s) => listingMap.get(s))
    .filter(Boolean);

  const rawCover = curatedListings[0]?.photos?.[0]?.photo_url;
  const coverPhoto =
    rawCover && !rawCover.startsWith("blob:")
      ? rawCover
      : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80";

  const title = `📋 ${collection.title} (${curatedListings.length} Curated Properties) | ${DEMO_BROKER.full_name}`;
  const description =
    collection.description ||
    `Explore ${curatedListings.length} verified luxury properties hand-picked by ${DEMO_BROKER.full_name}. Tap to view property shortlists and schedule private site visits.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "PropFolio Curated Collections",
      images: [
        {
          url: coverPhoto,
          width: 1200,
          height: 630,
          alt: collection.title,
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

export default async function CollectionPage({ params }: PageProps) {
  const { slug, collectionSlug } = await params;
  const collection = getCollectionFromDisk(collectionSlug);

  if (!collection) {
    notFound();
  }

  const allListings = getAllListingsFromDisk();
  const listingMap = new Map(allListings.map((l) => [l.slug, l]));
  const curatedListings = collection.listing_slugs
    .map((s) => listingMap.get(s))
    .filter(Boolean);

  return (
    <CollectionClient
      collection={collection}
      listings={curatedListings as any}
      broker={DEMO_BROKER}
    />
  );
}

