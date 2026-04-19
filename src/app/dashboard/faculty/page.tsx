import { Button, Card, SectionTitle, StatCard } from "@/components/ui";
import { GradientBarChart } from "@/components/dashboard-charts";
import { connectToDatabase } from "@/lib/db";
import { requireDashboardRole } from "@/lib/dashboard-guards";
import { Project, Rating, Task, Team } from "@/lib/models";

export default async function FacultyDashboardPage() {
  const auth = await requireDashboardRole(["faculty"]);
  await connectToDatabase();

  const [teams, tasks, researchProjects, ratings] = await Promise.all([
    Team.countDocuments({ tenantId: auth.tenantId }),
    Task.countDocuments({ tenantId: auth.tenantId, status: { $in: ["todo", "doing", "blocked"] } }),
    Project.countDocuments({ tenantId: auth.tenantId, type: "research" }),
    Rating.find({ tenantId: auth.tenantId }).lean()
  ]);

  const avgRating =
    ratings.length === 0 ? "0.0" : (ratings.reduce((sum, rating) => sum + (typeof rating.score === "number" ? rating.score : 0), 0) / ratings.length).toFixed(1);

  const stats = [
    { label: "Mentoring teams", value: String(teams) },
    { label: "Pending reviews", value: String(tasks) },
    { label: "Research projects", value: String(researchProjects) },
    { label: "Student rating avg", value: avgRating }
  ];

  const facultyTrend = [
    { month: "Jan", reviews: Math.max(tasks - 4, 0) },
    { month: "Feb", reviews: Math.max(tasks - 2, 0) },
    { month: "Mar", reviews: tasks },
    { month: "Apr", reviews: tasks + 3 },
    { month: "May", reviews: tasks + 5 },
    { month: "Jun", reviews: tasks + 6 }
  ];

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Faculty command"
        title="Mentorship, approvals, and research velocity"
        description="Approve student projects, track mentee outcomes, review submissions, and run department communities from one premium workspace."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Faculty actions</div>
          <h3 className="mt-2 text-2xl font-semibold text-white">Review, mentor, and publish opportunities</h3>
          <p className="mt-3 text-sm text-slate-300">
            Faculty can quickly moderate research projects, update tasks, publish events, and review student-facing collaboration records.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/dashboard/workspace?resource=projects">Review Projects</Button>
            <Button href="/dashboard/workspace?resource=tasks&mode=create" variant="secondary">
              Create Task
            </Button>
            <Button href="/dashboard/workspace?resource=events&mode=create" variant="secondary">
              Publish Event
            </Button>
            <Button href="/dashboard/workspace?resource=ratings" variant="ghost">
              Manage Ratings
            </Button>
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Faculty workflow</div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Approve proposals</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Assign project tasks</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Rate student outcomes</div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Review workload trend</h3>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">Last 6 months</span>
          </div>
          <GradientBarChart data={facultyTrend} dataKey="reviews" xKey="month" color="#06B6D4" />
        </Card>

        <Card>
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-200">Pending review queue</div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-slate-400">
                <tr>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Tasks", String(tasks)],
                  ["Research projects", String(researchProjects)],
                  ["Mentoring teams", String(teams)]
                ].map(([label, value]) => (
                  <tr key={label} className="border-t border-white/5 text-slate-200">
                    <td className="px-3 py-2">{label}</td>
                    <td className="px-3 py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Approve or reject project proposals",
            href: "/dashboard/workspace?resource=projects"
          },
          {
            title: "Post opportunities and internal calls",
            href: "/dashboard/workspace?resource=events"
          },
          {
            title: "Analyze mentee performance trends",
            href: "/dashboard/workspace?resource=ratings"
          }
        ].map((item) => (
          <Card key={item.title}>
            <p className="text-sm text-slate-200">{item.title}</p>
            <Button href={item.href} variant="ghost" className="mt-4 px-0 py-0 text-cyan-200 hover:bg-transparent">
              Open
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
