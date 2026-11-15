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

    // Persist to Supabase if configured for multi-serverless sync
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Ensure valid broker_id for Supabase foreign key constraint
        let brokerId = listing.broker_id;
        if (!brokerId || brokerId === "b-1") {
          const { data: prof } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
          if (prof?.id) {
            brokerId = prof.id;
          }
        }

        await supabase.from("listings").upsert(
          {
            title: listing.title,
            slug: listing.slug,
            description: listing.description,
            property_type: listing.property_type,
            listing_type: listing.listing_type,
            bhk: listing.bhk,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            carpet_area_sqft: listing.carpet_area_sqft,
            price_amount: listing.price_amount,
            display_price: listing.display_price,
            currency: listing.currency,
            location_city: listing.location_city,
            location_locality: listing.location_locality,
            amenities: listing.amenities,
            ai_highlights: listing.ai_highlights,
            ai_neighborhood_highlights: listing.ai_neighborhood_highlights,
            status: listing.status,
            ...(brokerId && brokerId !== "b-1" ? { broker_id: brokerId } : {}),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        );
      } catch (supabaseErr) {
        console.warn("Supabase upsert notice:", supabaseErr);
      }
    }

    return NextResponse.json({ success: true, slug: listing.slug });
  } catch (err: any) {
    console.error("Save listing API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

