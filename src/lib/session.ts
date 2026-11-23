/**
 * src/lib/session.ts
 * Server-side session helper for API routes.
 * Reads the propfolio-phone-session cookie and returns a normalized user object.
 */
import { NextRequest } from "next/server";
import { getPhoneSession } from "@/lib/auth-store";

export interface SessionUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
}

/**
 * Reads session from request cookie and returns the authenticated user.
 * Returns null if not logged in.
 */
export async function getUserFromSession(
  req: NextRequest
): Promise<SessionUser | null> {
  // ── WhatsApp / Phone OTP session (primary auth method) ──────────────────
  const phoneCookie = req.cookies.get("propfolio-phone-session");
  if (phoneCookie?.value) {
    const session = getPhoneSession(phoneCookie.value);
    if (session?.profile) {
      const p = session.profile;
      return {
        id: p.user_id || p.id,
        phone: p.phone_number || session.phone || "",
        name: p.full_name || "Property Snaps User",
        email: p.email,
      };
    }
  }

  return null;
}
