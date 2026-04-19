import { headers } from "next/headers";
import { DEFAULT_TENANT_SLUG, tenantSlugFromHost } from "@/lib/tenant-config";

export type TenantContext = {
  tenantId: string;
  tenantSlug: string;
  tenantMode: "shared" | "isolated" | "schema";
  host: string;
};

export function resolveTenantFromHeaders(): TenantContext {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "campus-nexus.local";
  const tenantSlug = headersList.get("x-tenant-slug") ?? tenantSlugFromHost(host);
  const tenantId = headersList.get("x-tenant-id") ?? tenantSlug ?? DEFAULT_TENANT_SLUG;

  return {
    tenantId,
    tenantSlug,
    tenantMode: (headersList.get("x-tenant-mode") as TenantContext["tenantMode"]) ?? "shared",
    host
  };
}

export function tenantFilter(tenantId: string) {
  return { tenantId };
}
