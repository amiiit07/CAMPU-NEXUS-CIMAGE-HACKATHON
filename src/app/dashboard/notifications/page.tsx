import { Card, SectionTitle } from "@/components/ui";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Notifications"
        title="Realtime platform alerts"
        description="Mentor invites, project updates, task reminders, reputation changes, and abuse signals are surfaced in one stream."
      />
      <Card>
        <div className="text-sm text-slate-300">Notification feed connected to Redis-backed queues and realtime delivery hooks.</div>
      </Card>
    </div>
  );
}
