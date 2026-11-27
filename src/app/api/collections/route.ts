import { NextRequest, NextResponse } from "next/server";
import { getAllCollectionsFromDisk, saveCollectionToDisk, getAllListingsFromDisk } from "@/lib/server-store";
import { PropertyCollection } from "@/types/database";
import { getPhoneSession, ensureProfileNotExpired } from "@/lib/auth-store";
import { getEffectivePlan } from "@/lib/plans";

export async function GET(req: NextRequest) {
  try {
    const collections = getAllCollectionsFromDisk();
    const diskListings = getAllListingsFromDisk();
    const listingMap = new Map(diskListings.map((l) => [l.slug, l]));

    // Attach summary stats to collections
    const enriched = collections.map((col) => {
      const items = col.listing_slugs.map((s) => listingMap.get(s)).filter(Boolean);
      const totalValue = items.reduce((sum, item: any) => sum + (item.price_amount || 0), 0);
      const localities = Array.from(new Set(items.map((i: any) => i.location_locality).filter(Boolean)));
      
      return {
        ...col,
        listing_count: col.listing_slugs.length,
        total_value: totalValue,
        localities,
        sample_photos: items.flatMap((i: any) => (i.photos || []).map((p: any) => p.photo_url)).slice(0, 4)
      };
    });

    return NextResponse.json({ success: true, collections: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, listing_slugs, broker_id } = body;

    if (!title || !listing_slugs || !Array.isArray(listing_slugs) || listing_slugs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Title and at least one property are required" },
        { status: 400 }
      );
    }

    // Enforce plan collection limit if session cookie is present
    const phoneCookie = req.cookies.get("propfolio-phone-session");
    if (phoneCookie?.value) {
      const sess = getPhoneSession(phoneCookie.value);
      if (sess?.profile) {
        const activeProf = await ensureProfileNotExpired(sess.profile);
        const { plan } = getEffectivePlan(activeProf);
        const existingCols = getAllCollectionsFromDisk().filter(
          (c) => !activeProf.id || c.broker_id === activeProf.id || c.broker_id === "broker-default"
        );
        if (!plan.isUnlimitedCollections && existingCols.length >= plan.maxCollections) {
          return NextResponse.json(
            {
              success: false,
              error: `Your ${plan.name} plan allows up to ${plan.maxCollections} collection${plan.maxCollections === 1 ? "" : "s"}. Upgrade to create more.`,
              code: "COLLECTION_LIMIT_REACHED",
            },
            { status: 403 }
          );
        }
      }
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `collection-${Date.now()}`;

    const newCollection: PropertyCollection = {
      id: "col-" + Date.now(),
      broker_id: broker_id || "broker-default",
      title: title.trim(),
      slug,
      description: description?.trim() || "",
      listing_slugs,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_count: 0
    };

    saveCollectionToDisk(newCollection);
    return NextResponse.json({ success: true, collection: newCollection });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

