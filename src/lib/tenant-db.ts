import { Tenant } from "@/lib/models";
import {
  DEFAULT_TENANT_BRAND_COLOR,
  DEFAULT_TENANT_CONTACT_EMAIL,
  DEFAULT_TENANT_NAME,
  DEFAULT_TENANT_SLUG
} from "@/lib/tenant-config";

export async function resolveTenantRecord(tenantKey: string) {
  const tenant =
    (await Tenant.findOne({ _id: tenantKey }).catch(() => null)) ??
    (await Tenant.findOne({ slug: tenantKey })) ??
    (await Tenant.findOne({ subdomain: tenantKey }));

  if (tenant) {
    return tenant;
  }

  return Tenant.findOneAndUpdate(
    { slug: DEFAULT_TENANT_SLUG },
    {
      slug: DEFAULT_TENANT_SLUG,
      name: DEFAULT_TENANT_NAME,
      subdomain: DEFAULT_TENANT_SLUG,
      brandColor: DEFAULT_TENANT_BRAND_COLOR,
      isolationMode: "shared",
      contactEmail: DEFAULT_TENANT_CONTACT_EMAIL
    },
    { upsert: true, new: true }
  );
}
