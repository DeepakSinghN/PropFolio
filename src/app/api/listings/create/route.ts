import { NextRequest, NextResponse } from "next/server";
import { saveListingToMemory } from "@/lib/store";
import { saveListingToDisk } from "@/lib/server-store";
import { createAdminClient } from "@/lib/supabase/server";
import { Listing } from "@/types/database";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/rate-limit";

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

async function ensureStorageBucket(supabase: any) {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b: any) => b.name === "listing-photos");
    if (!exists) {
      await supabase.storage.createBucket("listing-photos", { public: true });
    }
  } catch {}
}

async function uploadBase64ToStorage(
  supabase: any,
  rawUrl: string,
  listingSlug: string,
  idx: number
): Promise<string> {
  if (!rawUrl || !rawUrl.startsWith("data:image/")) {
    return rawUrl;
  }

  try {
    const matches = rawUrl.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/);
    if (!matches) return rawUrl;

    const mime = matches[1];
    const ext = mime.split("/")[1] || "jpeg";
    const buffer = Buffer.from(matches[2], "base64");
    const filePath = `${listingSlug}/photo-${idx}-${Date.now()}.${ext === "jpeg" ? "jpg" : ext}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-photos")
      .upload(filePath, buffer, {
        contentType: mime,
        upsert: true,
      });

    if (uploadError) {
      console.warn("Storage upload failed, keeping fallback:", uploadError.message);
      return rawUrl;
    }

    const { data } = supabase.storage
      .from("listing-photos")
      .getPublicUrl(filePath);

    return data?.publicUrl || rawUrl;
  } catch (e) {
    console.warn("Storage upload exception:", e);
    return rawUrl;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Rate limit: max 5 listing creations per 60 seconds per IP
    const rateCheck = checkRateLimit(`create_listing:${ip}`, 5, 60);
    if (!rateCheck.success) {
      return createRateLimitResponse(
        `Listing creation rate limit reached. Please wait ${rateCheck.retryAfterSec} seconds before creating another listing.`,
        rateCheck.retryAfterSec
      );
    }

    const listing: Listing = await req.json();

    if (!listing || !listing.slug || !listing.title) {
      return NextResponse.json({ error: "Missing required listing fields: title or slug" }, { status: 400 });
    }

    saveListingToMemory(listing);
    saveListingToDisk(listing);

    const supabase = createAdminClient();

    if (supabase) {
      // 1. Resolve logged-in broker from session cookie (HIGHEST PRIORITY)
      let brokerId: string | null = null;
      let sessionProfile: any = null;

      const phoneCookie = req.cookies.get("propfolio-phone-session");
      if (phoneCookie?.value) {
        try {
          const { getPhoneSession } = await import("@/lib/auth-store");
          const sess = getPhoneSession(phoneCookie.value);
          if (sess?.profile) {
            sessionProfile = sess.profile;
            if (isValidUUID(sess.profile.id)) {
              brokerId = sess.profile.id;
            }
          }
        } catch {}
      }

      // If brokerId is not a UUID yet, lookup profile in Supabase using session details
      if (!brokerId && sessionProfile) {
        if (sessionProfile.user_id && isValidUUID(sessionProfile.user_id)) {
          const { data: p } = await supabase
            .from("profiles")
            .select("id")
            .or(`id.eq.${sessionProfile.user_id},user_id.eq.${sessionProfile.user_id}`)
            .maybeSingle();
          if (p?.id && isValidUUID(p.id)) brokerId = p.id;
        }

        if (!brokerId && sessionProfile.slug) {
          const { data: p } = await supabase
            .from("profiles")
            .select("id")
            .eq("slug", sessionProfile.slug)
            .maybeSingle();
          if (p?.id && isValidUUID(p.id)) brokerId = p.id;
        }

        if (!brokerId && sessionProfile.email) {
          const emailPrefix = sessionProfile.email.split("@")[0];
          const { data: p } = await supabase
            .from("profiles")
            .select("id")
            .ilike("slug", `%${emailPrefix}%`)
            .limit(1)
            .maybeSingle();
          if (p?.id && isValidUUID(p.id)) brokerId = p.id;
        }

        if (!brokerId && sessionProfile.phone_number) {
          const rawPhone = sessionProfile.phone_number.replace(/[^0-9]/g, "");
          const { data: p } = await supabase
            .from("profiles")
            .select("id")
            .ilike("phone_number", `%${rawPhone.slice(-10)}%`)
            .limit(1)
            .maybeSingle();
          if (p?.id && isValidUUID(p.id)) brokerId = p.id;
        }
      }

      // Fallback to listing.broker_id only if valid UUID
      if (!brokerId && isValidUUID(listing.broker_id)) {
        brokerId = listing.broker_id;
      }

      if (!brokerId) {
        return NextResponse.json(
          { error: "Could not identify your logged-in broker account. Please log in again." },
          { status: 401 }
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

      // 2. Check if a listing with this (broker_id, slug) or slug exists
      const { data: existing } = await supabase
        .from("listings")
        .select("id")
        .eq("broker_id", brokerId)
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

      // 3. Save listing photos: upload base64 to Storage CDN and save URLs
      if (listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0 && savedListingId) {
        try {
          await ensureStorageBucket(supabase);
          await supabase.from("listing_photos").delete().eq("listing_id", savedListingId);

          const photoRows = await Promise.all(
            listing.photos.map(async (p: any, idx: number) => {
              const rawPhotoUrl = typeof p === "string" ? p : p.photo_url;
              const cdnUrl = await uploadBase64ToStorage(supabase, rawPhotoUrl, listing.slug, idx);

              return {
                listing_id: savedListingId,
                photo_url: cdnUrl,
                display_order: idx + 1,
                is_cover: idx === 0,
              };
            })
          );

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
