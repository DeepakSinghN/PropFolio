import { NextRequest, NextResponse } from "next/server";
import { saveListingToMemory } from "@/lib/store";
import { saveListingToDisk } from "@/lib/server-store";
import { createAdminClient } from "@/lib/supabase/server";
import { Listing } from "@/types/database";

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: NextRequest) {
  try {
    const listing: Listing = await req.json();

    if (!listing || !listing.slug || !listing.title) {
      return NextResponse.json({ error: "Missing required listing fields: title or slug" }, { status: 400 });
    }

    saveListingToMemory(listing);
    saveListingToDisk(listing);

    const supabase = createAdminClient();

    if (supabase) {
      // 1. Resolve a valid UUID for broker_id
      let brokerId: string | null = null;

      if (isValidUUID(listing.broker_id)) {
        brokerId = listing.broker_id;
      }

      // Check user session cookie
      if (!brokerId) {
        const phoneCookie = req.cookies.get("propfolio-phone-session");
        if (phoneCookie?.value) {
          try {
            const { getPhoneSession } = await import("@/lib/auth-store");
            const sess = getPhoneSession(phoneCookie.value);
            if (sess?.profile?.id && isValidUUID(sess.profile.id)) {
              brokerId = sess.profile.id;
            } else if (sess?.profile?.slug || sess?.profile?.phone_number) {
              const query = supabase.from("profiles").select("id");
              if (sess.profile.slug) {
                const { data: p } = await query.eq("slug", sess.profile.slug).maybeSingle();
                if (p?.id && isValidUUID(p.id)) brokerId = p.id;
              }
            }
          } catch {}
        }
      }

      // Fallback: pick the first available profile in public.profiles
      if (!brokerId) {
        const { data: prof } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
        if (prof?.id && isValidUUID(prof.id)) {
          brokerId = prof.id;
        }
      }

      if (!brokerId) {
        return NextResponse.json(
          { error: "No broker profile found in database. Please sign up or log in first." },
          { status: 400 }
        );
      }

      const listingPayload = {
        broker_id: brokerId,
        title: listing.title,
        slug: listing.slug,
        description: listing.description || "",
        property_type: listing.property_type || "Apartment",
        listing_type: listing.listing_type || "Sale",
        bhk: typeof listing.bhk === "number" ? listing.bhk : null,
        bedrooms: typeof listing.bedrooms === "number" ? listing.bedrooms : (typeof listing.bhk === "number" ? listing.bhk : null),
        bathrooms: typeof listing.bathrooms === "number" ? listing.bathrooms : null,
        carpet_area_sqft: typeof listing.carpet_area_sqft === "number" ? listing.carpet_area_sqft : null,
        price_amount: typeof listing.price_amount === "number" && !isNaN(listing.price_amount) ? listing.price_amount : 0,
        display_price: listing.display_price || "Price on Request",
        currency: listing.currency || "INR",
        location_city: listing.location_city || "Ahmedabad",
        location_locality: listing.location_locality || "City",
        address: listing.address || null,
        amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
        ai_highlights: Array.isArray(listing.ai_highlights) ? listing.ai_highlights : [],
        ai_neighborhood_highlights: Array.isArray(listing.ai_neighborhood_highlights) ? listing.ai_neighborhood_highlights : [],
        status: listing.status || "active",
        updated_at: new Date().toISOString(),
      };

      // 2. Check if a listing with this slug already exists
      const { data: existing } = await supabase
        .from("listings")
        .select("id")
        .eq("slug", listing.slug)
        .maybeSingle();

      let savedListingId: string;

      if (existing?.id) {
        savedListingId = existing.id;
        const { error: updateErr } = await supabase
          .from("listings")
          .update(listingPayload)
          .eq("id", savedListingId);

        if (updateErr) {
          console.error("Supabase listing update error:", updateErr);
          return NextResponse.json(
            { error: `Database update failed: ${updateErr.message}` },
            { status: 400 }
          );
        }
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from("listings")
          .insert([listingPayload])
          .select("id")
          .single();

        if (insertErr) {
          console.error("Supabase listing insert error:", insertErr);
          return NextResponse.json(
            { error: `Database insert failed: ${insertErr.message}` },
            { status: 400 }
          );
        }
        savedListingId = inserted.id;
      }

      // 3. Save listing photos if provided
      if (listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0 && savedListingId) {
        try {
          await supabase.from("listing_photos").delete().eq("listing_id", savedListingId);
          const photoRows = listing.photos.map((p: any, idx: number) => ({
            listing_id: savedListingId,
            photo_url: typeof p === "string" ? p : p.photo_url,
            display_order: idx + 1,
            is_cover: idx === 0,
          }));
          await supabase.from("listing_photos").insert(photoRows);
        } catch (photoErr) {
          console.warn("Listing photos sync notice:", photoErr);
        }
      }
    }

    return NextResponse.json({ success: true, slug: listing.slug });
  } catch (err: any) {
    console.error("Save listing API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
