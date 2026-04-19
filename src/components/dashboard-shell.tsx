"use client";

import { useState, type ReactNode } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import AuthActions from "@/components/AuthActions";
import RoleNav from "@/components/RoleNav";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.2),_transparent_34%),linear-gradient(180deg,#030712_0%,#0f172a_45%,#111827_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] gap-4 px-3 py-4 lg:gap-6 lg:px-6">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="fixed left-3 top-3 z-40 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 text-slate-200 backdrop-blur lg:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {open ? <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden" /> : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[290px] -translate-x-full overflow-y-auto border-r border-white/10 bg-slate-950/90 p-5 backdrop-blur-2xl transition-transform duration-300 lg:static lg:z-10 lg:min-h-[calc(100vh-2rem)] lg:translate-x-0 lg:rounded-3xl lg:border lg:bg-white/5 ${open ? "translate-x-0" : ""}`}
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">Campus Nexus</div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Federated SaaS</div>
            </div>
          </div>
          <RoleNav onNavigate={() => setOpen(false)} />
          <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-brand-purple/15 p-4 text-sm text-cyan-50">
            AI teammate finder, cross-college rooms, and tenant-safe analytics are active in this demo shell.
          </div>
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4">
            <AuthActions compact />
          </div>
        </aside>

        <main className="flex min-h-[calc(100vh-2rem)] w-full flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-glow backdrop-blur-xl lg:p-5">
          <DashboardTopbar />
          <div className="h-full overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/20 p-3 lg:p-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
