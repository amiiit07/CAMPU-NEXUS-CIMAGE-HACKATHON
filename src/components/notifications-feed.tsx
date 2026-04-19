"use client";

import { useMemo, useState, useTransition } from "react";
import { Bell, CheckCheck, Megaphone, RefreshCcw, Send } from "lucide-react";
import { Badge, Button, Card, Input, SectionTitle, Textarea } from "@/components/ui";

type NotificationItem = {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt?: string | null;
};

type TenantOption = {
  id: string;
  name: string;
};

type NotificationResponse = {
  ok: boolean;
  data?: {
    items?: NotificationItem[];
    delivered?: number;
    colleges?: TenantOption[];
  };
  error?: {
    message?: string;
  };
};

export function NotificationsFeed({
  initialItems,
  role,
  currentTenantId,
  currentTenantName,
  tenantOptions
}: {
  initialItems: NotificationItem[];
  role: string;
  currentTenantId: string;
  currentTenantName: string;
  tenantOptions: TenantOption[];
}) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"my_college" | "all_colleges" | "specific_college">(
    role === "super_admin" ? "all_colleges" : "my_college"
  );
  const [selectedTenantId, setSelectedTenantId] = useState(currentTenantId);

  const canBroadcast = role === "college_admin" || role === "super_admin";
  const unreadCount = items.filter((item) => !item.read).length;

  const broadcastLabel = useMemo(() => {
    if (role === "college_admin") {
      return `Send to all users in ${currentTenantName}`;
    }
    if (target === "all_colleges") {
      return "Send to all colleges";
    }
    if (target === "specific_college") {
      const selected = tenantOptions.find((tenant) => tenant.id === selectedTenantId);
      return `Send to ${selected?.name ?? "selected college"}`;
    }
    return `Send to all users in ${currentTenantName}`;
  }, [currentTenantName, role, selectedTenantId, target, tenantOptions]);

  async function refresh() {
    setError(null);
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const payload = (await response.json()) as NotificationResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to fetch notifications.");
      }
      setItems(payload.data?.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch notifications.");
    }
  }

  async function markAllRead() {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/notifications", { method: "PUT" });
      const payload = (await response.json()) as NotificationResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to update notifications.");
      }
      startTransition(() => {
        setItems((current) => current.map((item) => ({ ...item, read: true })));
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update notifications.");
    }
  }

  async function sendBroadcast() {
    if (!title.trim() || !body.trim()) {
      setError("Title and message are required.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const payloadBody =
        role === "super_admin"
          ? { title, body, target, tenantId: target === "specific_college" ? selectedTenantId : undefined }
          : { title, body, target: "my_college" as const };

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payloadBody)
      });
      const payload = (await response.json()) as NotificationResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to send notifications.");
      }

      const delivered = payload.data?.delivered ?? 0;
      setSuccess(`Notification sent successfully to ${delivered} users.`);
      setTitle("");
      setBody("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send notifications.");
    }
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Notifications"
        title="Realtime platform alerts"
        description="Your live notification feed is connected to the API, and admins can now push broadcast notifications in one click."
      />

      {canBroadcast ? (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-200">
                <Megaphone className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.22em]">Broadcast console</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {role === "super_admin" ? "Push notifications across colleges" : "Push notifications to your college"}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {role === "super_admin"
                  ? "Send one-click alerts to all colleges or target a specific college."
                  : "Send one-click alerts to everyone inside your college tenant."}
              </p>
            </div>
            <Badge>{role === "super_admin" ? "Global sender" : "College sender"}</Badge>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Notification title" />
            {role === "super_admin" ? (
              <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                <select
                  value={target}
                  onChange={(event) => setTarget(event.target.value as "my_college" | "all_colleges" | "specific_college")}
                  className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
                >
                  <option value="all_colleges">All colleges</option>
                  <option value="specific_college">Specific college</option>
                  <option value="my_college">My college</option>
                </select>
                <select
                  value={selectedTenantId}
                  onChange={(event) => setSelectedTenantId(event.target.value)}
                  disabled={target !== "specific_college"}
                  className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition disabled:opacity-50 focus:border-cyan-300/70"
                >
                  {tenantOptions.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                Target: all users in {currentTenantName}
              </div>
            )}
          </div>

          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write your broadcast message here..."
            className="mt-4 h-32"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-300">{broadcastLabel}</div>
            <Button onClick={() => void sendBroadcast()} disabled={pending || !title.trim() || !body.trim()}>
              <Send className="h-4 w-4" />
              Send Broadcast
            </Button>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Feed summary</div>
            <h3 className="mt-2 text-lg font-semibold text-white">{items.length} alerts loaded</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge>{unreadCount} unread</Badge>
            <Button onClick={() => void refresh()} variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => void markAllRead()}>
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </Button>
          </div>
        </div>
        {error ? <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}
        {success ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{success}</div> : null}
      </Card>

      <div className="space-y-4">
        {items.length === 0 ? (
          <Card>
            <div className="flex items-center gap-3 text-slate-300">
              <Bell className="h-5 w-5 text-cyan-200" />
              No alerts yet. Send a chat message, apply to a project, or push a broadcast.
            </div>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item._id} className={item.read ? "" : "border-cyan-300/20 bg-cyan-400/5"}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.body}</p>
                </div>
                <Badge className={item.read ? "" : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"}>
                  {item.read ? "Read" : "New"}
                </Badge>
              </div>
              <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recent"}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
