import { Button, Card, SectionTitle } from "@/components/ui";
import { connectToDatabase } from "@/lib/db";
import { requireDashboardRole } from "@/lib/dashboard-guards";
import { Department, Project, Report, User } from "@/lib/models";

export default async function AdminDashboardPage() {
  const auth = await requireDashboardRole(["college_admin"]);
  await connectToDatabase();

  const [users, projects, departments, reports] = await Promise.all([
    User.countDocuments({ tenantId: auth.tenantId }),
    Project.countDocuments({ tenantId: auth.tenantId }),
    Department.countDocuments({ tenantId: auth.tenantId }),
    Report.countDocuments({ tenantId: auth.tenantId, status: { $ne: "resolved" } })
  ]);

  const tenantRows = [
    ["Institution users", String(users)],
    ["Active projects", String(projects)],
    ["Departments", String(departments)],
    ["Open reports", String(reports)]
  ];

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="College admin"
        title="Institution command center"
        description="Track student engagement, department adoption, mentor availability, project throughput, and cross-college collaboration in one secure view."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tenantRows.map(([label, value]) => (
          <Card key={label}>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</div>
            <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Admin controls</div>
          <h3 className="mt-2 text-2xl font-semibold text-white">Visible actions for college operations</h3>
          <p className="mt-3 text-sm text-slate-300">
            College admin now gets direct buttons for add, update, delete, and review flows through the role-aware CRUD workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/dashboard/workspace?resource=users&mode=create">Add User</Button>
            <Button href="/dashboard/workspace?resource=departments&mode=create" variant="secondary">
              Add Department
            </Button>
            <Button href="/dashboard/workspace?resource=events&mode=create" variant="secondary">
              Create Event
            </Button>
            <Button href="/dashboard/notifications" variant="ghost">
              Push Notification
            </Button>
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Admin workflow</div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Manage users and faculty</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Create departments and events</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Review complaints and reports</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Monitor college project activity</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Faculty mentorship pipeline",
              text: "Approve, update, and manage faculty-linked resources from one admin console.",
              href: "/dashboard/workspace?resource=users"
            },
            {
              title: "Placement-ready project board",
              text: "Create and curate projects, applications, and team formation records.",
              href: "/dashboard/workspace?resource=projects"
            },
            {
              title: "Department analytics and growth heatmap",
              text: "Keep department data, events, and reports clean through fast CRUD actions.",
              href: "/dashboard/workspace?resource=departments"
            }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white">{item.title}</div>
              <div className="mt-2 text-sm text-slate-300">{item.text}</div>
              <Button href={item.href} variant="ghost" className="mt-4 px-0 py-0 text-cyan-200 hover:bg-transparent">
                Open Workspace
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
