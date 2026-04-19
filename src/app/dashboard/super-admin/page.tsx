import { Button, Card, SectionTitle, StatCard } from "@/components/ui";
import { SplitPieChart, TrendAreaChart } from "@/components/dashboard-charts";
import { SeedDemoButton } from "@/components/seed-demo-button";
import { connectToDatabase } from "@/lib/db";
import { requireDashboardRole } from "@/lib/dashboard-guards";
import { Report, Tenant, User } from "@/lib/models";

export default async function SuperAdminDashboardPage() {
  await requireDashboardRole(["super_admin"]);
  await connectToDatabase();

  const [tenants, users, proTenants, reports] = await Promise.all([
    Tenant.countDocuments(),
    User.countDocuments(),
    Tenant.countDocuments({ subscriptionPlan: { $in: ["pro", "enterprise"] } }),
    Report.countDocuments({ status: { $ne: "resolved" } })
  ]);

  const stats = [
    { label: "Total colleges", value: String(tenants) },
    { label: "Global users", value: String(users) },
    { label: "Paid tenants", value: String(proTenants) },
    { label: "Threat alerts", value: String(reports) }
  ];

  const growthData = [
    { month: "Jan", users: Math.max(users - 520, 0) },
    { month: "Feb", users: Math.max(users - 430, 0) },
    { month: "Mar", users: Math.max(users - 320, 0) },
    { month: "Apr", users: Math.max(users - 220, 0) },
    { month: "May", users: Math.max(users - 120, 0) },
    { month: "Jun", users }
  ];

  const tenantMix = [
    { name: "Paid", value: proTenants },
    { name: "Free", value: Math.max(tenants - proTenants, 0) }
  ];

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
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Global controls</div>
          <h3 className="mt-2 text-2xl font-semibold text-white">Platform-wide CRUD and demo control</h3>
          <p className="mt-3 text-sm text-slate-300">
            Super admin gets dedicated actions for tenants, global users, reports, notifications, and demo seeding. Update and delete operations are available inside CRUD Studio.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/dashboard/workspace?resource=tenants&mode=create">Add Tenant</Button>
            <Button href="/dashboard/workspace?resource=users" variant="secondary">
              Manage Users
            </Button>
            <Button href="/dashboard/workspace?resource=reports" variant="secondary">
              Open Reports
            </Button>
            <Button href="/dashboard/notifications" variant="ghost">
              Broadcast Alerts
            </Button>
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Instant setup</div>
          <h3 className="mt-2 text-lg font-semibold text-white">Refresh demo data</h3>
          <p className="mt-2 text-sm text-slate-300">
            Rebuild the demo tenant with seeded users, projects, and collaboration rooms before the next presentation run.
          </p>
          <div className="mt-5">
            <SeedDemoButton />
          </div>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-white">Security operations</h3>
          <p className="mt-2 text-sm text-slate-300">Failed login logs, role change logs, and threat alerts are aggregated for investigation workflows.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/dashboard/workspace?resource=reports" variant="secondary">
              Audit Reports
            </Button>
            <Button href="/dashboard/workspace?resource=users" variant="ghost">
              Inspect Users
            </Button>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-white">Global announcements</h3>
          <p className="mt-2 text-sm text-slate-300">Broadcast policy updates, launch notes, and incident notices across all tenant colleges.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/dashboard/notifications" variant="secondary">
              Create Broadcast
            </Button>
            <Button href="/dashboard/workspace?resource=tenants" variant="ghost">
              Manage Tenants
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Global user growth</h3>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">Last 6 months</span>
          </div>
          <TrendAreaChart data={growthData} dataKey="users" xKey="month" color="#7C3AED" />
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Tenant mix</h3>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">Subscription split</span>
          </div>
          <SplitPieChart data={tenantMix} dataKey="value" nameKey="name" />
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Platform health summary</h3>
          <Button href="/dashboard/workspace?resource=reports" variant="secondary">
            Open Health Reports
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-900/70 text-slate-400">
              <tr>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Open security reports", String(reports), reports > 10 ? "Attention" : "Stable"],
                ["Paid tenants", String(proTenants), proTenants > 0 ? "Growing" : "Early stage"],
                ["Global user base", String(users), users > 1000 ? "Healthy" : "Building"]
              ].map(([metric, value, state]) => (
                <tr key={metric} className="border-t border-white/5 text-slate-200">
                  <td className="px-4 py-3">{metric}</td>
                  <td className="px-4 py-3">{value}</td>
                  <td className="px-4 py-3">{state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
