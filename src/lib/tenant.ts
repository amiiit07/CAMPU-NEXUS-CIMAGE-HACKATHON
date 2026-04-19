import { headers } from "next/headers";

export type TenantContext = {
  tenantId: string;
  tenantSlug: string;
  tenantMode: "shared" | "isolated" | "schema";
  host: string;
};

export function resolveTenantFromHeaders(): TenantContext {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "campus-nexus.local";
  const tenantId = headersList.get("x-tenant-id") ?? "campus-demo";
  const tenantSlug = headersList.get("x-tenant-slug") ?? host.split(".")[0] ?? "campus-demo";

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
