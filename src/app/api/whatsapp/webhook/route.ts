import { NextRequest, NextResponse } from "next/server";
import { parsePropertyNotes } from "@/lib/ai";
import { sendWhatsAppMessage, downloadMetaMedia } from "@/lib/whatsapp";
import { saveListingToMemory, DEMO_BROKER } from "@/lib/store";
import {
  saveListingToDisk,
  appendUserSession,
  getUserSession,
  clearUserSession,
  markSessionAcknowledged,
} from "@/lib/server-store";

/**
 * Meta WhatsApp Cloud API Webhook
 *
 * Minimal & Clean Flow:
 * 1. User sends first input (text or photo) -> Bot replies ONCE(keep it short):
 *    "Aap details/photos bhejte rahiye. Jab info poori ho jaye, toh bas 'Done' likh dena."
 * 2. As long as user doesn't write 'Done' or "done", bot is 100% silent and just collects info/photos.
 * 3. When user writes 'Done', bot creates the preview website & PDF brochure and replies!
 */

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "propfolio_secret_token_123";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp Webhook verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value || body.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: "acknowledged" });
    }

    const from = message.from;
    const messageType = message.type;
    const session = getUserSession(from);

    let incomingText = "";
    let incomingPhotoUrl = "";

    if (messageType === "text") {
      incomingText = message.text?.body || "";
    } else if (messageType === "image") {
      incomingText = message.image?.caption || "";
      const mediaId = message.image?.id;
      const currentPhotoIndex = session?.photos?.length || 0;
      console.log(`Processing incoming photo from ${from} (mediaId: ${mediaId}, index: ${currentPhotoIndex})`);
      incomingPhotoUrl = await downloadMetaMedia(mediaId, currentPhotoIndex);
    }

    const trimmed = incomingText.trim().toLowerCase();
    const isDone = /^(done|ho gaya|khatam|banao|ready|create|ok done)$/i.test(trimmed);

    // CASE 1: User says "Done" -> Generate listing preview immediately!
    if (isDone) {
      const hasContent = session && (session.notes.length > 0 || session.photos.length > 0);
      if (!hasContent) {
        await sendWhatsAppMessage({
          to: from,
          text: `⚠️ Aapne abhi tak koi property details ya photos nahi bheji hain.\n\nKripya pehle details bhejein, aur sab complete hone ke baad *Done* likhein!`,
        });
        return NextResponse.json({ status: "awaiting_notes" });
      }

      // Generate preview directly with all collected info & photos
      const hasPhotos = session.photos && session.photos.length > 0;
      return await executeCreateListing(req, from, session, hasPhotos);
    }

    // CASE 2: User is sending info/photos
    const wasAcknowledged = Boolean(session?.hasAcknowledged);

    // Append incoming data quietly to session
    appendUserSession(
      from,
      incomingText.trim() ? incomingText.trim() : undefined,
      incomingPhotoUrl || undefined
    );

    // If this is the user's FIRST data in the session -> Send ONLY 1 friendly guide message!
    if (!wasAcknowledged) {
      markSessionAcknowledged(from);

      await sendWhatsAppMessage({
        to: from,
        text: `👍 *Property details receive hona start ho gayi hain!*\n\nAap apni property ki baaki saari details aur photos bhejte rahiye. Jab sab info poori ho jaye, toh bas *Done* likh dena!`,
      });

      return NextResponse.json({ status: "first_acknowledged" });
    }

    // For any subsequent message (2nd, 3rd, photos, etc.) -> ZERO spam, 100% silent collection!
    console.log(`[Silent Collector] Collected ${messageType} from ${from} without replying.`);
    return NextResponse.json({ status: "silently_collected" });
  } catch (err: any) {
    console.error("WhatsApp Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Helper to execute final AI listing generation & WhatsApp reply
 */
async function executeCreateListing(
  req: NextRequest,
  from: string,
  session: any,
  includePhotos: boolean
) {
  const combinedNotes = session.notes.join("\n\n");
  console.log(`Executing listing for ${from} (includePhotos: ${includePhotos}):`, combinedNotes);

  await sendWhatsAppMessage({
    to: from,
    text: `⏳ *Samajh gaya!* AI aapki property details analyze karke website aur brochure generate kar raha hai...`,
  });

  // Call Groq AI
  const parsedData = await parsePropertyNotes(combinedNotes);

  const photosList = includePhotos && session.photos && session.photos.length > 0
    ? session.photos.map((url: string, i: number) => ({
      id: `p-${i}`,
      listing_id: "listing-wa-" + Date.now(),
      photo_url: url,
      display_order: i + 1,
      is_cover: i === 0,
      created_at: new Date().toISOString(),
    }))
    : [];

  const fullListing = {
    id: "listing-wa-" + Date.now(),
    broker_id: DEMO_BROKER.id,
    title: parsedData.title,
    slug: parsedData.slug,
    description: parsedData.description,
    property_type: parsedData.property_type,
    listing_type: parsedData.listing_type,
    bhk: parsedData.bhk,
    bedrooms: parsedData.bedrooms,
    bathrooms: parsedData.bathrooms,
    carpet_area_sqft: parsedData.carpet_area_sqft,
    price_amount: parsedData.price_amount,
    display_price: parsedData.display_price,
    currency: parsedData.currency,
    location_city: parsedData.location_city,
    location_locality: parsedData.location_locality,
    amenities: parsedData.amenities,
    ai_highlights: parsedData.ai_highlights,
    ai_neighborhood_highlights: parsedData.ai_neighborhood_highlights,
    status: "active" as const,
    views_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    photos: photosList,
    broker: DEMO_BROKER,
  };

  saveListingToMemory(fullListing);
  saveListingToDisk(fullListing);

  clearUserSession(from);

  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const liveUrl = `${proto}://${host}/${DEMO_BROKER.slug}/${parsedData.slug}`;
  const brochureUrl = `${liveUrl}/brochure`;

  const photoNotice = includePhotos
    ? `📸 ${photosList.length} photos included`
    : `ℹ️ Listing created without photos`;

  const dashboardUrl = `${proto}://${host}/dashboard`;

  const replyText = `🎉 *Aapki Property Website Taiyar Hai!*\n\n📍 *${parsedData.title}*\n💰 *Keemat:* ${parsedData.display_price}\n${photoNotice}\n\n👉 *Live Listing Link:* ${liveUrl}\n📄 *PDF Brochure Link:* ${brochureUrl}\n\n📊 *Apna Broker Dashboard:* ${dashboardUrl}\n\nIs link ko apne buyers aur WhatsApp groups me share karein!`;

  await sendWhatsAppMessage({
    to: from,
    text: replyText,
  });

  return NextResponse.json({ status: "success", listingSlug: parsedData.slug });
}
