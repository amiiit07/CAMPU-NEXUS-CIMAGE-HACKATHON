import { Tenant } from "@/lib/models";

export async function resolveTenantRecord(tenantKey: string) {
  const tenant =
    (await Tenant.findOne({ _id: tenantKey }).catch(() => null)) ??
    (await Tenant.findOne({ slug: tenantKey })) ??
    (await Tenant.findOne({ subdomain: tenantKey }));

  if (tenant) {
    return tenant;
  }

  return Tenant.findOneAndUpdate(
    { slug: "campus-demo" },
    {
      slug: "campus-demo",
      name: "Campus Demo Tenant",
      subdomain: "demo",
      brandColor: "#7C3AED",
      isolationMode: "shared"
    },
    { upsert: true, new: true }
  );
}
