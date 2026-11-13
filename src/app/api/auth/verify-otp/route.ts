import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, createPhoneSession } from "@/lib/auth-store";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, full_name, city, company_name } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone number and OTP code are required" }, { status: 400 });
    }

    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    const isValid = verifyOtp(cleanPhone, code);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired OTP code. Please try again." }, { status: 401 });
    }

    const isTestAccount =
      cleanPhone === "919876543210" ||
      cleanPhone === "9876543210" ||
      cleanPhone === "919999999999" ||
      cleanPhone === "9999999999";

    // Test account profile
    let profileData = isTestAccount
      ? {
          full_name: "Ramesh Shah",
          city: "Ahmedabad, Gujarat",
          company_name: "Shah Realty Group",
          slug: "ramesh",
        }
      : {
          full_name: full_name || "Real Estate Advisor",
          city: city || "India",
          company_name: company_name || "Exclusive Advisory",
          slug: (full_name ? full_name.toLowerCase().replace(/[^a-z0-9]/g, "-") : "broker") + "-" + cleanPhone.slice(-4),
        };

    // Only attempt Supabase sync for non-test accounts when valid keys are configured
    if (!isTestAccount && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_SERVICE_ROLE_KEY?.includes("...")) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("phone_number", "+" + cleanPhone)
          .single();

        if (existingProfile) {
          profileData = {
            full_name: existingProfile.full_name || profileData.full_name,
            city: existingProfile.city || profileData.city,
            company_name: existingProfile.company_name || profileData.company_name,
            slug: existingProfile.slug || profileData.slug,
          };
        } else {
          await supabase.from("profiles").insert({
            full_name: profileData.full_name,
            slug: profileData.slug,
            phone_number: "+" + cleanPhone,
            company_name: profileData.company_name,
            city: profileData.city,
            plan_tier: "solo_pro",
            listing_credits: 25,
            is_active: true,
          });
        }
      } catch (dbErr) {
        console.warn("Supabase profile sync skipped:", dbErr);
      }
    }

    // Create session in auth store
    const session = createPhoneSession(cleanPhone, profileData);

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

