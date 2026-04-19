export const DEFAULT_TENANT_SLUG = "cimage";
export const DEFAULT_TENANT_NAME = "CIMAGE";
export const DEFAULT_TENANT_BRAND_COLOR = "#22d3ee";
export const DEFAULT_TENANT_CONTACT_EMAIL = "admin.cimage@campusnexus.dev";

export const TENANT_OPTIONS = [
  { value: "cimage", label: "CIMAGE" },
  { value: "bia-patna", label: "BIA PATNA" },
  { value: "aia-patna", label: "AIA PATNA" },
  { value: "iit-patna", label: "IIT PATNA" },
  { value: "ibm", label: "IBM" }
] as const;

const RESERVED_HOST_PREFIXES = new Set(["", "127", "localhost", "campus-nexus", "www"]);

export function tenantSlugFromHost(host: string | null | undefined) {
  const normalizedHost = (host ?? "").split(":")[0].trim().toLowerCase();
  const candidate = normalizedHost.split(".")[0] ?? "";
  return RESERVED_HOST_PREFIXES.has(candidate) ? DEFAULT_TENANT_SLUG : candidate;
}
