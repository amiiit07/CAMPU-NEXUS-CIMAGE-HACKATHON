import { Badge, Card, SectionTitle } from "@/components/ui";

const opportunities = [
  "AI Mentor Mesh",
  "Federated Research Vault",
  "Campus Startup Sprint",
  "Open Source Collaboration Room"
];

export default function StudentDashboardPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Student hub"
        title="Your AI-powered collaboration cockpit"
        description="Recommended teammates, open projects, skill growth, tasks, and opportunities are surfaced here with a live, demo-friendly product feel."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
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
        </Card>
      </div>
    </div>
  );
}
