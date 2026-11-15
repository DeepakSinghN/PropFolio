import { NextRequest, NextResponse } from "next/server";
import { getAllListingsFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const map = new Map<string, any>();
    let hasSupabaseListings = false;

    // 1. Fetch from Supabase if configured
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*, listing_photos(*)")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Supabase fetch listings error:", error);
        } else if (data && Array.isArray(data) && data.length > 0) {
          hasSupabaseListings = true;
          data.forEach((l: any) => {
            const photos = (l.listing_photos || []).sort(
              (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
            );
            map.set(l.slug, {
              ...l,
              photos: photos.length > 0 ? photos : l.photos || [],
            });
          });
        }
      } catch (e) {
        console.warn("Supabase fetch listings exception:", e);
      }
    }

    // 2. If no Supabase listings exist yet, overlay disk listings and fallback demo listings
    if (!hasSupabaseListings) {
      const diskListings = getAllListingsFromDisk();
      diskListings.forEach((l) => map.set(l.slug, l));

      if (map.size === 0) {
        INITIAL_LISTINGS.forEach((l) => map.set(l.slug, l));
      }
    }

    const all = Array.from(map.values()).reverse();
    return NextResponse.json({ listings: all });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
