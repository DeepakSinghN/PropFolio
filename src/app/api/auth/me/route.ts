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
        let profile = session.profile;

        // Try to fetch latest profile from Supabase if configured
        try {
          const supabase = await createClient();
          const cleanPhone = (profile.phone_number || session.phone || "").replace(/\D/g, "");
          const phone10 = cleanPhone.slice(-10);

          const { data: latest } = await supabase
            .from("profiles")
            .select("*")
            .or(`id.eq.${profile.id},phone_number.ilike.%${phone10}%,slug.eq.${profile.slug}`)
            .maybeSingle();

          if (latest) {
            profile = {
              ...profile,
              ...latest,
            };
          }
        } catch {}

        return NextResponse.json({
          authenticated: true,
          type: "phone",
          user: profile,
        });
      }
    }

    return NextResponse.json({ authenticated: false, user: null });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

