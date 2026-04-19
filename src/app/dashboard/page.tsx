import { Brain, Building2, LineChart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Card, SectionTitle, StatCard } from "@/components/ui";

const stats = [
  { label: "Active tenants", value: "38" },
  { label: "Realtime rooms", value: "412" },
  { label: "AI recommendations", value: "8,214" },
  { label: "Risk alerts", value: "11" }
];

const modules = [
  { title: "Federated tenants", description: "Shared DB and premium isolation modes with request-level guards.", icon: Building2 },
  { title: "AI graph engine", description: "Recommendations for teams, projects, mentors, and internships.", icon: Brain },
  { title: "Trust and safety", description: "Audit logs, abuse scoring, and suspicious device tracking.", icon: ShieldCheck },
  { title: "Live collaboration", description: "Chat, rooms, tasks, docs, and notifications with realtime sync.", icon: Users },
  { title: "Growth telemetry", description: "College analytics, adoption funnels, and revenue-ready SaaS metrics.", icon: LineChart },
  { title: "Hackathon mode", description: "Live team formation, demo-day workflows, and auto certificate issuance.", icon: Sparkles }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <SectionTitle
            eyebrow="Platform overview"
            title="Campus Nexus control center"
            description="A premium demo shell for the federated SaaS vision. Each section is structured to match a production multi-tenant product even before backend integrations are switched on."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title}>
            <module.icon className="h-6 w-6 text-cyan-300" />
            <h3 className="mt-4 text-lg font-semibold">{module.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">{module.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
