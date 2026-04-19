"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Viewer = {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  name: string;
};

export default function AuthActions({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!active) {
          return;
        }
        if (!response.ok) {
          setViewer(null);
          setLoading(false);
          return;
        }
        const payload = await response.json();
        setViewer(payload?.data?.user ?? null);
      } catch {
        setViewer(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setViewer(null);
    router.refresh();
    router.push("/login");
  }

  if (loading) {
    return <div className="text-xs text-slate-400">Checking session...</div>;
  }

  if (!viewer) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300 hover:text-white"
      >
        Login
      </Link>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "flex items-center gap-3"}>
      <div className="text-xs text-slate-300">
        Signed in: <span className="font-semibold text-white">{viewer.email}</span>
      </div>
      <button
        onClick={onLogout}
        className="inline-flex items-center rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Logout
      </button>
    </div>
  );
}
