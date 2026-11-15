import { NextRequest, NextResponse } from "next/server";
import { getListingFromDisk, getAllListingsFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const all = getAllListingsFromDisk();
    let listing =
      getListingFromDisk(slug) ||
      all.find((l) => l.slug === slug || l.id === slug) ||
      INITIAL_LISTINGS.find((l) => l.slug === slug || l.id === slug);

    if (!listing && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const { data } = await supabase
          .from("listings")
          .select("*")
          .eq("slug", slug)
          .single();
        if (data) {
          listing = data as any;
        }
      } catch {}
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

