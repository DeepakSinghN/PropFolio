import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { updateBrokerProfile, slugifyName } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, company_name, city, slug, phone_number, avatar_url } = body;

    const res = await updateBrokerProfile(user.id, {
      full_name,
      company_name,
      city,
      slug: slug ? slugifyName(slug) : undefined,
      phone_number,
      avatar_url,
    });

    if (res.success) {
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully!",
        profile: res.profile,
      });
    }

    return NextResponse.json({ error: res.error || "Failed to update profile" }, { status: 400 });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

