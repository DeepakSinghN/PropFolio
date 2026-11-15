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
    if (isEmail && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = await createClient();
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email: trimmedTarget.toLowerCase(),
          password,
        });

        if (!supaErr && supaAuth.user) {
          // Fetch linked profile from Supabase
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", trimmedTarget.toLowerCase())
            .maybeSingle();

          const userProfile = profile || {
            id: supaAuth.user.id,
            user_id: supaAuth.user.id,
            full_name: supaAuth.user.user_metadata?.full_name || trimmedTarget.split("@")[0],
            slug: trimmedTarget.split("@")[0].replace(/[^a-z0-9]/g, "-"),
            phone_number: "+91 9876543210",
            email: trimmedTarget.toLowerCase(),
            plan_tier: "solo_pro",
            listing_credits: 28,
            is_active: true,
          };

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
