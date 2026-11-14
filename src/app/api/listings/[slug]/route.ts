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
    const listing =
      getListingFromDisk(slug) ||
      all.find((l) => l.slug === slug || l.id === slug) ||
      INITIAL_LISTINGS.find((l) => l.slug === slug || l.id === slug);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

