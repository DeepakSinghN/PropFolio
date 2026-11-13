import fs from "fs";
import path from "path";

/**
 * Meta WhatsApp Cloud API Helper
 */

interface SendTextMessageOptions {
  to: string; // e.g. "919876543210"
  text: string;
}

export const REAL_ESTATE_FALLBACKS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1400&auto=format&fit=crop&q=80",
];

export async function sendWhatsAppMessage({ to, text }: SendTextMessageOptions) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("WhatsApp credentials not configured in .env.local. Message not sent:", { to, text });
    return { success: false, reason: "Credentials not set" };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { preview_url: true, body: text },
      }),
    });

    const data = await response.json();
    console.log("Meta Graph API response:", JSON.stringify(data));
    return { success: response.ok, data };
  } catch (err: any) {
    console.error("Failed to send WhatsApp message:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Downloads media from Meta WhatsApp Cloud API and stores it in public/uploads/
 * Returns the local URL path (/uploads/${filename})
 */
export async function downloadMetaMedia(mediaId: string, fallbackIndex: number = 0): Promise<string> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  // Compute safe distinct fallback index from mediaId if needed
  let photoPickIdx = fallbackIndex;
  if (mediaId) {
    let hash = 0;
    for (let i = 0; i < mediaId.length; i++) hash = (hash * 31 + mediaId.charCodeAt(i)) >>> 0;
    photoPickIdx = (hash + fallbackIndex) % REAL_ESTATE_FALLBACKS.length;
  }

  if (!accessToken || !mediaId) {
    console.warn("WhatsApp access token or mediaId missing, using fallback photo");
    return REAL_ESTATE_FALLBACKS[photoPickIdx];
  }

  try {
    // 1. Get media URL from Meta Graph API
    console.log(`[Media Download] Fetching Meta media details for id: ${mediaId}...`);
    const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!metaRes.ok) {
      const errText = await metaRes.text();
      console.error(`Meta media retrieval failed (${metaRes.status}):`, errText);
      return REAL_ESTATE_FALLBACKS[photoPickIdx];
    }

    const mediaData = await metaRes.json();
    console.log("[Media Download] Meta media info:", mediaData);

    const downloadUrl = mediaData.url;
    if (!downloadUrl) {
      console.warn("No download URL returned by Meta for media", mediaId);
      return REAL_ESTATE_FALLBACKS[photoPickIdx];
    }

    // 2. Download the binary media from Meta CDN (requires User-Agent & Auth)
    const fileRes = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!fileRes.ok) {
      console.error(`Failed to download binary media (${fileRes.status})`);
      return REAL_ESTATE_FALLBACKS[photoPickIdx];
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let ext = "jpg";
    if (mediaData.mime_type?.includes("png")) ext = "png";
    else if (mediaData.mime_type?.includes("webp")) ext = "webp";
    else if (mediaData.mime_type?.includes("jpeg") || mediaData.mime_type?.includes("jpg")) ext = "jpg";

    const fileName = `${mediaId}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    console.log(`[Media Download] Successfully saved ${filePath} (${buffer.length} bytes)`);
    return `/uploads/${fileName}`;
  } catch (err: any) {
    console.error("Error downloading Meta media:", err.message);
    return REAL_ESTATE_FALLBACKS[photoPickIdx];
  }
}


