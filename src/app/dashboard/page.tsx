import Link from "next/link";
import { Brain, Building2, LineChart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Card, SectionTitle, StatCard } from "@/components/ui";
import { GradientBarChart, SplitPieChart, TrendAreaChart } from "@/components/dashboard-charts";
import { getServerAuthContext } from "@/lib/server-auth";

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

const roleWorkflow: Record<string, { title: string; bullets: string[]; ctaHref: string; cta: string }> = {
  student: {
    title: "Student workflow",
    bullets: ["Build profile and skills", "Apply to projects", "Track tasks, chat, and ratings"],
    ctaHref: "/dashboard/student",
    cta: "Open Student Hub"
  },
  faculty: {
    title: "Faculty workflow",
    bullets: ["Approve and mentor projects", "Review submissions", "Publish opportunities"],
    ctaHref: "/dashboard/faculty",
    cta: "Open Faculty Desk"
  },
  college_admin: {
    title: "College admin workflow",
    bullets: ["Manage users and departments", "Moderate reports", "Monitor analytics and events"],
    ctaHref: "/dashboard/admin",
    cta: "Open Admin Console"
  },
  super_admin: {
    title: "Super admin workflow",
    bullets: ["Manage all tenants", "Control subscriptions and broadcasts", "Audit global security"],
    ctaHref: "/dashboard/super-admin",
    cta: "Open Global Control"
  },
  startup: {
    title: "Startup workflow",
    bullets: ["Post opportunities", "Review applications", "Build cross-college teams"],
    ctaHref: "/dashboard/projects",
    cta: "Open Project Board"
  }
};

export default async function DashboardPage() {
  const auth = await getServerAuthContext();
  const workflow = roleWorkflow[auth?.role ?? "student"];

  const monthly = [
    { name: "Jan", users: 420, projects: 120 },
    { name: "Feb", users: 510, projects: 162 },
    { name: "Mar", users: 580, projects: 205 },
    { name: "Apr", users: 640, projects: 248 },
    { name: "May", users: 690, projects: 280 },
    { name: "Jun", users: 760, projects: 324 }
  ];

  const split = [
    { name: "Students", value: 62 },
    { name: "Faculty", value: 18 },
    { name: "Admins", value: 12 },
    { name: "Startups", value: 8 }
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <SectionTitle
            eyebrow="Platform overview"
            title="Campus Nexus control center"
            description="Enterprise-ready role-aware shell with tenant isolation, centralized RBAC policy, generic CRUD APIs, and modular workflows for every actor."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Active role</div>
          <h3 className="mt-2 text-2xl font-semibold text-white">{auth?.role ?? "guest"}</h3>
          <p className="mt-3 text-sm text-slate-300">{workflow.title}</p>
          <div className="mt-4 space-y-2 text-sm text-slate-200">
            {workflow.bullets.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Link href={workflow.ctaHref} className="mt-5 inline-flex rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900">
            {workflow.cta}
          </Link>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Unified operations</div>
          <h3 className="mt-2 text-lg font-semibold text-white">RBAC CRUD studio</h3>
          <p className="mt-3 text-sm text-slate-300">
            Every core entity now supports create, read, update, and delete through a role-scoped API with tenant safety.
          </p>
          <Link href="/dashboard/workspace" className="mt-5 inline-flex rounded-full border border-white/20 px-5 py-2 text-sm text-white">
            Open CRUD Studio
          </Link>
        </Card>
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

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Adoption trend</h3>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">Monthly active users</span>
          </div>
          <TrendAreaChart data={monthly} dataKey="users" xKey="name" color="#7C3AED" />
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Role split</h3>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">Current usage</span>
          </div>
          <SplitPieChart data={split} dataKey="value" nameKey="name" />
        </Card>
      </section>

      <section>
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Project throughput</h3>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">Generated monthly</span>
          </div>
          <GradientBarChart data={monthly} dataKey="projects" xKey="name" color="#06B6D4" />
        </Card>
      </section>
    </div>
  );
}
