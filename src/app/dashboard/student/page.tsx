import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { GradientBarChart } from "@/components/dashboard-charts";
import { StudentRecommendationsPanel } from "@/components/student-recommendations-panel";

const opportunities = [
  "AI Mentor Mesh",
  "Federated Research Vault",
  "Campus Startup Sprint",
  "Open Source Collaboration Room"
];

export default function StudentDashboardPage() {
  const progress = [
    { label: "Backend", value: 84 },
    { label: "Realtime", value: 76 },
    { label: "AI", value: 68 },
    { label: "Portfolio", value: 91 }
  ];

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Student hub"
        title="Your AI-powered collaboration cockpit"
        description="Recommended teammates, open projects, skill growth, tasks, and opportunities are surfaced here with a live, demo-friendly product feel."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Student actions</div>
              <h3 className="mt-2 text-2xl font-semibold text-white">Build profile, explore projects, and apply faster</h3>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Students get recommendation-led discovery plus self-service actions for profile updates, project applications, and task follow-up.
              </p>
            </div>
            <Badge>Role: Student</Badge>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/dashboard/projects">Browse Projects</Button>
            <Button href="/dashboard/workspace?resource=profiles&mode=create" variant="secondary">
              Update Profile
            </Button>
            <Button href="/dashboard/workspace?resource=applications" variant="secondary">
              My Applications
            </Button>
            <Button href="/dashboard/notifications" variant="ghost">
              View Alerts
            </Button>
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Student workflow</div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">1. Build skill profile</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">2. Get AI team suggestions</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">3. Apply to projects</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">4. Track tasks and chats</div>
          </div>
        </Card>
      </div>

      <StudentRecommendationsPanel />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recommended teams</h3>
            <Badge>94% match</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {opportunities.map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-white">{item}</div>
                  <div className="text-xs text-cyan-200">Top {index + 1}</div>
                </div>
                <div className="mt-2 text-sm text-slate-300">Balanced skill coverage, mentor fit, and delivery probability.</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Skill growth</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div>Backend systems: 84%</div>
            <div>Realtime collaboration: 76%</div>
            <div>AI product thinking: 68%</div>
            <div>Portfolio readiness: 91%</div>
          </div>
          <div className="mt-4">
            <GradientBarChart
              data={progress.map((item) => ({ area: item.label, score: item.value }))}
              dataKey="score"
              xKey="area"
              color="#22C55E"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
