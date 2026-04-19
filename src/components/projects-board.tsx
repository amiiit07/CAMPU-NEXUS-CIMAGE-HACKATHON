"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, LoaderCircle, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { Badge, Button, Card, Input, SectionTitle, Textarea } from "@/components/ui";

type ProjectItem = {
  _id: string;
  title: string;
  summary: string;
  type: string;
  stage: string;
  budget: number | null;
  timeline: string | null;
  successPrediction: number | null;
  requiredSkills: string[];
  ownerId: string;
  ownerName: string;
  applied: boolean;
  owned: boolean;
};

type ApiResponse = {
  ok: boolean;
  error?: {
    message?: string;
  };
};

export function ProjectsBoard({
  initialProjects,
  role
}: {
  initialProjects: ProjectItem[];
  role: string;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const canModerateProjects = ["college_admin", "faculty", "super_admin"].includes(role);

  async function refreshPage(message?: string) {
    startTransition(() => {
      router.refresh();
    });
    if (message) {
      setSuccess(message);
    }
  }

  async function createProject() {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          requiredSkills: skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          type: "project",
          stage: "team_forming"
        })
      });

      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to create project.");
      }

      setTitle("");
      setSummary("");
      setSkills("");
      await refreshPage("Project created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project.");
    }
  }

  async function applyToProject(projectId: string) {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/apply`, { method: "POST" });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to apply.");
      }

      setProjects((current) => current.map((project) => (project._id === projectId ? { ...project, applied: true } : project)));
      await refreshPage("Application submitted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to apply.");
    }
  }

  async function deleteProject(projectId: string) {
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to delete project.");
      }

      setProjects((current) => current.filter((project) => project._id !== projectId));
      await refreshPage("Project deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete project.");
    }
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Projects"
        title="Live project board"
        description="Projects are now backed by real database data. Roles can create, apply, delete owned projects, and jump into role-specific workspace actions."
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Quick project action</div>
              <h3 className="mt-2 text-2xl font-semibold text-white">Create a new collaboration project</h3>
              <p className="mt-3 text-sm text-slate-300">Useful for students, faculty, startups, and admins who want a visible demo workflow.</p>
            </div>
            <Badge>Role: {role}</Badge>
          </div>
          <div className="mt-6 grid gap-3">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Project title"
            />
            <Textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Project summary"
              className="h-28"
            />
            <Input
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              placeholder="Required skills, comma separated"
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void createProject()} disabled={pending || !title.trim() || summary.trim().length < 10}>
                {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Create Project
              </Button>
              <Button href="/dashboard/workspace?resource=projects" variant="secondary">
                <WandSparkles className="h-4 w-4" />
                Open CRUD Workspace
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">What each role can do</div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Student: browse projects and apply to teams.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Faculty: create guided projects and mentor work.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">College admin: manage institution-wide project records.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Super admin: view and manage all project data globally.</div>
          </div>
        </Card>
      </div>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{success}</div> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <Card key={project._id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">{project.type}</div>
                <h3 className="mt-2 text-xl font-semibold text-white">{project.title}</h3>
              </div>
              <Badge>{project.stage.replaceAll("_", " ")}</Badge>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{project.summary}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Owner</div>
                <div className="mt-2 text-sm text-white">{project.ownerName}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Timeline</div>
                <div className="mt-2 text-sm text-white">{project.timeline ?? "Not set"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Success prediction</div>
                <div className="mt-2 text-sm text-white">{project.successPrediction ?? 0}%</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.requiredSkills.length > 0 ? (
                project.requiredSkills.map((skill) => <Badge key={skill}>{skill}</Badge>)
              ) : (
                <Badge>No skill tags yet</Badge>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {!project.owned && ["student", "startup"].includes(role) ? (
                <Button onClick={() => void applyToProject(project._id)} disabled={project.applied}>
                  <BriefcaseBusiness className="h-4 w-4" />
                  {project.applied ? "Applied" : "Apply Now"}
                </Button>
              ) : null}
              {project.owned || canModerateProjects ? (
                <>
                  <Button href={`/dashboard/workspace?resource=projects&mode=edit&id=${project._id}`} variant="secondary">
                    Edit Project
                  </Button>
                  <Button
                    onClick={() => void deleteProject(project._id)}
                    variant="ghost"
                    className="border border-rose-400/20 text-rose-200 hover:bg-rose-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <Button href="/dashboard/workspace?resource=projects" variant="ghost">
                  View in Workspace
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
