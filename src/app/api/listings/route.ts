import { NextRequest, NextResponse } from "next/server";
import { getAllListingsFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const diskListings = getAllListingsFromDisk();
    const map = new Map<string, any>();

    // 1. Seed defaults
    INITIAL_LISTINGS.forEach((l) => map.set(l.slug, l));

    // 2. Fetch from Supabase if configured
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
          .from("listings")
          .select("*")
          .order("created_at", { ascending: false });
        if (data && Array.isArray(data)) {
          data.forEach((l: any) => map.set(l.slug, l));
        }
      } catch (e) {
        console.warn("Supabase fetch listings error:", e);
      }
    }

    // 3. Overlay disk listings
    diskListings.forEach((l) => map.set(l.slug, l));

    const all = Array.from(map.values()).reverse();
    return NextResponse.json({ listings: all });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

