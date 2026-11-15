import type { Metadata } from "next";
import { getAllListingsFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS, DEMO_BROKER } from "@/lib/store";
import BrokerProfileClient from "./BrokerProfileClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brokerName = DEMO_BROKER.full_name;
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

  // Fetch all listings
  const allListings = getAllListingsFromDisk();
  const brokerListings = allListings.length > 0 ? allListings : INITIAL_LISTINGS;

  return (
    <BrokerProfileClient
      slug={slug}
      initialBroker={DEMO_BROKER}
      initialListings={brokerListings}
    />
  );
}
