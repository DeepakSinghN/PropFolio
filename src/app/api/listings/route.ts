import { NextRequest, NextResponse } from "next/server";
import { getAllListingsFromDisk } from "@/lib/server-store";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function GET(req: NextRequest) {
  try {
    const map = new Map<string, any>();
    const supabase = createAdminClient();

    // 1. Query parameters
    const brokerIdParam = req.nextUrl.searchParams.get("broker_id");
    const brokerSlugParam = req.nextUrl.searchParams.get("broker_slug");
    const scopeParam = req.nextUrl.searchParams.get("scope"); // "all" for global public feed

    // 2. Identify logged-in broker from session cookie
    let sessionBrokerId: string | null = null;

    const phoneCookie = req.cookies.get("propfolio-phone-session");
    if (phoneCookie?.value) {
      try {
        const { getPhoneSession } = await import("@/lib/auth-store");
        const sess = getPhoneSession(phoneCookie.value);
        if (sess?.profile) {
          if (isValidUUID(sess.profile.id)) {
            sessionBrokerId = sess.profile.id;
          } else if (supabase && (sess.profile.slug || sess.profile.email || sess.profile.phone_number)) {
            if (sess.profile.slug) {
              const { data: p } = await supabase
                .from("profiles")
                .select("id")
                .eq("slug", sess.profile.slug)
                .maybeSingle();
              if (p?.id && isValidUUID(p.id)) sessionBrokerId = p.id;
            }
            if (!sessionBrokerId && sess.profile.email) {
              const emailPrefix = sess.profile.email.split("@")[0];
              const { data: p } = await supabase
                .from("profiles")
                .select("id")
                .ilike("slug", `%${emailPrefix}%`)
                .limit(1)
                .maybeSingle();
              if (p?.id && isValidUUID(p.id)) sessionBrokerId = p.id;
            }
          }
        }
      } catch {}
    }

    // Determine target broker to filter by (explicit query param takes priority over session)
    let filterBrokerId = (brokerIdParam && isValidUUID(brokerIdParam)) ? brokerIdParam : sessionBrokerId;

    if (supabase) {
      try {
        let query = supabase.from("listings").select("*, listing_photos(*)");

        // If filtering by a specific broker slug
        if (brokerSlugParam && !filterBrokerId) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("id")
            .eq("slug", brokerSlugParam)
            .maybeSingle();
          if (prof?.id) {
            filterBrokerId = prof.id;
          }
        }

        // Apply broker filter unless explicitly requested scope="all"
        if (filterBrokerId && scopeParam !== "all") {
          query = query.eq("broker_id", filterBrokerId);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) {
          console.warn("Supabase fetch listings error:", error);
        } else if (data && Array.isArray(data)) {
          data.forEach((l: any) => {
            const photos = (l.listing_photos || []).sort(
              (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
            );
            map.set(l.slug, {
              ...l,
              photos: photos.length > 0 ? photos : l.photos || [],
            });
          });
        }
      } catch (e) {
        console.warn("Supabase fetch listings exception:", e);
      }
    }

    // If an authenticated broker or specific broker requested their portfolio:
    if (filterBrokerId || brokerSlugParam) {
      return NextResponse.json({ listings: Array.from(map.values()) });
    }

    // Global / unauthenticated explore feed:
    if (map.size === 0) {
      const diskListings = getAllListingsFromDisk();
      diskListings.forEach((l) => map.set(l.slug, l));
    }

    return NextResponse.json({ listings: Array.from(map.values()) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
