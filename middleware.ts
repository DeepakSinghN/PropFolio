import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .png, .jpg, .svg)
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|[\\w-]+\\.\\w+).*)",
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Get current host without port for domain comparison
  const currentHost = hostname.replace(`:${url.port}`, "").toLowerCase();
  
  // Root domain configured in environment (e.g. "localhost:3000" or "propfolio.co")
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000")
    .replace(/:.*/, "")
    .toLowerCase();

  // Check if we are on a custom broker subdomain (e.g. ramesh.propfolio.co or ramesh.localhost)
  const isSubdomain = currentHost !== rootDomain && currentHost.endsWith(rootDomain);

  if (isSubdomain) {
    // Extract subdomain: "ramesh.propfolio.co" -> "ramesh"
    const subdomain = currentHost.replace(`.${rootDomain}`, "");

    // Rewrite internal URL to /[slug]/[path]
    return NextResponse.rewrite(
      new URL(`/${subdomain}${url.pathname}${url.search}`, req.url)
    );
  }

  return NextResponse.next();
}

