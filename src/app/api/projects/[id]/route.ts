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
    const project = await Project.findOne({ _id: id, tenantId: authResult.auth.tenantId }).lean();
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

    const update = {
      ...parsed.data,
      title: parsed.data.title ? sanitizeText(parsed.data.title) : undefined,
      summary: parsed.data.summary ? sanitizeText(parsed.data.summary) : undefined,
      timeline: parsed.data.timeline ? sanitizeText(parsed.data.timeline) : undefined
    };

    const project = await Project.findOneAndUpdate(
      {
        _id: id,
        tenantId: authResult.auth.tenantId,
        $or: [{ ownerId: authResult.auth.userId }, { tenantId: authResult.auth.tenantId }]
      },
      { $set: update },
      { new: true }
    ).lean();

    if (!project) {
      return fail("Project not found", 404);
    }

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
    const deleted = await Project.findOneAndDelete({ _id: id, tenantId: authResult.auth.tenantId, ownerId: authResult.auth.userId }).lean();
    if (!deleted) {
      return fail("Project not found or not owned by user", 404);
    }

    return ok({ deleted: true, id });
  } catch (error) {
    return fail("Failed to delete project", 500, error instanceof Error ? error.message : "unknown");
  }
}
