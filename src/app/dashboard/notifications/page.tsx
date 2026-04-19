import { NotificationsFeed } from "@/components/notifications-feed";
import { connectToDatabase } from "@/lib/db";
import { Notification, Tenant } from "@/lib/models";
import { getServerAuthContext } from "@/lib/server-auth";

export default async function NotificationsPage() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return null;
  }

  await connectToDatabase();
  const [notifications, currentTenant, tenants] = await Promise.all([
    Notification.find({ tenantId: auth.tenantId, userId: auth.sub }).sort({ createdAt: -1 }).limit(50).lean(),
    Tenant.findById(auth.tenantId).select("name").lean(),
    auth.role === "super_admin" ? Tenant.find().sort({ name: 1 }).select("name").lean() : Tenant.find({ _id: auth.tenantId }).select("name").lean()
  ]);

  const items = notifications.map((notification) => ({
    _id: notification._id.toString(),
    title: notification.title ?? "Untitled notification",
    body: notification.body ?? "",
    read: Boolean(notification.read),
    createdAt: notification.createdAt?.toISOString?.() ?? null
  }));

  return (
    <NotificationsFeed
      initialItems={items}
      role={auth.role}
      currentTenantId={auth.tenantId}
      currentTenantName={currentTenant?.name ?? "your college"}
      tenantOptions={tenants.map((tenant) => ({ id: tenant._id.toString(), name: tenant.name ?? "Unnamed college" }))}
    />
  );
}
