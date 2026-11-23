import { NextRequest, NextResponse } from "next/server";
import { verifyUserPassword, createPhoneSession } from "@/lib/auth-store";

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

    const rawUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    let supabaseUrl = rawUrl;
    if (rawUrl) {
      try {
        const parsed = new URL(rawUrl);
        supabaseUrl = `${parsed.protocol}//${parsed.host}`;
      } catch {
        supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
      }
    }

    const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

    const cleanDigits = trimmedTarget.replace(/\D/g, "");
    const safePhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : trimmedTarget.startsWith("+") ? trimmedTarget : `+${cleanDigits}`;

    // 1. Try Supabase Auth
    if (supabaseUrl && (supabaseAnonKey || supabaseServiceKey)) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const clientKey = supabaseAnonKey || supabaseServiceKey!;
        const supabase = createClient(supabaseUrl, clientKey);

        let supaAuth: any = null;
        let supaErr: any = null;

        if (isEmail) {
          const res = await supabase.auth.signInWithPassword({
            email: trimmedTarget.toLowerCase(),
            password,
          });
          supaAuth = res.data;
          supaErr = res.error;
        } else {
          // A. Try official Phone authentication
          const phoneRes = await supabase.auth.signInWithPassword({
            phone: safePhone,
            password,
          });
          if (phoneRes.data?.user) {
            supaAuth = phoneRes.data;
          } else {
            // B. Fallback to legacy dummy email for accounts created earlier
            const legacyPhoneDigits = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
            const legacyRes = await supabase.auth.signInWithPassword({
              email: `${legacyPhoneDigits}@propertysnaps.in`,
              password,
            });
            if (legacyRes.data?.user) {
              supaAuth = legacyRes.data;
            } else {
              supaErr = phoneRes.error || legacyRes.error;
            }
          }
        }

        if (supaAuth?.user) {
          // Admin or client to query public.profiles
          const queryClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;
          const { data: profile } = await queryClient
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
              const { data: createdProf } = await queryClient
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

        // If Supabase gave an explicit auth error (e.g. invalid credentials)
        if (supaErr) {
          return NextResponse.json(
            { error: supaErr.message || "Invalid email or password. Please try again." },
            { status: 401 }
          );
        }
      } catch (err: any) {
        console.warn("Supabase auth check notice:", err);
      }
    }

    // 2. Local / Demo User Verification (for demo123, offline testing, or phone accounts)
    const verification = verifyUserPassword(trimmedTarget, password);
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || "No account found with this phone number or email" },
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
