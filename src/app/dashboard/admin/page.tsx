import { Card, SectionTitle } from "@/components/ui";

const tenantRows = [
  ["Total colleges", "128"],
  ["New this month", "+18"],
  ["Engagement score", "82%"],
  ["Abuse reports", "3 open"]
];

export default function AdminDashboardPage() {
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
      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Faculty mentorship pipeline",
            "Placement-ready project board",
            "Department analytics and growth heatmap"
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
