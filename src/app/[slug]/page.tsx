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

  // Fetch all listings from disk and Supabase
  let allListings = getAllListingsFromDisk();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("listings").select("*");
      if (data && data.length > 0) {
        const combined = [...data, ...allListings];
        allListings = Array.from(new Map(combined.map((l: any) => [l.slug, l])).values());
      }
    } catch {}
  }

  const brokerListings = allListings.length > 0 ? allListings : INITIAL_LISTINGS;

  return (
    <BrokerProfileClient
      slug={slug}
      initialBroker={DEMO_BROKER}
      initialListings={brokerListings}
    />
  );
}

