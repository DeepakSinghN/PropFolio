import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { slugifyName } from "@/lib/auth-store";
import { getUserFromSession } from "@/lib/session";

const RESERVED_SLUGS = new Set([
  "www",
  "api",
  "dashboard",
  "login",
  "signup",
  "pricing",
  "contact",
  "privacy",
  "terms",
  "refund",
  "admin",
  "app",
  "propfolio",
  "propertysnaps",
  "status",
  "help",
  "support",
  "static",
  "public",
  "assets",
]);

export async function GET(req: NextRequest) {
  try {
    const rawSlug = req.nextUrl.searchParams.get("slug") || "";
    const cleanSlug = slugifyName(rawSlug);

    if (!cleanSlug || cleanSlug.length < 3) {
      return NextResponse.json({
        available: false,
        slug: cleanSlug,
        reason: "Subdomain must be at least 3 characters",
      });
    }

    if (RESERVED_SLUGS.has(cleanSlug)) {
      return NextResponse.json({
        available: false,
        slug: cleanSlug,
        reason: "This subdomain is reserved for platform use",
      });
    }

    // Check if current logged-in user already owns this slug
    const currentUser = await getUserFromSession(req);
    if (currentUser?.slug && currentUser.slug.toLowerCase() === cleanSlug.toLowerCase()) {
      return NextResponse.json({
        available: true,
        slug: cleanSlug,
        isCurrent: true,
      });
    }

    // Check Supabase for existing slug
    const supabase = createAdminClient();
    if (supabase) {
      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, slug")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (data) {
        if (currentUser && (data.id === currentUser.id || data.user_id === currentUser.id)) {
          return NextResponse.json({
            available: true,
            slug: cleanSlug,
            isCurrent: true,
          });
        }

        const suggestions = [
          `${cleanSlug}-realty`,
          `${cleanSlug}-properties`,
          `${cleanSlug}-estates`,
        ];

        return NextResponse.json({
          available: false,
          slug: cleanSlug,
          reason: `'${cleanSlug}' is already taken`,
          suggestions,
        });
      }
    }

    return NextResponse.json({
      available: true,
      slug: cleanSlug,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

