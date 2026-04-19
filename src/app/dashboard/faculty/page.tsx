import { Card, SectionTitle, StatCard } from "@/components/ui";
import { requireDashboardRole } from "@/lib/dashboard-guards";

const stats = [
  { label: "Mentoring teams", value: "16" },
  { label: "Pending reviews", value: "9" },
  { label: "Research projects", value: "7" },
  { label: "Student rating avg", value: "4.6" }
];

export default async function FacultyDashboardPage() {
  await requireDashboardRole(["faculty", "college_admin", "super_admin"]);
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
        {[
          "Approve or reject project proposals",
          "Post opportunities and internal calls",
          "Analyze mentee performance trends"
        ].map((item) => (
          <Card key={item}>
            <p className="text-sm text-slate-200">{item}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
