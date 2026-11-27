import { NextRequest, NextResponse } from "next/server";
import { parsePropertyNotes } from "@/lib/ai";
import { sendWhatsAppMessage, downloadMetaMedia } from "@/lib/whatsapp";
import { saveListingToMemory } from "@/lib/store";
import { resolveOrCreateBrokerProfile, ensureProfileNotExpired } from "@/lib/auth-store";
import { getEffectivePlan } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/server";
import {
  saveListingToDisk,
  appendUserSession,
  getUserSession,
  clearUserSession,
  markSessionAcknowledged,
  setSessionMediaFailed,
  setSessionLang,
} from "@/lib/server-store";

type BotLang = "en" | "hinglish";

function detectMessageLang(text?: string): BotLang {
  if (!text || !text.trim()) return "en";
  // Devanagari script
  if (/[\u0900-\u097F]/.test(text)) return "hinglish";
  // Unambiguous Hinglish words
  const hinglishPattern =
    /\b(hai|hain|karo|banao|chahiye|milega|bechna|kiraye|keemat|bhejo|bhejiye|nahi|haan|ho gaya|khatam|bina|wala|wali|wale|mein|yahan|wahan|acchi|badhiya|suvidha|samajh|dukan|makan|ghar|kamra|manzil|floor pe)\b/i;
  return hinglishPattern.test(text) ? "hinglish" : "en";
}

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

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
    const contactName = value?.contacts?.[0]?.profile?.name?.trim() || "";
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
      const mediaResult = await downloadMetaMedia(mediaId, currentPhotoIndex);

      if (!mediaResult.url) {
        if (incomingText.trim()) {
          appendUserSession(from, incomingText.trim(), undefined, contactName || undefined);
        }
        const failLang: BotLang =
          session?.lang === "hinglish" || detectMessageLang(incomingText) === "hinglish"
            ? "hinglish"
            : "en";
        setSessionMediaFailed(from, true);
        setSessionLang(from, failLang);
        await sendWhatsAppMessage({
          to: from,
          text:
            failLang === "hinglish"
              ? `⚠️ Photo save nahi hui (${mediaResult.reason || "error"}).\n1️⃣ Dobara bhejein ya 2️⃣ *2* likh kar bina photo ke aage badhein.`
              : `⚠️ Photo couldn't be saved (${mediaResult.reason || "error"}).\n1️⃣ Resend photo or 2️⃣ reply *2* to skip photos.`,
        });
        return NextResponse.json({ status: "media_download_failed", reason: mediaResult.reason });
      }
      setSessionMediaFailed(from, false);
      incomingPhotoUrl = mediaResult.url;
    }

    const activeLang: BotLang =
      session?.lang === "hinglish" || detectMessageLang(incomingText) === "hinglish"
        ? "hinglish"
        : "en";

    const trimmed = incomingText.trim().toLowerCase();
    const isProceedWithoutPhotos = /^(2|proceed without photos|without photos|bina photo|bina photos|skip photos)$/i.test(trimmed);
    const isDone = isProceedWithoutPhotos || /^(done|ho gaya|khatam|banao|ready|create|ok done)$/i.test(trimmed);

    // CASE 1: User says "Done" or "Proceed without photos" -> Generate listing preview!
    if (isDone) {
      const hasContent = session && (session.notes.length > 0 || session.photos.length > 0);
      if (!hasContent) {
        await sendWhatsAppMessage({
          to: from,
          text:
            activeLang === "hinglish"
              ? `⚠️ Pehle property details/photos bhejein, fir *Done* likhein.`
              : `⚠️ Please send property details or photos first, then reply *Done*.`,
        });
        return NextResponse.json({ status: "awaiting_notes" });
      }

      // If a photo just failed and user sent "Done" before selecting an option, wait for their choice!
      if (session?.mediaFailed && !isProceedWithoutPhotos) {
        await sendWhatsAppMessage({
          to: from,
          text:
            activeLang === "hinglish"
              ? `⏸️ Pichli photo save nahi hui thi.\n1️⃣ Photo dobara bhejein ya 2️⃣ *2* likh kar bina photo ke aage badhein.`
              : `⏸️ Previous photo couldn't be saved.\n1️⃣ Resend photo or 2️⃣ reply *2* to skip photos.`,
        });
        return NextResponse.json({ status: "awaiting_media_choice" });
      }

      // Generate preview strictly using user's provided photos (unless user chose proceed without photos)
      const hasPhotos = !isProceedWithoutPhotos && Boolean(session.photos && session.photos.length > 0);
      return await executeCreateListing(req, from, session, hasPhotos, contactName, activeLang);
    }

    // CASE 2: User is sending info/photos
    const wasAcknowledged = Boolean(session?.hasAcknowledged);

    // Append incoming data quietly to session (preserving contact name & language)
    appendUserSession(
      from,
      incomingText.trim() ? incomingText.trim() : undefined,
      incomingPhotoUrl || undefined,
      contactName || undefined
    );
    setSessionLang(from, activeLang);

    // If this is the user's FIRST data in the session -> Send ONLY 1 friendly guide message!
    if (!wasAcknowledged) {
      markSessionAcknowledged(from);

      await sendWhatsAppMessage({
        to: from,
        text:
          activeLang === "hinglish"
            ? `👍 Details mil gayi! Baaki photos/notes bhejein, aur complete hone par *Done* likhein.`
            : `👍 Got it! Keep sending details & photos, and reply *Done* when finished.`,
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
  includePhotos: boolean,
  contactName?: string,
  lang: BotLang = "en"
) {
  const combinedNotes = session.notes.join("\n\n");
  console.log(`Executing listing for ${from} (includePhotos: ${includePhotos}, lang: ${lang}):`, combinedNotes);

  await sendWhatsAppMessage({
    to: from,
    text:
      lang === "hinglish"
        ? `⏳ Property page ban raha hai...`
        : `⏳ Creating your property page...`,
  });

  // Call Groq AI
  const parsedData = await parsePropertyNotes(combinedNotes);

  const listingUuid = crypto.randomUUID();
  const photosList = includePhotos && session.photos && session.photos.length > 0
    ? session.photos.map((url: string, i: number) => ({
      id: crypto.randomUUID(),
      listing_id: listingUuid,
      photo_url: url,
      display_order: i + 1,
      is_cover: i === 0,
      created_at: new Date().toISOString(),
    }))
    : [];

  // Resolve broker profile using real contact name & clean slug, and check plan expiry
  const rawSenderBroker = await resolveOrCreateBrokerProfile(from, session?.contactName || contactName);
  const senderBroker = await ensureProfileNotExpired(rawSenderBroker);
  const { plan: waPlan, effectiveCredits: waCredits } = getEffectivePlan(senderBroker);

  // Enforce active listing limit for WhatsApp bot
  const supaCheckUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaCheckKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!waPlan.isUnlimitedListings && supaCheckUrl && supaCheckKey && !supaCheckKey.includes("...")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supaCheck = createClient(supaCheckUrl, supaCheckKey);
      const { count: activeCount } = await supaCheck
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("broker_id", senderBroker.id)
        .neq("status", "sold");

      if ((activeCount ?? 0) >= waCredits) {
        clearUserSession(from);
        await sendWhatsAppMessage({
          to: from,
          text:
            lang === "hinglish"
              ? `⚠️ *Listing Limit Reached (${waPlan.name})*\n\nAapke plan ki ${waCredits} active listing${waCredits === 1 ? "" : "s"} ki limit poori ho chuki hai.\n\nNayi property publish karne ke liye apna plan upgrade karein:\n👉 https://www.propertysnaps.in/pricing`
              : `⚠️ *Listing Limit Reached (${waPlan.name})*\n\nYou have reached your plan limit of ${waCredits} active listing${waCredits === 1 ? "" : "s"}.\n\nUpgrade your plan to publish more properties:\n👉 https://www.propertysnaps.in/pricing`,
        });
        return NextResponse.json({ status: "plan_limit_reached" });
      }
    } catch {}
  }

  // Enforce photo limit per listing
  const cappedPhotos =
    !waPlan.isUnlimitedPhotos && photosList.length > waPlan.maxPhotosPerListing
      ? photosList.slice(0, waPlan.maxPhotosPerListing)
      : photosList;

  const fullListing = {
    id: listingUuid,
    broker_id: senderBroker.id,
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
    photos: cappedPhotos,
    broker: senderBroker,
  };

  saveListingToMemory(fullListing);
  saveListingToDisk(fullListing);

  // Sync listing to Supabase if configured
  const supabase = createAdminClient();
  let dbSaved = false;
  let dbErrorMsg = "";

  if (supabase) {
    try {
      if (!isValidUUID(senderBroker.id)) {
        dbErrorMsg = `Broker profile ID is not a valid UUID (${senderBroker.id}).`;
        console.error("[webhook]", dbErrorMsg);
      } else {
        const { error: upsertErr } = await supabase.from("listings").upsert({
          id: fullListing.id,
          broker_id: senderBroker.id,
          title: fullListing.title,
          slug: fullListing.slug,
          description: fullListing.description,
          property_type: fullListing.property_type,
          listing_type: fullListing.listing_type,
          bhk: fullListing.bhk,
          bedrooms: fullListing.bedrooms,
          bathrooms: fullListing.bathrooms,
          carpet_area_sqft: fullListing.carpet_area_sqft,
          price_amount: fullListing.price_amount,
          display_price: fullListing.display_price,
          currency: fullListing.currency,
          location_city: fullListing.location_city,
          location_locality: fullListing.location_locality,
          amenities: fullListing.amenities,
          ai_highlights: fullListing.ai_highlights,
          ai_neighborhood_highlights: fullListing.ai_neighborhood_highlights,
          status: "active",
          views_count: 1,
          created_at: fullListing.created_at,
          updated_at: fullListing.updated_at,
        });

        if (upsertErr) {
          dbErrorMsg = upsertErr.message;
          console.error("[webhook] Supabase listing upsert error:", upsertErr);
        } else {
          dbSaved = true;
          if (cappedPhotos.length > 0) {
            const { error: photoErr } = await supabase.from("listing_photos").insert(
              cappedPhotos.map((p: any) => ({
                listing_id: fullListing.id,
                photo_url: p.photo_url,
                display_order: p.display_order,
                is_cover: p.is_cover,
              }))
            );
            if (photoErr) {
              console.error("[webhook] Supabase listing_photos insert error:", photoErr);
            }
          }
        }
      }
    } catch (dbErr: any) {
      dbErrorMsg = dbErr?.message || "Unknown DB error";
      console.warn("[webhook] Supabase listing sync notice:", dbErr);
    }
  }

  clearUserSession(from);

  if (supabase && !dbSaved) {
    await sendWhatsAppMessage({
      to: from,
      text:
        lang === "hinglish"
          ? `⚠️ *Listing database me save nahi ho payi.*\n\nReason: ${dbErrorMsg || "Database sync failed"}\n\nKripya thodi der baad dobara try karein ya dashboard se create karein:\n👉 https://www.propertysnaps.in/dashboard/listings/new`
          : `⚠️ *Could not save listing to database.*\n\nReason: ${dbErrorMsg || "Database sync failed"}\n\nPlease try again shortly or create from your dashboard:\n👉 https://www.propertysnaps.in/dashboard/listings/new`,
    });
    return NextResponse.json({ status: "db_error", error: dbErrorMsg }, { status: 200 });
  }

  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const isLocal = host.includes("localhost");
  const liveUrl = isLocal
    ? `http://${senderBroker.slug}.localhost:3000/l/${parsedData.slug}`
    : `https://${senderBroker.slug}.propertysnaps.in/l/${parsedData.slug}`;
  const brochureUrl = `${liveUrl}/brochure`;

  const photoNotice = includePhotos
    ? `📸 ${cappedPhotos.length} ${cappedPhotos.length === 1 ? "photo" : "photos"} included`
    : lang === "hinglish"
      ? `ℹ️ Listing bina photos ke banayi gayi hai`
      : `ℹ️ Listing created without photos`;

  const dashboardUrl = isLocal
    ? `http://localhost:3000/dashboard`
    : `https://www.propertysnaps.in/dashboard`;

  const replyText =
    lang === "hinglish"
      ? `🎉 *Aapki Property Website Taiyar Hai!*\n\n📍 *${parsedData.title}*\n💰 *Keemat:* ${parsedData.display_price}\n${photoNotice}\n\n👉 *Live Listing Link:* ${liveUrl}\n📄 *PDF Brochure Link:* ${brochureUrl}\n\n📊 *Apna Broker Dashboard:* ${dashboardUrl}\n\nIs link ko apne buyers aur WhatsApp groups me share karein!`
      : `🎉 *Your Property Page is Ready!*\n\n📍 *${parsedData.title}*\n💰 *Price:* ${parsedData.display_price}\n${photoNotice}\n\n👉 *Live Listing Link:* ${liveUrl}\n📄 *PDF Brochure Link:* ${brochureUrl}\n\n📊 *Your Broker Dashboard:* ${dashboardUrl}\n\nShare this link with your buyers and WhatsApp groups!`;

  await sendWhatsAppMessage({
    to: from,
    text: replyText,
  });

  return NextResponse.json({ status: "success", listingSlug: parsedData.slug });
}
