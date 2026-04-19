import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Application, Project, Notification } from "@/lib/models";
import { fail, ok } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Invalid project id", 400);
    }

    const authResult = await requireApiAuth(request, ["student", "startup"]);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const project = await Project.findOne({ _id: id, tenantId: authResult.auth.tenantId }).lean();
    if (!project) {
      return fail("Project not found", 404);
    }

    if (project.ownerId?.toString() === authResult.auth.userId) {
      return fail("You cannot apply to your own project", 400);
    }

    const application = await Application.findOneAndUpdate(
      { tenantId: authResult.auth.tenantId, projectId: id, userId: authResult.auth.userId },
      { $setOnInsert: { status: "applied" } },
      { upsert: true, new: true }
    ).lean();

    if (project.ownerId && project.ownerId.toString() !== authResult.auth.userId) {
      await Notification.create({
        tenantId: authResult.auth.tenantId,
        userId: project.ownerId,
        title: "New project application",
        body: `${authResult.auth.name} applied to ${project.title}`
      });
    }

    return ok({ application }, 201);
  } catch (error) {
    return fail("Failed to apply", 500, error instanceof Error ? error.message : "unknown");
  }
}
