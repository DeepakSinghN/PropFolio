import { notFound } from "next/navigation";
import { getCollectionFromDisk, getAllListingsFromDisk } from "@/lib/server-store";
import { DEMO_BROKER } from "@/lib/store";
import CollectionClient from "./CollectionClient";

interface PageProps {
  params: Promise<{
    slug: string;
    collectionSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { collectionSlug } = await params;
  const collection = getCollectionFromDisk(collectionSlug);

  if (!collection) {
    return { title: "Collection Not Found — PropFolio" };
  }

  return {
    title: `${collection.title} — Curated Property Collection`,
    description: collection.description || `Handpicked property collection curated by ${DEMO_BROKER.full_name}`,
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
