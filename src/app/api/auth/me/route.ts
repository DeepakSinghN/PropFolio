import { NextRequest, NextResponse } from "next/server";
import { getPhoneSession } from "@/lib/auth-store";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Check Supabase user
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return NextResponse.json({
          authenticated: true,
          type: "supabase",
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            ...user.user_metadata,
          },
        });
      }
    } catch (e) {}

    // 2. Check WhatsApp / Phone Session Cookie
    const phoneCookie = req.cookies.get("propfolio-phone-session");
    if (phoneCookie?.value) {
      const session = getPhoneSession(phoneCookie.value);
      if (session) {
        return NextResponse.json({
          authenticated: true,
          type: "phone",
          user: session.profile,
        });
      }
    }

    return NextResponse.json({ authenticated: false, user: null });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

