"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

function toTitle(part: string) {
  return part
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function DashboardTopbar() {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const built: Array<{ href: string; label: string }> = [];

    for (let index = 0; index < parts.length; index += 1) {
      const href = `/${parts.slice(0, index + 1).join("/")}`;
      built.push({ href, label: toTitle(parts[index]) });
    }

    return built;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-xl lg:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <nav className="flex min-w-[200px] flex-1 flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
          <Link href="/dashboard" className="text-cyan-200 hover:text-cyan-100">
            Dashboard
          </Link>
          {crumbs.slice(1).map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-2">
              <span>/</span>
              <Link href={crumb.href} className="hover:text-slate-200">
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 sm:min-w-[260px] sm:flex-none">
            <Search className="h-4 w-4 text-cyan-200" />
            <input
              type="text"
              placeholder="Search dashboard"
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </label>
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-300" />
          </button>
          <ThemeToggle />
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-cyan text-sm font-semibold text-white shadow-glow-purple">
            CN
          </div>
        </div>
      </div>
    </header>
  );
}
