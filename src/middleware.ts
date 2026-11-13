import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (public user uploaded images)
     * - api/whatsapp/webhook (Meta webhook must be fast & unblocked)
     * - public assets like .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads|api/whatsapp/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

