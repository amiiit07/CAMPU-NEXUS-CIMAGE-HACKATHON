import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/lib/models";
import { fail, ok, safeJson } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { projectSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/security-api";

function validId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function findProjectByRole(id: string, auth: { tenantId: string; role: string }) {
  if (auth.role === "super_admin") {
    return Project.findById(id);
  }

  return Project.findOne({ _id: id, tenantId: auth.tenantId });
}

function canManageProject(project: { tenantId: { toString(): string }; ownerId?: { toString(): string } | null }, auth: { userId: string; tenantId: string; role: string }) {
  if (auth.role === "super_admin") {
    return true;
  }

  if (project.tenantId.toString() !== auth.tenantId) {
    return false;
  }

  if (["college_admin", "faculty"].includes(auth.role)) {
    return true;
  }

  return project.ownerId?.toString() === auth.userId;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!validId(id)) {
      return fail("Invalid project id", 400);
    }

    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const project = await findProjectByRole(id, authResult.auth).lean();
    if (!project) {
      return fail("Project not found", 404);
    }

    return ok({ project });
  } catch (error) {
    return fail("Failed to fetch project", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!validId(id)) {
      return fail("Invalid project id", 400);
    }

    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = projectSchema.partial().safeParse(body);
    if (!parsed.success) {
      return fail("Invalid project payload", 400, parsed.error.flatten());
    }

    await connectToDatabase();
    const existingProject = await findProjectByRole(id, authResult.auth).lean();
    if (!existingProject) {
      return fail("Project not found", 404);
    }
    if (!canManageProject(existingProject, authResult.auth)) {
      return fail("Forbidden", 403);
    }

    const update = Object.fromEntries(
      Object.entries({
        ...parsed.data,
        title: parsed.data.title ? sanitizeText(parsed.data.title) : undefined,
        summary: parsed.data.summary ? sanitizeText(parsed.data.summary) : undefined,
        timeline: parsed.data.timeline ? sanitizeText(parsed.data.timeline) : undefined,
        requiredSkills: parsed.data.requiredSkills?.map((skill) => sanitizeText(skill)).filter(Boolean)
      }).filter(([, value]) => value !== undefined)
    );

    const project = await Project.findByIdAndUpdate(existingProject._id, { $set: update }, { new: true }).lean();

    return ok({ project });
  } catch (error) {
    return fail("Failed to update project", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!validId(id)) {
      return fail("Invalid project id", 400);
    }

    const authResult = await requireApiAuth(request, ["super_admin", "college_admin", "faculty", "student", "startup"]);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const existingProject = await findProjectByRole(id, authResult.auth).lean();
    if (!existingProject) {
      return fail("Project not found", 404);
    }
    if (!canManageProject(existingProject, authResult.auth)) {
      return fail("Forbidden", 403);
    }
    await Project.deleteOne({ _id: existingProject._id });

    return ok({ deleted: true, id });
  } catch (error) {
    return fail("Failed to delete project", 500, error instanceof Error ? error.message : "unknown");
  }
}
