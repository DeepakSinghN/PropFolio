import { NextRequest, NextResponse } from "next/server";
import { getListingFromDisk } from "@/lib/server-store";
import { INITIAL_LISTINGS } from "@/lib/store";

export const dynamic = "force-dynamic";

const FALLBACK_PHOTO_URL =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&auto=format&fit=crop&q=80";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const listing =
      getListingFromDisk(slug) ||
      INITIAL_LISTINGS.find((l) => l.slug === slug);

    if (!listing || !listing.photos || listing.photos.length === 0) {
      return NextResponse.redirect(FALLBACK_PHOTO_URL, 307);
    }

    const rawPhoto = listing.photos[0]?.photo_url;
    if (!rawPhoto) {
      return NextResponse.redirect(FALLBACK_PHOTO_URL, 307);
    }

    // 1. If base64 data URI, decode and return binary image with correct headers
    if (rawPhoto.startsWith("data:image/")) {
      const commaIdx = rawPhoto.indexOf(",");
      if (commaIdx !== -1) {
        const meta = rawPhoto.slice(0, commaIdx);
        const base64Data = rawPhoto.slice(commaIdx + 1);
        const mimeType = meta.split(";")[0]?.replace("data:", "") || "image/jpeg";
        const buffer = Buffer.from(base64Data, "base64");

        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Content-Length": String(buffer.length),
            "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
          },
        });
      }
    }

    // 2. If already an HTTP/HTTPS URL (e.g. Unsplash or Cloudinary)
    if (rawPhoto.startsWith("http://") || rawPhoto.startsWith("https://")) {
      return NextResponse.redirect(rawPhoto, 307);
    }

    // 3. Fallback
    return NextResponse.redirect(FALLBACK_PHOTO_URL, 307);
  } catch (err) {
    console.error("Cover image endpoint error:", err);
    return NextResponse.redirect(FALLBACK_PHOTO_URL, 307);
  }
}
