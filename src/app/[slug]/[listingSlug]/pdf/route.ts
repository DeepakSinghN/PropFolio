import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/server";
import { getListingFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS, DEMO_BROKER } from "@/lib/store";
import ListingBrochurePdf from "@/components/pdf/ListingBrochurePdf";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; listingSlug: string }> }
) {
  try {
    const { slug, listingSlug } = await params;
    let listing: any = null;
    let brokerProfile: any = null;

    const supabase = createAdminClient();
    if (supabase) {
      try {
        // 1. Resolve broker profile first
        if (slug && slug !== "broker" && slug !== "l") {
          const { data: profBySlug } = await supabase
            .from("profiles")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
          if (profBySlug) brokerProfile = profBySlug;
        }

        // 2. Fetch listing
        const { data } = await supabase
          .from("listings")
          .select("*, listing_photos(*)")
          .eq("slug", listingSlug)
          .maybeSingle();

        if (data) {
          const photos = (data.listing_photos || []).sort(
            (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
          );

          if (!brokerProfile && data.broker_id) {
            const { data: profById } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.broker_id)
              .maybeSingle();
            if (profById) brokerProfile = profById;
          }

          listing = {
            ...data,
            photos: photos.length > 0 ? photos : data.photos || [],
            broker: brokerProfile || data.broker,
          };
        }
      } catch (err) {
        console.warn("Supabase fetch PDF error:", err);
      }
    }

    // Fallback to disk or demo listings
    if (!listing) {
      listing =
        getListingFromDisk(listingSlug) ||
        INITIAL_LISTINGS.find((l) => l.slug === listingSlug);
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const broker = brokerProfile || listing.broker || DEMO_BROKER;
    const photos =
      listing.photos && listing.photos.length > 0
        ? listing.photos
        : [
            {
              photo_url:
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80",
              display_order: 1,
              is_cover: true,
            },
          ];

    const host = req.headers.get("host") || "propertysnaps.in";
    const proto = host.includes("localhost") ? "http" : "https";
    const liveUrl = `${proto}://${broker.slug || "broker"}.${host.includes("localhost") ? "localhost:3000" : "propertysnaps.in"}/${listing.slug}`;
    const isPaid = broker.plan_tier && broker.plan_tier !== "free";

    // Generate PDF Buffer
    const pdfElement = React.createElement(ListingBrochurePdf, {
      listing,
      broker,
      photos,
      liveUrl,
      isPaidPlan: Boolean(isPaid),
    });

    const pdfBuffer = await renderToBuffer(pdfElement as any);

    const safeFilename = (listing.title || listingSlug || "brochure")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 50);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeFilename}.pdf"`,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error: any) {
    console.error("PDF generation failure:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF brochure", details: error.message },
      { status: 500 }
    );
  }
}
