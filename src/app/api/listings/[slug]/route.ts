import { NextRequest, NextResponse } from "next/server";
import { getListingFromDisk, getAllListingsFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    let listing: any = null;

    // 1. Check Supabase first
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*, listing_photos(*)")
          .eq("slug", slug)
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

          listing = {
            ...data,
            photos: photos.length > 0 ? photos : data.photos || [],
            broker: brokerData || data.broker,
          };
        }
      } catch (e) {
        console.warn("Supabase fetch single listing error:", e);
      }
    }

    // 2. Fallback to disk or initial demo listings
    if (!listing) {
      const all = getAllListingsFromDisk();
      listing =
        getListingFromDisk(slug) ||
        all.find((l) => l.slug === slug || l.id === slug) ||
        INITIAL_LISTINGS.find((l) => l.slug === slug || l.id === slug);
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
