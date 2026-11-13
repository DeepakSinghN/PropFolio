import { NextRequest, NextResponse } from "next/server";
import { deleteListingFromDisk, updateListingStatusOnDisk } from "@/lib/server-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, action, status } = body;

    if (!slug) {
      return NextResponse.json({ success: false, error: "Missing listing slug" }, { status: 400 });
    }

    if (action === "delete") {
      const deleted = deleteListingFromDisk(slug);
      return NextResponse.json({ success: true, action: "delete", deleted });
    }

    if (action === "status") {
      if (!status || !["active", "sold", "draft"].includes(status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }
      const updated = updateListingStatusOnDisk(slug, status);
      return NextResponse.json({ success: true, action: "status", listing: updated });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

