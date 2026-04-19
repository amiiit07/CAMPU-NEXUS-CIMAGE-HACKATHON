"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, SectionTitle } from "@/components/ui";

const resources = [
  "users",
  "profiles",
  "skills",
  "projects",
  "applications",
  "teams",
  "tasks",
  "rooms",
  "messages",
  "ratings",
  "notifications",
  "events",
  "tenants",
  "departments",
  "reports"
] as const;

type Resource = (typeof resources)[number];

type ApiResp = {
  ok: boolean;
  data?: {
    items?: Record<string, unknown>[];
    scope?: string;
    total?: number;
  };
  error?: {
    message?: string;
  };
};

export default function WorkspaceCrudPage() {
  const [resource, setResource] = useState<Resource>("projects");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [scope, setScope] = useState<string>("-");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [payload, setPayload] = useState('{\n  "title": "New Item"\n}');
  const [error, setError] = useState<string | null>(null);

  const fields = useMemo(() => {
    const first = items[0] ?? {};
    return Object.keys(first).slice(0, 8);
  }, [items]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/crud/${resource}?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = (await res.json()) as ApiResp;
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message ?? "Failed to load");
      }
      setItems(data.data?.items ?? []);
      setScope(data.data?.scope ?? "-");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function createItem() {
    setError(null);
    try {
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      const res = await fetch(`/api/crud/${resource}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const data = (await res.json()) as ApiResp;
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message ?? "Create failed");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Enterprise CRUD"
        title="Role-aware data workspace"
        description="Use this single cockpit to manage every tenant resource. RBAC, tenant isolation, and ownership scopes are enforced by backend policy."
      />

      <Card>
        <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
          <select
            value={resource}
            onChange={(event) => setResource(event.target.value as Resource)}
            className="rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white"
          >
            {resources.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search"
            className="rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white"
          />
          <button onClick={() => void load()} className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900">
            Refresh
          </button>
        </div>
        <div className="mt-3 text-xs uppercase tracking-[0.2em] text-cyan-200">Current scope: {scope}</div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Quick create payload</h3>
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          className="mt-3 h-40 w-full rounded-2xl border border-white/15 bg-slate-950/60 p-3 text-xs text-slate-200"
        />
        <button onClick={() => void createItem()} className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15">
          Create record
        </button>
        {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Records {loading ? "(loading...)" : ""}</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                {fields.map((field) => (
                  <th key={field} className="px-2 py-2 font-medium">
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={String(row._id ?? idx)} className="border-b border-white/5 align-top">
                  {fields.map((field) => (
                    <td key={field} className="px-2 py-2 text-slate-200">
                      {typeof row[field] === "object" ? JSON.stringify(row[field]) : String(row[field] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
