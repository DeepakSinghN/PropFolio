import { NextRequest, NextResponse } from "next/server";
import { deleteListingFromDisk, updateListingStatusOnDisk } from "@/lib/server-store";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, action, status } = body;

    if (!slug) {
      return NextResponse.json({ success: false, error: "Missing listing slug" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (action === "delete") {
      let supaDeleted = false;
      if (supabase) {
        try {
          // 1. Find listing by slug
          const { data: listings } = await supabase
            .from("listings")
            .select("id")
            .eq("slug", slug);

          if (listings && listings.length > 0) {
            const ids = listings.map((l: any) => l.id);
            // 2. Delete child listing photos
            await supabase.from("listing_photos").delete().in("listing_id", ids);
            // 3. Delete listing records
            const { error: delErr } = await supabase.from("listings").delete().in("id", ids);
            if (!delErr) supaDeleted = true;
          } else {
            // Direct delete by slug if ID lookup didn't match
            const { error: delErr } = await supabase.from("listings").delete().eq("slug", slug);
            if (!delErr) supaDeleted = true;
          }
        } catch (supaErr) {
          console.warn("Supabase delete listing error:", supaErr);
        }
      }

      // Also remove from disk cache / in-memory store
      const diskDeleted = deleteListingFromDisk(slug);

      return NextResponse.json({
        success: true,
        action: "delete",
        supaDeleted,
        diskDeleted,
      });
    }

    if (action === "status") {
      if (!status || !["active", "sold", "draft"].includes(status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }

      if (supabase) {
        try {
          await supabase
            .from("listings")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("slug", slug);
        } catch (supaErr) {
          console.warn("Supabase status update error:", supaErr);
        }
      }

      const updated = updateListingStatusOnDisk(slug, status);
      return NextResponse.json({ success: true, action: "status", listing: updated });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
