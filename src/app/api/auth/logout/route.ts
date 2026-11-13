import { NextRequest, NextResponse } from "next/server";
import { deletePhoneSession } from "@/lib/auth-store";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Supabase SignOut
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch (e) {}

    // 2. Clear Phone Session
    const phoneCookie = req.cookies.get("propfolio-phone-session");
    if (phoneCookie?.value) {
      deletePhoneSession(phoneCookie.value);
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.delete("propfolio-phone-session");
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

