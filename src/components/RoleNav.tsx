"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, LayoutDashboard, Rocket, ShieldCheck, Sparkles, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type NavRole = "student" | "faculty" | "college_admin" | "super_admin" | "startup";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: NavRole[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["student", "faculty", "college_admin", "super_admin", "startup"] },
  { href: "/dashboard/student", label: "Student Hub", icon: Users, roles: ["student", "faculty", "college_admin", "super_admin", "startup"] },
  { href: "/dashboard/faculty", label: "Faculty", icon: Sparkles, roles: ["faculty", "college_admin", "super_admin"] },
  { href: "/dashboard/admin", label: "College Admin", icon: ShieldCheck, roles: ["college_admin", "super_admin"] },
  { href: "/dashboard/super-admin", label: "Super Admin", icon: ShieldCheck, roles: ["super_admin"] },
  { href: "/dashboard/projects", label: "Projects", icon: Rocket, roles: ["student", "faculty", "college_admin", "super_admin", "startup"] },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell, roles: ["student", "faculty", "college_admin", "super_admin", "startup"] },
  { href: "/dashboard/workspace", label: "CRUD Studio", icon: Wrench, roles: ["student", "faculty", "college_admin", "super_admin", "startup"] }
];

export default function RoleNav() {
  const [role, setRole] = useState<NavRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          return;
        }
        const json = (await res.json()) as { data?: { user?: { role?: NavRole } } };
        if (!cancelled && json.data?.user?.role) {
          setRole(json.data.user.role);
        }
      } catch {
        // Ignore session fetch failures in nav.
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleItems = useMemo(() => {
    if (!role) {
      return navItems.filter((item) => item.href === "/dashboard");
    }
    return navItems.filter((item) => item.roles.includes(role));
  }, [role]);

  return (
    <nav className="space-y-2">
      {visibleItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white")}
        >
          <item.icon className="h-4 w-4 text-cyan-300" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
