import { NextRequest, NextResponse } from "next/server";
import { saveUserAccount, createPhoneSession } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const { full_name, identifier, city, company_name, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Phone number or email, and password are required" },
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
    const isEmail = trimmedTarget.includes("@");

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let supaUserId: string | undefined;
    let supaProfileId: string | undefined;

    const baseName = full_name
      ? full_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : isEmail
        ? trimmedTarget.split("@")[0].replace(/[^a-z0-9]+/g, "-")
        : "broker";

    const brokerSlug = (baseName.replace(/^-|-$/g, "") || "broker") + "-" + Math.floor(100 + Math.random() * 900);

    const safePhone = isEmail
      ? `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`
      : trimmedTarget.startsWith("+")
        ? trimmedTarget
        : "+91" + trimmedTarget.replace(/\D/g, "");

    // 1. Supabase User & Profile Creation
    if (supabaseUrl) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const adminKey = supabaseServiceKey || supabaseAnonKey;

        if (adminKey) {
          const supabase = createClient(supabaseUrl, adminKey);

          // A. Create User in auth.users
          if (supabaseServiceKey && isEmail) {
            // Admin API: 100% verified, no email confirmation waiting!
            const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
              email: trimmedTarget.toLowerCase(),
              password,
              email_confirm: true,
              user_metadata: {
                full_name: full_name || "Real Estate Broker",
                city: city || "India",
                company_name: company_name || "Exclusive Advisory",
              },
            });

            if (adminUser?.user) {
              supaUserId = adminUser.user.id;
            } else if (adminErr && adminErr.message.includes("already registered")) {
              const { data: listData } = await supabase.auth.admin.listUsers();
              const found = listData?.users?.find(
                (u) => u.email?.toLowerCase() === trimmedTarget.toLowerCase()
              );
              if (found) supaUserId = found.id;
            }
          } else if (isEmail) {
            // Standard client signup
            const { data: supaAuth } = await supabase.auth.signUp({
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
            if (supaAuth.user) {
              supaUserId = supaAuth.user.id;
            }
          }

          // B. Upsert into public.profiles
          const profilePayload: any = {
            full_name: full_name || "Real Estate Broker",
            slug: brokerSlug,
            phone_number: safePhone,
            company_name: company_name || "Exclusive Advisory",
            city: city || "India",
            plan_tier: "solo_pro",
            listing_credits: 30,
            is_active: true,
            updated_at: new Date().toISOString(),
          };

          if (supaUserId) {
            profilePayload.id = supaUserId;
            profilePayload.user_id = supaUserId;
          }

          const { data: insertedProf, error: profErr } = await supabase
            .from("profiles")
            .upsert(profilePayload, { onConflict: "slug" })
            .select()
            .maybeSingle();

          if (insertedProf?.id) {
            supaProfileId = insertedProf.id;
          } else if (profErr) {
            console.warn("Profiles table sync notice:", profErr);
          }
        }
      } catch (err) {
        console.warn("Supabase signup sync notice:", err);
      }
    }

    // 2. Save user account locally
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

    // 3. Create active session
    const session = createPhoneSession(trimmedTarget, profile);

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully",
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
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
