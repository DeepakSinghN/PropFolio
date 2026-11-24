import { NextRequest, NextResponse } from "next/server";
import { parsePropertyNotes } from "@/lib/ai";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 5 AI generations per 60 seconds per IP
    const rateCheck = checkRateLimit(`ai:${ip}`, 5, 60);
    if (!rateCheck.success) {
      return createRateLimitResponse(
        `AI generation limit reached. Please wait ${rateCheck.retryAfterSec} seconds before generating again.`,
        rateCheck.retryAfterSec
      );
    }

    const body = await req.json();
    const { notes } = body;

    if (!notes || typeof notes !== "string" || notes.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide valid property notes (minimum 5 characters)." },
        { status: 400 }
      );
    }

    const parsedData = await parsePropertyNotes(notes);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate property listing with AI." },
      { status: 500 }
    );
  }
}

