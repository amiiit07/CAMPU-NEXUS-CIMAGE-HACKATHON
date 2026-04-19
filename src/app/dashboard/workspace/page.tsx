"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import { Button, Card, DataTable, Input, Modal, SectionTitle, Textarea } from "@/components/ui";
import { can, type Role } from "@/lib/rbac";

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

type MeResp = {
  ok: boolean;
  data?: {
    user?: {
      role?: Role;
    };
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

function cloneTemplate(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function toEditablePayload(value: Record<string, unknown>) {
  const entries = Object.entries(value).filter(([key]) => !["_id", "__v", "createdAt", "updatedAt"].includes(key));
  return Object.fromEntries(entries);
}

const numberFields = new Set(["score", "budget"]);
const booleanFields = new Set(["read"]);
const textareaFields = new Set(["summary", "description", "body", "bio", "reason", "text", "headline"]);

const fieldOptions: Partial<Record<string, string[]>> = {
  role: ["student", "faculty", "college_admin", "super_admin", "startup"],
  status: ["active", "pending", "suspended", "draft", "published", "archived", "open", "reviewing", "resolved", "applied", "accepted", "rejected", "waitlisted", "todo", "doing", "blocked", "done"],
  type: ["project", "startup", "research", "internship", "hackathon", "dm", "group", "voice"],
  stage: ["idea", "proposal", "team_forming", "sprint", "demo_day", "completed", "rated"],
  isolationMode: ["shared", "isolated", "schema"],
  eventType: ["hackathon", "announcement", "workshop", "internal"],
  targetType: ["project", "user", "message", "room"],
  availability: ["open", "limited", "offline"]
};

function normalizePayload(values: Record<string, unknown>) {
  const next: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(values)) {
    if (raw === "") {
      continue;
    }

    if (numberFields.has(key) && typeof raw === "string") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        next[key] = parsed;
      }
      continue;
    }

    if (booleanFields.has(key) && typeof raw === "string") {
      next[key] = raw === "true";
      continue;
    }

    if (Array.isArray(raw)) {
      next[key] = raw.filter((entry) => String(entry).trim().length > 0);
      continue;
    }

    next[key] = raw;
  }

  return next;
}

