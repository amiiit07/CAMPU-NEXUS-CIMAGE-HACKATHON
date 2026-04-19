"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
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
  { href: "/dashboard/student", label: "Student Hub", icon: Users, roles: ["student", "startup"] },
  { href: "/dashboard/faculty", label: "Faculty", icon: Sparkles, roles: ["faculty"] },
  { href: "/dashboard/admin", label: "College Admin", icon: ShieldCheck, roles: ["college_admin"] },
  { href: "/dashboard/super-admin", label: "Super Admin", icon: ShieldCheck, roles: ["super_admin"] },
  { href: "/dashboard/projects", label: "Projects", icon: Rocket, roles: ["student", "faculty", "college_admin", "super_admin", "startup"] },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell, roles: ["student", "faculty", "college_admin", "super_admin", "startup"] },
  { href: "/dashboard/workspace", label: "CRUD Studio", icon: Wrench, roles: ["student", "faculty", "college_admin", "super_admin", "startup"] }
];

export default function RoleNav({ onNavigate }: { onNavigate?: () => void }) {
  const [role, setRole] = useState<NavRole | null>(null);
  const pathname = usePathname();

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
        <motion.div key={item.href} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm transition",
              pathname === item.href
                ? "border border-cyan-300/35 bg-gradient-to-r from-cyan-400/20 to-brand-purple/20 text-white shadow-glow-cyan"
                : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/8 hover:text-white"
            )}
          >
            <item.icon className={cn("h-4 w-4", pathname === item.href ? "text-cyan-100" : "text-cyan-300")} />
            {item.label}
            {pathname === item.href ? <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-cyan-300" /> : null}
          </Link>
        </motion.div>
      ))}
    </nav>
  );
}
