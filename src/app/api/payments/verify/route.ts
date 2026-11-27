import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getUserFromSession } from "@/lib/session";
import { updateUserPlan } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ────────────────────────────────────────────────────────
    const user = await getUserFromSession(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── 2. Parse payment response ─────────────────────────────────────────────
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planKey,
    } = body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      planKey: string;
    };

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !planKey
    ) {
      return NextResponse.json(
        { error: "Missing payment fields" },
        { status: 400 }
      );
    }

    // ── 3. CRITICAL: Verify signature HMAC-SHA256 ─────────────────────────────
    // This is the only security gate. Plan NEVER upgrades without this.
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error(
        `[verify] SIGNATURE MISMATCH — userId: ${user.id}, orderId: ${razorpay_order_id}`
      );
      return NextResponse.json(
        { error: "Payment verification failed — signature invalid" },
        { status: 400 }
      );
    }

    // ── 4. Normalize plan key to subscription tier & billing cycle ────────────
    let planTier: "free" | "pay_per_listing" | "solo_pro" | "builder_pro" | "agency_starter";
    let billingCycle: "monthly" | "yearly" | "one_time" = "monthly";

    if (planKey.startsWith("pro")) {
      planTier = "solo_pro";
      billingCycle = planKey.endsWith("yearly") ? "yearly" : "monthly";
    } else if (planKey.startsWith("builder")) {
      planTier = "builder_pro";
      billingCycle = planKey.endsWith("yearly") ? "yearly" : "monthly";
    } else if (planKey.startsWith("agency")) {
      planTier = "agency_starter";
      billingCycle = planKey.endsWith("yearly") ? "yearly" : "monthly";
    } else if (planKey === "pay_per_listing") {
      planTier = "pay_per_listing";
      billingCycle = "one_time";
    } else {
      planTier = "free";
    }

    // ── 5. Update user plan in DB ONLY after signature verified ───────────────
    await updateUserPlan(user.id, planTier, {
      razorpay_order_id,
      razorpay_payment_id,
      planKey,
      billingCycle,
    });

    console.log(
      `[verify] ✅ Plan upgraded — userId: ${user.id}, plan: ${planTier}, paymentId: ${razorpay_payment_id}`
    );

    return NextResponse.json({
      success: true,
      plan: planTier,
      message: "Payment successful! Plan upgrade ho gaya 🎉",
    });
  } catch (err) {
    console.error("[verify] error:", err);
    return NextResponse.json(
      { error: "Payment verify karne mein error aaya" },
      { status: 500 }
    );
  }
}

