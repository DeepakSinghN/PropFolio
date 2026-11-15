import { NextRequest, NextResponse } from "next/server";
import { saveUserAccount, createPhoneSession } from "@/lib/auth-store";
import { createClient } from "@/lib/supabase/server";

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

    let supaUserId: string | undefined;

    // 1. If email, attempt Supabase user creation
    if (isEmail && (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)) {
      try {
        const supabase = await createClient();
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
      } catch (err) {
        console.warn("Supabase signup sync skipped:", err);
      }
    }

    // 2. Save user account locally
    const profile = saveUserAccount(trimmedTarget, password, {
      full_name,
      city,
      company_name,
      user_id: supaUserId,
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

