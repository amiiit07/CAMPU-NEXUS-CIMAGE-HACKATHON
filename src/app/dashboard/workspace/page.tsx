"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, RefreshCcw, Save, Trash2, WandSparkles } from "lucide-react";
import { Button, Card, DataTable, Input, Modal, SectionTitle, Textarea } from "@/components/ui";

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
    item?: Record<string, unknown>;
    scope?: string;
    total?: number;
  };
  error?: {
    message?: string;
  };
};

const resourceTemplates: Record<Resource, Record<string, unknown>> = {
  users: { name: "New User", email: "new.user@campusnexus.dev", role: "student", status: "active" },
  profiles: { headline: "Full stack builder", bio: "Interested in AI and collaboration systems.", availability: "open" },
  skills: { name: "Next.js", category: "Web" },
  projects: { title: "Campus Collaboration Sprint", summary: "Build a team-ready campus product.", type: "project", stage: "team_forming" },
  applications: { projectId: "", userId: "", status: "applied" },
  teams: { name: "Launch Crew", projectId: "" },
  tasks: { title: "Create MVP wireframes", description: "Prepare role-based dashboard drafts.", status: "todo" },
  rooms: { title: "Project War Room", type: "project" },
  messages: { roomId: "", text: "Hello team" },
  ratings: { subjectId: "", score: 5, category: "teamwork" },
  notifications: { title: "Platform Update", body: "New dashboard controls are now live." },
  events: { title: "Innovation Meetup", description: "Cross-college collaboration meetup.", eventType: "workshop", status: "draft" },
  tenants: { slug: "new-campus", name: "New Campus", subdomain: "new-campus", isolationMode: "shared" },
  departments: { name: "Computer Science", code: "CSE", status: "active" },
  reports: { targetType: "project", targetId: "", reason: "Needs admin review", status: "open" }
};

const resourceDescriptions: Record<Resource, string> = {
  users: "Manage role assignments, user onboarding, and account status.",
  profiles: "Maintain personal profiles, skills, and visibility data.",
  skills: "Create skill tags for search and recommendation inputs.",
  projects: "Create and curate project boards, stages, and summaries.",
  applications: "Track who applied to which project and current status.",
  teams: "Manage team groups formed around project collaboration.",
  tasks: "Assign and update delivery tasks for teams and mentors.",
  rooms: "Create collaboration rooms for project or group chat.",
  messages: "Inspect chat content for support and moderation workflows.",
  ratings: "Record and moderate peer or mentor rating entries.",
  notifications: "Broadcast alerts and platform activity notifications.",
  events: "Publish workshops, hackathons, and internal announcements.",
  tenants: "Manage colleges and platform tenants globally.",
  departments: "Keep academic department data organized and current.",
  reports: "Review abuse, moderation, or platform support reports."
};

function isResource(value: string | null): value is Resource {
  return value !== null && (resources as readonly string[]).includes(value);
}

function toPrettyJson(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2);
}

function toEditablePayload(value: Record<string, unknown>) {
  const entries = Object.entries(value).filter(([key]) => !["_id", "__v", "createdAt", "updatedAt"].includes(key));
  return Object.fromEntries(entries);
}

