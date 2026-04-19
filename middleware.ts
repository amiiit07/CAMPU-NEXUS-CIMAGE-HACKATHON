import { NextResponse, type NextRequest } from "next/server";

function resolveTenant(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "campus-nexus.local";
  const tenantSlug = host.split(".")[0] ?? "campus-nexus";
  return { tenantSlug, tenantId: request.headers.get("x-tenant-id") ?? "campus-demo" };
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
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
