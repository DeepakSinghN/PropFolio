import { NextRequest, NextResponse } from "next/server";
import { verifyUserPassword, createPhoneSession } from "@/lib/auth-store";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Phone number or email, and password are required" },
        { status: 400 }
      );
    }

    const trimmedTarget = identifier.toString().trim();
    const isEmail = trimmedTarget.includes("@");

    // 1. Try Supabase Auth if email is provided
    if (isEmail && (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)) {
      try {
        const supabase = await createClient();
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email: trimmedTarget.toLowerCase(),
          password,
        });

        if (!supaErr && supaAuth.user) {
          // Fetch or ensure linked profile in Supabase
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .or(`user_id.eq.${supaAuth.user.id},id.eq.${supaAuth.user.id}`)
            .maybeSingle();

          let userProfile = profile;

          if (!userProfile) {
            const fallbackSlug = (trimmedTarget.split("@")[0].replace(/[^a-z0-9]/g, "-") || "broker") + "-" + supaAuth.user.id.slice(0, 4);
            const newPayload = {
              id: supaAuth.user.id,
              user_id: supaAuth.user.id,
              full_name: supaAuth.user.user_metadata?.full_name || "Real Estate Broker",
              slug: fallbackSlug,
              phone_number: "+91" + Math.floor(6000000000 + Math.random() * 3999999999),
              company_name: supaAuth.user.user_metadata?.company_name || "Exclusive Advisory",
              city: supaAuth.user.user_metadata?.city || "India",
              plan_tier: "solo_pro",
              listing_credits: 30,
              is_active: true,
            };

            try {
              const { data: createdProf } = await supabase
                .from("profiles")
                .upsert(newPayload, { onConflict: "id" })
                .select()
                .maybeSingle();
              userProfile = createdProf || newPayload;
            } catch {
              userProfile = newPayload;
            }
          }

          const session = createPhoneSession(trimmedTarget, userProfile);
          const response = NextResponse.json({
            success: true,
            message: "Login successful",
            user: userProfile,
          });

          response.cookies.set("propfolio-phone-session", session.sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
          });

          return response;
        }
      } catch (err) {
        console.warn("Supabase password auth check fallback:", err);
      }
    }

    // 2. Local / Demo User Password Verification
    const verification = verifyUserPassword(trimmedTarget, password);
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || "Invalid credentials" },
        { status: 401 }
      );
    }

    const session = createPhoneSession(trimmedTarget, verification.profile);
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: session.profile,
    });

    response.cookies.set("propfolio-phone-session", session.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log in" },
      { status: 500 }
    );
  }
}

