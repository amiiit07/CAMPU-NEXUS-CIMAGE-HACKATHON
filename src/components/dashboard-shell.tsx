import Link from "next/link";
import { LayoutDashboard, ShieldCheck, Sparkles, Users, Rocket, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin", label: "College Admin", icon: ShieldCheck },
  { href: "/dashboard/student", label: "Student Hub", icon: Users },
  { href: "/dashboard/projects", label: "Projects", icon: Rocket },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">Campus Nexus</div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Federated SaaS</div>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 text-cyan-300" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
            AI teammate finder, cross-college rooms, and tenant-safe analytics are active in this demo shell.
          </div>
        </aside>
        <main className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-xl lg:p-6">{children}</main>
      </div>
    </div>
  );
}
