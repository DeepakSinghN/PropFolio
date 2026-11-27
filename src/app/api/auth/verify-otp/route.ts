import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, createPhoneSession, slugifyName, isGenericBrokerName, isGenericSlug } from "@/lib/auth-store";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawTarget = (body.identifier || body.phone || body.email || "").toString().trim();
    const code = (body.code || "").toString().trim();
    const { full_name, city, company_name } = body;

    if (!rawTarget || !code) {
      return NextResponse.json({ error: "Phone number or email, and verification code are required" }, { status: 400 });
    }

    const isEmail = rawTarget.includes("@");
    let cleanTarget = rawTarget;
    if (isEmail) {
      cleanTarget = rawTarget.toLowerCase();
    } else {
      let digits = rawTarget.replace(/\D/g, "");
      if (digits.length === 10) digits = "91" + digits;
      cleanTarget = digits;
    }

    const token = body.otp_token || req.cookies.get("propfolio-otp-token")?.value;
    const isValid = verifyOtp(cleanTarget, code, token);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code. Please try again." }, { status: 401 });
    }

    const rawName = (full_name || "").toString().trim();
    const fallbackSlug = isEmail
      ? cleanTarget.split("@")[0].replace(/[^a-z0-9]/g, "-")
      : "broker-" + cleanTarget.slice(-4);

    const generatedSlug = rawName ? slugifyName(rawName) : fallbackSlug;

    let profileData = {
      full_name: rawName || (isEmail ? cleanTarget.split("@")[0] : "Real Estate Broker"),
      city: city || "India",
      company_name: company_name ? company_name.trim() : "",
      slug: generatedSlug,
      email: isEmail ? cleanTarget : undefined,
      phone_number: isEmail ? undefined : "+" + cleanTarget,
    };

    const supaUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supaKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supaUrl && supaKey && !supaKey.includes("...")) {
      try {
        const supabase = createClient(supaUrl, supaKey);

        const query = supabase.from("profiles").select("*");
        const { data: existingProfile } = isEmail
          ? await query.eq("email", cleanTarget).maybeSingle()
          : await query.eq("phone_number", "+" + cleanTarget).maybeSingle();

        if (existingProfile) {
          // If existing profile has a generic name/slug and user provided real name now, upgrade it!
          const hasNewName = Boolean(rawName && !isGenericBrokerName(rawName));
          const existingIsGenericName = isGenericBrokerName(existingProfile.full_name);
          const existingIsGenericSlug = isGenericSlug(existingProfile.slug);

          const finalName = hasNewName
            ? rawName
            : (!existingIsGenericName ? existingProfile.full_name : profileData.full_name);

          const finalSlug = (hasNewName || existingIsGenericSlug)
            ? slugifyName(finalName)
            : existingProfile.slug;

          profileData = {
            full_name: finalName,
            city: city || existingProfile.city || profileData.city,
            company_name: company_name !== undefined ? company_name.trim() : (existingProfile.company_name || ""),
            slug: finalSlug,
            email: existingProfile.email || profileData.email,
            phone_number: existingProfile.phone_number || profileData.phone_number,
          };

          // Persist upgrade to Supabase immediately
          if (finalName !== existingProfile.full_name || finalSlug !== existingProfile.slug) {
            await supabase
              .from("profiles")
              .update({
                full_name: finalName,
                slug: finalSlug,
                city: profileData.city,
                company_name: profileData.company_name,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingProfile.id);
          }
        } else {
          await supabase.from("profiles").insert({
            full_name: profileData.full_name,
            slug: profileData.slug,
            phone_number: profileData.phone_number,
            email: profileData.email,
            company_name: profileData.company_name,
            city: profileData.city,
            plan_tier: "free",
            listing_credits: 1,
            plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            billing_cycle: "monthly",
            is_active: true,
          });
        }
      } catch (dbErr) {
        console.warn("Supabase profile sync skipped:", dbErr);
      }
    }

    // Create session in auth store
    const session = createPhoneSession(cleanTarget, profileData);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: session.profile,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("propfolio-phone-session", session.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Verify OTP Error:", err);
    return NextResponse.json({ error: err.message || "Failed to verify OTP" }, { status: 500 });
  }
}

