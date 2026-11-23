import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder, PLAN_CONFIG, PlanKey } from "@/lib/razorpay";
import { getUserFromSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ────────────────────────────────────────────────────────
    const user = await getUserFromSession(req);
    if (!user) {
      return NextResponse.json(
        { error: "Login karo pehle" },
        { status: 401 }
      );
    }

    // ── 2. Validate plan from client ─────────────────────────────────────────
    const body = await req.json();
    const planKey = body.plan as string;

    if (!planKey || !(planKey in PLAN_CONFIG)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // ── 3. Create Razorpay order server-side ─────────────────────────────────
    // Amount comes from PLAN_CONFIG (never from client)
    const { orderId, amount, currency } = await createRazorpayOrder(
      planKey as PlanKey,
      user.id,
      user.phone
    );

    // ── 4. Return only what client needs (NEVER send secret key) ─────────────
    return NextResponse.json({
      orderId,
      amount,
      currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID, // public key only
      planKey,
      planName: PLAN_CONFIG[planKey as PlanKey].name,
      userPhone: user.phone,
      userName: user.name ?? "Property Snaps User",
    });
  } catch (err) {
    console.error("[create-order] error:", err);
    return NextResponse.json(
      { error: "Order create karne mein error aaya" },
      { status: 500 }
    );
  }
}