export default function WorkspaceCrudPage() {
  const searchParams = useSearchParams();
  const [resource, setResource] = useState<Resource>("projects");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [scope, setScope] = useState<string>("-");
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [payload, setPayload] = useState(toPrettyJson(resourceTemplates.projects));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const fields = useMemo(() => {
    const keys = new Set<string>();
    items.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!["__v"].includes(key)) {
          keys.add(key);
        }
      });
    });
    return Array.from(keys).slice(0, 6);
  }, [items]);

  function resetEditor(nextResource: Resource) {
    setEditingId(null);
    setPayload(toPrettyJson(resourceTemplates[nextResource]));
  }

  function openEditorForCreate() {
    resetEditor(resource);
    setEditorOpen(true);
    setError(null);
    setSuccess(null);
  }

  async function load() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/crud/${resource}?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = (await res.json()) as ApiResp;
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message ?? "Failed to load");
      }
      setItems(data.data?.items ?? []);
      setScope(data.data?.scope ?? "-");
      setTotal(data.data?.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function saveItem() {
    setError(null);
    setSuccess(null);

    try {
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/crud/${resource}/${editingId}` : `/api/crud/${resource}`;

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed)
      });

      const data = (await res.json()) as ApiResp;
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message ?? `${editingId ? "Update" : "Create"} failed`);
      }

      setSuccess(editingId ? "Record updated successfully." : "Record created successfully.");
      resetEditor(resource);
      setEditorOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm("Delete this record? This action cannot be undone from the dashboard.");
    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/crud/${resource}/${id}`, { method: "DELETE" });
      const data = (await res.json()) as ApiResp;
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message ?? "Delete failed");
      }

      if (editingId === id) {
        resetEditor(resource);
      }
      setSuccess("Record deleted successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function startEditing(row: Record<string, unknown>) {
    const rowId = String(row._id ?? "");
    setEditingId(rowId || null);
    setPayload(toPrettyJson(toEditablePayload(row)));
    setSuccess(null);
    setError(null);
    setEditorOpen(true);
  }

  useEffect(() => {
    const queryResource = searchParams.get("resource");
    if (isResource(queryResource) && queryResource !== resource) {
      setResource(queryResource);
      resetEditor(queryResource);
    }

    if (searchParams.get("mode") === "create" && !editingId) {
      const targetResource = isResource(queryResource) ? queryResource : resource;
      resetEditor(targetResource);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    resetEditor(resource);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Enterprise CRUD"
        title="Role-aware data workspace"
        description="Use this cockpit to create, update, and delete tenant-safe records. Backend RBAC still decides exactly what each role can perform."
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="grid gap-3 md:grid-cols-[220px_1fr_auto_auto]">
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
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search records"
            />
            <Button onClick={() => void load()} variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openEditorForCreate}>
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-cyan-200">
            <span>Current scope: {scope}</span>
            <span>Total records: {total}</span>
          </div>
          <p className="mt-4 text-sm text-slate-300">{resourceDescriptions[resource]}</p>
        </Card>

        <Card>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Quick actions</div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Choose a resource from the dropdown.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Click any row to load it for edit mode.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Use save to create or update the selected record.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Delete appears on every row when permitted by RBAC.</div>
          </div>
        </Card>
      </div>

      <Card className="hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">{editingId ? "Edit mode" : "Create mode"}</div>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {editingId ? `Editing ${resource} record` : `Create ${resource} record`}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                resetEditor(resource);
                setSuccess(null);
                setError(null);
              }}
              variant="secondary"
            >
              <WandSparkles className="h-4 w-4" />
              Use Template
            </Button>
            <Button onClick={() => void saveItem()}>
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Update Record" : "Create Record"}
            </Button>
          </div>
        </div>
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          className="mt-4 h-64 w-full rounded-2xl border border-white/15 bg-slate-950/60 p-4 text-xs text-slate-200"
        />
        {error ? <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}
        {success ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{success}</div> : null}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Records {loading ? "(loading...)" : ""}</h3>
          <div className="text-sm text-slate-300">Click edit to load any row into the editor, or delete it directly from the table.</div>
        </div>
        <DataTable className="mt-4">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur">
              <tr className="border-b border-white/10 text-slate-400">
                {fields.map((field) => (
                  <th key={field} className="px-2 py-2 font-medium">
                    {field}
                  </th>
                ))}
                <th className="px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 1} className="px-2 py-6 text-center text-slate-400">
                    No records found for this resource.
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const rowId = String(row._id ?? idx);
                  const selected = editingId === rowId;

                  return (
                    <tr key={rowId} className={`border-b border-white/5 align-top transition hover:bg-white/5 ${selected ? "bg-cyan-400/5" : ""}`}>
                      {fields.map((field) => (
                        <td key={field} className="max-w-[220px] px-2 py-2 text-slate-200">
                          <div className="truncate">
                            {typeof row[field] === "object" ? JSON.stringify(row[field]) : String(row[field] ?? "")}
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => startEditing(row)} variant="secondary" className="rounded-xl px-3 py-2 text-xs">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => void deleteItem(rowId)}
                            variant="ghost"
                            className="rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-200 hover:bg-rose-400/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </DataTable>
      </Card>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId ? `Edit ${resource}` : `Create ${resource}`}
        description="JSON editor modal for create/update operations. Existing backend validation and RBAC remain unchanged."
      >
        <div className="space-y-4">
          <Textarea value={payload} onChange={(event) => setPayload(event.target.value)} className="h-72 text-xs" />
          {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}
          {success ? <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{success}</div> : null}
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>
              Close
            </Button>
            <Button onClick={() => void saveItem()}>
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Update Record" : "Create Record"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
