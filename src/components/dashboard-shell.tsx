import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import AuthActions from "@/components/AuthActions";
import RoleNav from "@/components/RoleNav";

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
          <RoleNav />
          <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
            AI teammate finder, cross-college rooms, and tenant-safe analytics are active in this demo shell.
          </div>
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4">
            <AuthActions compact />
          </div>
        </aside>
        <main className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-xl lg:p-6">{children}</main>
      </div>
    </div>
  );
}
