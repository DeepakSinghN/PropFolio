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
    const phone10 = cleanDigits.slice(-10);
    const full12 = `91${phone10}`;
    const safePhone = `+91${phone10}`;

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
          const internalEmail = `${full12}@propertysnaps.in`;

          // Ensure existing phone accounts created without an email alias get synced via Admin
          if (supabaseServiceKey) {
            try {
              const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
              const { data: listData } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
              const existingUser = listData?.users?.find((u) => {
                const uPhone = (u.phone || "").replace(/\D/g, "");
                const uMetaPhone = ((u.user_metadata?.phone_number || "") as string).replace(/\D/g, "");
                return uPhone.endsWith(phone10) || uMetaPhone.endsWith(phone10) || u.email === internalEmail;
              });

              if (existingUser && (!existingUser.email || existingUser.email !== internalEmail)) {
                // Attach internal email alias so password verification is 100% free & Twilio-free
                await adminSupabase.auth.admin.updateUserById(existingUser.id, {
                  email: internalEmail,
                  email_confirm: true,
                });
              }
            } catch (syncErr) {
              console.warn("[login] Admin user sync notice:", syncErr);
            }
          }

          // Authenticate with internal email alias
          const emailRes = await supabase.auth.signInWithPassword({
            email: internalEmail,
            password,
          });

          if (emailRes.data?.user) {
            supaAuth = emailRes.data;
          } else {
            // Fallback: try raw phone auth if enabled
            const phoneRes = await supabase.auth.signInWithPassword({
              phone: safePhone,
              password,
            });
            if (phoneRes.data?.user) {
              supaAuth = phoneRes.data;
            } else {
              supaErr = emailRes.error || phoneRes.error;
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
              phone_number: supaAuth.user.phone || supaAuth.user.user_metadata?.phone_number || "",
              company_name: supaAuth.user.user_metadata?.company_name || "",
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
          const isPhoneDisabled = supaErr.message?.toLowerCase().includes("phone logins are disabled");
          const isInvalidCreds = supaErr.message?.toLowerCase().includes("invalid login credentials");
          const displayErr = isPhoneDisabled || isInvalidCreds
            ? "Invalid WhatsApp mobile number or password. Please try again."
            : supaErr.message || "Invalid credentials. Please try again.";
          return NextResponse.json(
            { error: displayErr },
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
