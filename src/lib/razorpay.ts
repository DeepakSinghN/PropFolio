import Razorpay from "razorpay";
import crypto from "crypto";

// ─── Plan config (server-side only — NEVER expose to client) ───────────────────
export const PLAN_CONFIG = {
  pay_per_listing: {
    name: "Pay Per Listing",
    amountInPaise: 7900,      // ₹79 × 100
    currency: "INR",
  },
  pro_monthly: {
    name: "Solo Broker Pro (Monthly)",
    amountInPaise: 49900,     // ₹499 × 100
    currency: "INR",
  },
  pro_yearly: {
    name: "Solo Broker Pro (Yearly)",
    amountInPaise: 399900,    // ₹3999 × 100
    currency: "INR",
  },
  agency_monthly: {
    name: "Agency & Builder (Monthly)",
    amountInPaise: 149900,    // ₹1499 × 100
    currency: "INR",
  },
  agency_yearly: {
    name: "Agency & Builder (Yearly)",
    amountInPaise: 1199900,   // ₹11999 × 100
    currency: "INR",
  },
} as const;

export type PlanKey = keyof typeof PLAN_CONFIG;

// ─── Razorpay instance (lazy — only on server) ───────────────────────────────
let _razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!_razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay keys not configured in environment variables");
    }
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _razorpay;
}

// ─── Create a Razorpay order server-side ─────────────────────────────────────
export async function createRazorpayOrder(
  planKey: PlanKey,
  userId: string,
  userPhone: string
): Promise<{ orderId: string; amount: number; currency: string }> {
  const plan = PLAN_CONFIG[planKey];
  const rzp = getRazorpay();

  const order = await rzp.orders.create({
    amount: plan.amountInPaise,
    currency: plan.currency,
    receipt: `ps_${userId.slice(0, 8)}_${Date.now()}`,
    notes: {
      plan: planKey,              // Source of truth — read in webhook/verify
      userId,
      userPhone,
      planName: plan.name,
    },
  });

  return {
    orderId: order.id,
    amount: plan.amountInPaise,
    currency: plan.currency,
  };
}

// ─── Verify Razorpay payment signature (HMAC-SHA256) ─────────────────────────
// CRITICAL: Plan is ONLY upgraded after this passes.
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(razorpaySignature)
  );
}

