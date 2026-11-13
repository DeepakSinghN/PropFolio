import { NextRequest, NextResponse } from "next/server";
import { saveListingToMemory, DEMO_BROKER } from "@/lib/store";
import { saveListingToDisk } from "@/lib/server-store";
import { Listing } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const listing: Listing = await req.json();

    if (!listing || !listing.slug || !listing.title) {
      return NextResponse.json({ error: "Missing required listing fields" }, { status: 400 });
    }

    saveListingToMemory(listing);
    saveListingToDisk(listing);

    return NextResponse.json({ success: true, slug: listing.slug });
  } catch (err: any) {
    console.error("Save listing API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

