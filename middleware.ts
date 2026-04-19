import { NextResponse, type NextRequest } from "next/server";
import { tenantSlugFromHost } from "@/lib/tenant-config";

function resolveTenant(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "campus-nexus.local";
  const tenantSlug = request.headers.get("x-tenant-slug") ?? tenantSlugFromHost(host);
  return { tenantSlug, tenantId: request.headers.get("x-tenant-id") ?? tenantSlug };
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/_next") || request.nextUrl.pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  const tenant = resolveTenant(request);
  requestHeaders.set("x-tenant-slug", tenant.tenantSlug);
  requestHeaders.set("x-tenant-id", tenant.tenantId);
  requestHeaders.set("x-tenant-mode", request.headers.get("x-tenant-mode") ?? "shared");

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
