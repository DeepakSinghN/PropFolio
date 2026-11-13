import { NextRequest, NextResponse } from "next/server";
import { getCollectionFromDisk, deleteCollectionFromDisk, getAllListingsFromDisk } from "@/lib/server-store";
import { DEMO_BROKER } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const collection = getCollectionFromDisk(slug);

    if (!collection) {
      return NextResponse.json({ success: false, error: "Collection not found" }, { status: 404 });
    }

    const diskListings = getAllListingsFromDisk();
    const listingMap = new Map(diskListings.map((l) => [l.slug, l]));
    const listings = collection.listing_slugs.map((s) => listingMap.get(s)).filter(Boolean);

    return NextResponse.json({
      success: true,
      collection,
      listings,
      broker: DEMO_BROKER
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const deleted = deleteCollectionFromDisk(slug);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
