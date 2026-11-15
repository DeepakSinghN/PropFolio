import type { Metadata } from "next";
import { getAllListingsFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS, DEMO_BROKER } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/server";
import BrokerProfileClient from "./BrokerProfileClient";

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
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("slug", slug)
        .maybeSingle();
      if (profile?.full_name) {
        brokerName = profile.full_name;
      }
    } catch {}
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
      }
    } catch (e) {
      console.warn("Supabase broker profile error:", e);
    }
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
