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

export interface SendOtpTemplateOptions {
  to: string;
  code: string;
  templateName?: string;
}

/**
 * Sends approved Meta Authentication OTP template (e.g. propertysnaps_otp)
 * with automatic button parameter support and fallback to text message.
 */
export async function sendWhatsAppOtpTemplate({
  to,
  code,
  templateName = "propertysnaps_otp",
}: SendOtpTemplateOptions) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("WhatsApp credentials not configured in environment. Template not sent:", { to, code });
    return { success: false, reason: "Credentials not set" };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  // Candidate payload structures for Meta Authentication templates (with & without button params, en & en_US)
  const candidatePayloads = [
    // 1. English with Copy Code button (URL sub_type index 0)
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: code }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: code }],
          },
        ],
      },
    },
    // 2. English US with Copy Code button
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: code }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: code }],
          },
        ],
      },
    },
    // 3. English body parameter only
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: code }],
          },
        ],
      },
    },
    // 4. English US body parameter only
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: code }],
          },
        ],
      },
    },
  ];

  for (let i = 0; i < candidatePayloads.length; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidatePayloads[i]),
      });

      const data = await response.json();
      if (response.ok && data?.messages?.length > 0) {
        console.log(`[WhatsApp Template] Successfully sent template '${templateName}' to ${to}:`, data);
        return { success: true, data, mode: "template" };
      }

      console.warn(`[WhatsApp Template] Attempt ${i + 1} rejected by Meta:`, data?.error?.message || data);

      if (data?.error?.code === 190) {
        console.error("[WhatsApp] Access token has expired or is invalid. Please refresh token in Meta Console / Vercel.");
        return { success: false, error: data?.error?.message, tokenExpired: true };
      }
    } catch (err: any) {
      console.warn(`[WhatsApp Template] Attempt ${i + 1} network error:`, err.message);
    }
  }

  // Fallback to standard text message if template delivery was not accepted
  console.log(`[WhatsApp Template] Falling back to standard text message for ${to}...`);
  return sendWhatsAppMessage({
    to,
    text: `🔐 *Property Snaps Login Verification*\n\nAapka login verification code hai: *${code}*\n\nYeh code agle 10 minute ke liye valid hai. Apne dashboard me login karne ke liye isse enter karein.`,
  });
}

/**
 * Downloads media from Meta WhatsApp Cloud API and uploads to Supabase Storage CDN.
 * Returns the public CDN URL, or null if download/upload fails (never injects fake fallback images).
 */
export async function downloadMetaMedia(mediaId: string, _fallbackIndex: number = 0): Promise<string | null> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!accessToken || !mediaId) {
    console.warn("WhatsApp access token or mediaId missing");
    return null;
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
      return null;
    }

    const mediaData = await metaRes.json();
    console.log("[Media Download] Meta media info:", mediaData);

    const downloadUrl = mediaData.url;
    if (!downloadUrl) {
      console.warn("No download URL returned by Meta for media", mediaId);
      return null;
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
      return null;
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let ext = "jpg";
    if (mediaData.mime_type?.includes("png")) ext = "png";
    else if (mediaData.mime_type?.includes("webp")) ext = "webp";
    else if (mediaData.mime_type?.includes("jpeg") || mediaData.mime_type?.includes("jpg")) ext = "jpg";

    const fileName = `wa-${mediaId}-${Date.now()}.${ext}`;
    const mimeType = mediaData.mime_type || `image/${ext === "jpg" ? "jpeg" : ext}`;

    // 3. Upload directly to Supabase Storage CDN (works on Vercel read-only filesystem)
    const supaUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const supaKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ""
    ).trim();

    if (supaUrl && supaKey && !supaKey.includes("...")) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supaUrl, supaKey);

        // Ensure bucket exists (ignore error if already exists)
        await supabase.storage
          .createBucket("listing-photos", { public: true })
          .catch(() => {});

        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: pubData } = supabase.storage
            .from("listing-photos")
            .getPublicUrl(fileName);
          if (pubData?.publicUrl) {
            console.log(`[Media Download] Uploaded to Supabase CDN: ${pubData.publicUrl}`);
            return pubData.publicUrl;
          }
        } else {
          console.warn("[Media Download] Supabase upload warning:", uploadError.message);
        }
      } catch (supaErr: any) {
        console.warn("[Media Download] Supabase storage fallback:", supaErr?.message);
      }
    }

    // 4. Local filesystem fallback (dev only; Vercel public/ is read-only)
    if (!process.env.VERCEL) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      console.log(`[Media Download] Saved locally ${filePath} (${buffer.length} bytes)`);
      return `/uploads/${fileName}`;
    }

    return null;
  } catch (err: any) {
    console.error("Error downloading Meta media:", err.message);
    return null;
  }
}


