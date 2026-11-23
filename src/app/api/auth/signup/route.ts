import { NextRequest, NextResponse } from "next/server";
import { saveUserAccount, createPhoneSession, verifyOtp, verifyUserPassword } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, identifier, city, company_name, password, otp_code, otp_token } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "WhatsApp number and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const trimmedTarget = identifier.toString().trim();

    // Verify WhatsApp OTP confirmation code
    if (!otp_code) {
      return NextResponse.json(
        { error: "WhatsApp OTP verification code is required" },
        { status: 400 }
      );
    }

    const token = otp_token || req.cookies.get("propfolio-otp-token")?.value;
    const isOtpValid = verifyOtp(trimmedTarget, otp_code.toString(), token);
    if (!isOtpValid) {
      return NextResponse.json(
        { error: "Invalid or expired WhatsApp OTP code. Please check your code or request a new one." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingCheck = verifyUserPassword(trimmedTarget, "check_existing");
    if (existingCheck.error && existingCheck.error.includes("Incorrect password")) {
      return NextResponse.json(
        { error: "An account with this WhatsApp number already exists. Please sign in instead." },
        { status: 400 }
      );
    }
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

    let supaUserId: string | undefined;
    let supaProfileId: string | undefined;

    const baseName = full_name
      ? full_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : isEmail
        ? trimmedTarget.split("@")[0].replace(/[^a-z0-9]+/g, "-")
        : "broker";

    const rawBase = baseName.replace(/^-|-$/g, "") || "broker";
    let brokerSlug = rawBase;

    // Check if base slug is already taken, if so append sequential number (-2, -3)
    if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const queryClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!);
        const { data: existing } = await queryClient
          .from("profiles")
          .select("slug")
          .eq("slug", rawBase)
          .maybeSingle();

        if (existing) {
          let counter = 2;
          while (counter < 20) {
            const candidate = `${rawBase}-${counter}`;
            const { data: check } = await queryClient
              .from("profiles")
              .select("slug")
              .eq("slug", candidate)
              .maybeSingle();
            if (!check) {
              brokerSlug = candidate;
              break;
            }
            counter++;
          }
        }
      } catch {}
    }

    const safePhone = isEmail
      ? `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`
      : trimmedTarget.startsWith("+")
        ? trimmedTarget
        : "+91" + trimmedTarget.replace(/\D/g, "");

    // 1. Supabase User & Profile Registration
    if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
      try {
        const { createClient } = await import("@supabase/supabase-js");

        if (supabaseServiceKey) {
          // Admin API: creates 100% verified active user (no email confirmation block!)
          const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

          const userCreatePayload: any = isEmail
            ? {
                email: trimmedTarget.toLowerCase(),
                password,
                email_confirm: true,
                user_metadata: {
                  full_name: full_name || "Real Estate Broker",
                  city: city || "India",
                  company_name: company_name ? company_name.trim() : "",
                },
              }
            : {
                phone: safePhone,
                password,
                phone_confirm: true,
                user_metadata: {
                  full_name: full_name || "Real Estate Broker",
                  city: city || "India",
                  company_name: company_name ? company_name.trim() : "",
                  phone_number: safePhone,
                },
              };

          const { data: adminUser, error: adminErr } = await adminSupabase.auth.admin.createUser(userCreatePayload);

          if (adminUser?.user) {
            supaUserId = adminUser.user.id;
          } else if (adminErr) {
            if (adminErr.message.toLowerCase().includes("already registered") || adminErr.message.toLowerCase().includes("already exists")) {
              return NextResponse.json(
                { error: "An account with this WhatsApp number already exists. Please log in." },
                { status: 400 }
              );
            }
            console.error("Supabase admin.createUser error:", adminErr);
          }

          // Insert into public.profiles
          if (supaUserId) {
            const profilePayload = {
              id: supaUserId,
              user_id: supaUserId,
              full_name: full_name || "Real Estate Broker",
              slug: brokerSlug,
              phone_number: isEmail ? undefined : safePhone,
              email: isEmail ? trimmedTarget.toLowerCase() : undefined,
              company_name: company_name ? company_name.trim() : "",
              city: city || "India",
              plan_tier: "solo_pro",
              listing_credits: 30,
              is_active: true,
              updated_at: new Date().toISOString(),
            };

            const { data: insertedProf, error: profErr } = await adminSupabase
              .from("profiles")
              .upsert(profilePayload, { onConflict: "id" })
              .select()
              .maybeSingle();

            if (insertedProf?.id) {
              supaProfileId = insertedProf.id;
            } else if (profErr) {
              console.warn("Public profiles table insert error:", profErr);
            }
          }
        } else if (isEmail && supabaseAnonKey) {
          // Standard client signup with anon key
          const clientSupabase = createClient(supabaseUrl, supabaseAnonKey);
          const { data: supaAuth, error: supaErr } = await clientSupabase.auth.signUp({
            email: trimmedTarget.toLowerCase(),
            password,
            options: {
              data: {
                full_name: full_name || "Real Estate Broker",
                city,
                company_name,
              },
            },
          });

          if (supaErr) {
            console.error("Supabase client signUp error:", supaErr);
            return NextResponse.json(
              { error: supaErr.message },
              { status: 400 }
            );
          }

          if (supaAuth?.user) {
            supaUserId = supaAuth.user.id;
          }
        }
      } catch (err: any) {
        console.error("Supabase signup connection error:", err);
        return NextResponse.json(
          { error: `Database connection error: ${err.message}` },
          { status: 500 }
        );
      }
    }

    // 2. Build Profile
    const profile = saveUserAccount(trimmedTarget, password, {
      id: supaProfileId || supaUserId,
      user_id: supaUserId,
      full_name,
      slug: brokerSlug,
      city,
      company_name,
      phone_number: safePhone,
      email: isEmail ? trimmedTarget.toLowerCase() : undefined,
    });

    // 3. Create active stateless session
    const session = createPhoneSession(trimmedTarget, profile);

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: session.profile,
    });

    // Set secure cookie
    response.cookies.set("propfolio-phone-session", session.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
