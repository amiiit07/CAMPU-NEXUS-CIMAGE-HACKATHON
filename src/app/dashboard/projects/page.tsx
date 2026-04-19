import { Card, SectionTitle } from "@/components/ui";

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Project rooms"
        title="Shared innovation workspace"
        description="Idea, proposal, team formation, sprint mode, demo day, completion, and rating are all modeled as a lifecycle."
      />
      <Card>
        <div className="text-sm text-slate-300">
          Project boards, task allocation, shared docs, file attachments, and success prediction panels belong here.
        </div>
      </Card>
    </div>
  );
}
