import { NextRequest, NextResponse } from "next/server";
import { saveOtp } from "@/lib/auth-store";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
    }

    let cleanPhone = phone.replace(/\D/g, "");
    // Default to Indian country code 91 if 10 digits provided
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    if (cleanPhone.length < 11 || cleanPhone.length > 15) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    saveOtp(cleanPhone, code);

    console.log(`[OTP] Generated OTP ${code} for phone: +${cleanPhone}`);

    // Try sending WhatsApp verification message
    const waResult = await sendWhatsAppMessage({
      to: cleanPhone,
      text: `🔐 *PropFolio Login Verification*\n\nAapka login verification code hai: *${code}*\n\nYeh code agle 10 minute ke liye valid hai. Apne dashboard me login karne ke liye isse enter karein.`,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent via WhatsApp",
      phone: cleanPhone,
      // For local development convenience if token is absent
      devOtp: process.env.NODE_ENV !== "production" ? code : undefined,
      waSent: Boolean(waResult.success),
    });
  } catch (err: any) {
    console.error("Send OTP Error:", err);
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 });
  }
}