export default function WorkspaceCrudPage() {
  const searchParams = useSearchParams();
  const [resource, setResource] = useState<Resource>("projects");
  const [role, setRole] = useState<Role | null>(null);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [scope, setScope] = useState<string>("-");
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [formValues, setFormValues] = useState<Record<string, unknown>>(cloneTemplate(resourceTemplates.projects));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const visibleResources = useMemo(() => {
    if (!role) {
      return resources;
    }

    return resources.filter((item) => ["create", "read", "update", "delete"].some((action) => can(role, item, action as never)));
  }, [role]);

  const canReadCurrent = role ? can(role, resource, "read") : true;
  const canCreateCurrent = role ? can(role, resource, "create") : true;
  const canUpdateCurrent = role ? can(role, resource, "update") : true;
  const canDeleteCurrent = role ? can(role, resource, "delete") : true;

  const fields = useMemo(() => {
    const keys = new Set<string>();
    items.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "__v") {
          keys.add(key);
        }
      });
    });
    return Array.from(keys).slice(0, 6);
  }, [items]);

  function resetEditor(nextResource: Resource) {
    setEditingId(null);
    setFormValues(cloneTemplate(resourceTemplates[nextResource]));
  }

  function updateField(key: string, value: unknown) {
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  async function load() {
    if (!canReadCurrent) {
      setItems([]);
      setScope("none");
      setTotal(0);
      setError("This role cannot view the selected resource.");
      return;
    }

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

  async function loadRecordForEdit(targetResource: Resource, id: string) {
    if (role && !can(role, targetResource, "update")) {
      setError("This role cannot edit records for the selected resource.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/crud/${targetResource}/${id}`, { cache: "no-store" });
      const data = (await res.json()) as ApiResp;
      if (!res.ok || !data.ok || !data.data?.item) {
        throw new Error(data.error?.message ?? "Failed to load record for edit");
      }

      setEditingId(id);
      setFormValues(toEditablePayload(data.data.item));
      setEditorOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load record for edit");
    }
  }

  function openEditorForCreate() {
    if (!canCreateCurrent) {
      setError("This role cannot create records for the selected resource.");
      return;
    }

    resetEditor(resource);
    setEditorOpen(true);
    setError(null);
    setSuccess(null);
  }

  async function saveItem() {
    setError(null);
    setSuccess(null);

    if (editingId && !canUpdateCurrent) {
      setError("This role cannot update records for the selected resource.");
      return;
    }

    if (!editingId && !canCreateCurrent) {
      setError("This role cannot create records for the selected resource.");
      return;
    }

    try {
      const parsed = normalizePayload(formValues);
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
    if (!canDeleteCurrent) {
      setError("This role cannot delete records for the selected resource.");
      return;
    }

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
    if (!canUpdateCurrent) {
      setError("This role cannot edit records for the selected resource.");
      return;
    }

    const rowId = String(row._id ?? "");
    setEditingId(rowId || null);
    setFormValues(toEditablePayload(row));
    setSuccess(null);
    setError(null);
    setEditorOpen(true);
  }

  useEffect(() => {
    let cancelled = false;

    const loadRole = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as MeResp;
        if (!cancelled && payload.data?.user?.role) {
          setRole(payload.data.user.role);
        }
      } catch {
        // Ignore role fetch failures and keep the page usable.
      }
    };

    void loadRole();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (visibleResources.length === 0) {
      return;
    }

    if (!visibleResources.includes(resource)) {
      const nextResource = visibleResources[0];
      setResource(nextResource);
      resetEditor(nextResource);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, visibleResources]);

  useEffect(() => {
    const queryResource = searchParams.get("resource");
    const queryId = searchParams.get("id");
    const mode = searchParams.get("mode");
    const targetResource = isResource(queryResource) ? queryResource : resource;

    if (targetResource !== resource) {
      setResource(targetResource);
      resetEditor(targetResource);
    }

    if (mode === "create") {
      resetEditor(targetResource);
      setEditorOpen(true);
    }

    if (mode === "edit" && queryId) {
      void loadRecordForEdit(targetResource, queryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    resetEditor(resource);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, role]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Enterprise CRUD"
        title="Role-aware data workspace"
        description="Use this cockpit to create, update, and delete tenant-safe records. The page now hides actions that the current role is not allowed to perform."
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="grid gap-3 md:grid-cols-[220px_1fr_auto_auto]">
            <select
              value={resource}
              onChange={(event) => setResource(event.target.value as Resource)}
              className="rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white"
            >
              {visibleResources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search records" />
            <Button onClick={() => void load()} variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            {canCreateCurrent ? (
              <Button onClick={openEditorForCreate}>
                <Plus className="h-4 w-4" />
                New
              </Button>
            ) : null}
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Click any row to load it for edit mode when your role allows updates.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              {canCreateCurrent ? "Create is enabled for this resource." : "Create stays hidden for this resource because your role is read-only here."}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              {canDeleteCurrent ? "Delete buttons appear on every row when your role is allowed." : "Delete buttons are hidden when the role is not allowed."}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Records {loading ? "(loading...)" : ""}</h3>
          <div className="text-sm text-slate-300">Role-aware buttons now match backend RBAC, so invalid edit/delete actions stay hidden.</div>
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
                          <div className="truncate">{typeof row[field] === "object" ? JSON.stringify(row[field]) : String(row[field] ?? "")}</div>
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-2">
                          {canUpdateCurrent ? (
                            <Button onClick={() => startEditing(row)} variant="secondary" className="rounded-xl px-3 py-2 text-xs">
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          ) : null}
                          {canDeleteCurrent ? (
                            <Button
                              onClick={() => void deleteItem(rowId)}
                              variant="ghost"
                              className="rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-200 hover:bg-rose-400/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          ) : null}
                          {!canUpdateCurrent && !canDeleteCurrent ? <span className="px-2 py-2 text-xs text-slate-400">Read only</span> : null}
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
        description="Form-based editor for create/update operations. Backend RBAC still validates every action."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(formValues).map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="md:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{key}</label>
                    <Textarea
                      value={value.join(", ")}
                      onChange={(event) =>
                        updateField(
                          key,
                          event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                        )
                      }
                      className="h-24"
                      placeholder="Comma separated values"
                    />
                  </div>
                );
              }

              if (fieldOptions[key]) {
                return (
                  <div key={key}>
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{key}</label>
                    <select
                      value={String(value ?? "")}
                      onChange={(event) => updateField(key, event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-3 text-sm text-white"
                    >
                      <option value="">Select {key}</option>
                      {fieldOptions[key]?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (booleanFields.has(key)) {
                return (
                  <div key={key}>
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{key}</label>
                    <select
                      value={String(value ?? "false")}
                      onChange={(event) => updateField(key, event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-3 text-sm text-white"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                );
              }

              if (textareaFields.has(key)) {
                return (
                  <div key={key} className="md:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{key}</label>
                    <Textarea value={String(value ?? "")} onChange={(event) => updateField(key, event.target.value)} className="h-24" />
                  </div>
                );
              }

              return (
                <div key={key}>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{key}</label>
                  <Input
                    type={numberFields.has(key) ? "number" : "text"}
                    value={String(value ?? "")}
                    onChange={(event) => updateField(key, event.target.value)}
                  />
                </div>
              );
            })}
          </div>
          {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}
          {success ? <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{success}</div> : null}
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>
              Close
            </Button>
            <Button onClick={() => void saveItem()} disabled={editingId ? !canUpdateCurrent : !canCreateCurrent}>
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Update Record" : "Create Record"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
