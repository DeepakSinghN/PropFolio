import { NextRequest, NextResponse } from "next/server";
import { getAllListingsFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const diskListings = getAllListingsFromDisk();
    const map = new Map<string, any>();

    // Seed defaults
    INITIAL_LISTINGS.forEach((l) => map.set(l.slug, l));
    // Overlay disk listings
    diskListings.forEach((l) => map.set(l.slug, l));

    const all = Array.from(map.values()).reverse();
    return NextResponse.json({ listings: all });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

