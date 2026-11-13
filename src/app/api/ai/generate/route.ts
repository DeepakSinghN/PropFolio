import { NextRequest, NextResponse } from "next/server";
import { parsePropertyNotes } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
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

