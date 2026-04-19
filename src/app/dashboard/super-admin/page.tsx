import { Card, SectionTitle, StatCard } from "@/components/ui";
import { requireDashboardRole } from "@/lib/dashboard-guards";

const stats = [
  { label: "Total colleges", value: "128" },
  { label: "Global users", value: "54,920" },
  { label: "Monthly revenue", value: "$182k" },
  { label: "Threat alerts", value: "5" }
];

export default async function SuperAdminDashboardPage() {
  await requireDashboardRole(["super_admin"]);
  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Super admin"
        title="Global platform operations and security center"
        description="Manage all tenants, users, subscriptions, announcements, and security telemetry with full platform-wide controls."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-white">Security operations</h3>
          <p className="mt-2 text-sm text-slate-300">Failed login logs, role change logs, and threat alerts are aggregated for investigation workflows.</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-white">Global announcements</h3>
          <p className="mt-2 text-sm text-slate-300">Broadcast policy updates, launch notes, and incident notices across all tenant colleges.</p>
        </Card>
      </div>
    </div>
  );
}
