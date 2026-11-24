import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const sessionResponse = await updateSession(request);
  if (sessionResponse && sessionResponse.status !== 200) {
    return sessionResponse;
  }

  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Ignore static assets, internal Next.js routes, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return sessionResponse;
  }

  // Security: Protect /dashboard routes for unauthenticated users
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const phoneCookie = request.cookies.get("propfolio-phone-session");
    let hasSupabaseAuth = false;
    for (const c of request.cookies.getAll()) {
      if (c.name.includes("-auth-token") || c.name.startsWith("sb-")) {
        hasSupabaseAuth = true;
        break;
      }
    }

    if (!phoneCookie?.value && !hasSupabaseAuth) {
      const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const rootDomain = "propertysnaps.in";
  const cleanHost = hostname.split(":")[0].toLowerCase();

  let subdomain = "";
  if (cleanHost.endsWith(`.${rootDomain}`)) {
    subdomain = cleanHost.replace(`.${rootDomain}`, "");
  } else if (cleanHost.endsWith(".localhost")) {
    subdomain = cleanHost.replace(".localhost", "");
  }

  // If someone requests the single-letter 'l' subdomain, redirect to main domain
  if (subdomain === "l") {
    const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const redirectPath = cleanPath.startsWith("/l/") ? cleanPath : `/l${cleanPath}`;
    const targetUrl = new URL(redirectPath, `https://www.propertysnaps.in`);
    return NextResponse.redirect(targetUrl, 301);
  }

  // Handle broker wildcard subdomains (e.g. deepak-thakur.propertysnaps.in)
  if (subdomain && subdomain !== "www") {
    // If accessing main app pages on a subdomain, redirect to apex/www domain
    const mainAppRoutes = [
      "/dashboard",
      "/login",
      "/signup",
      "/pricing",
      "/contact",
      "/privacy",
      "/terms",
      "/refund",
    ];

    if (mainAppRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      const targetUrl = new URL(pathname, `https://www.propertysnaps.in`);
      return NextResponse.redirect(targetUrl);
    }

    // 1. Root of subdomain -> rewrite to /[slug]
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}`;
      return NextResponse.rewrite(url, {
        headers: sessionResponse.headers,
      });
    }

    // 2. /l/[listingSlug] -> rewrite to /[slug]/[listingSlug]
    if (pathname.startsWith("/l/")) {
      const listingPath = pathname.replace(/^\/l/, "");
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}${listingPath}`;
      return NextResponse.rewrite(url, {
        headers: sessionResponse.headers,
      });
    }

    // 3. /c/[collectionSlug] -> rewrite to /[slug]/c/[collectionSlug]
    if (pathname.startsWith("/c/")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}${pathname}`;
      return NextResponse.rewrite(url, {
        headers: sessionResponse.headers,
      });
    }

    // 4. Any direct listing slug (e.g. deepak.propertysnaps.in/4-bhk-bodakdev-401664)
    if (!pathname.startsWith(`/${subdomain}`)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}${pathname}`;
      return NextResponse.rewrite(url, {
        headers: sessionResponse.headers,
      });
    }
  }

  return sessionResponse;
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

