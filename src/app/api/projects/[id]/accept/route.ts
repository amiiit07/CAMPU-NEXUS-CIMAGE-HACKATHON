import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Application, Notification, Project } from "@/lib/models";
import { fail, ok, safeJson } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail("Invalid project id", 400);
    }

    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const applicantId = typeof body?.userId === "string" ? body.userId : "";
    if (!mongoose.Types.ObjectId.isValid(applicantId)) {
      return fail("Invalid applicant userId", 400);
    }

    await connectToDatabase();
    const project =
      authResult.auth.role === "super_admin"
        ? await Project.findById(id).lean()
        : await Project.findOne({ _id: id, tenantId: authResult.auth.tenantId }).lean();

    if (!project) {
      return fail("Project not found", 404);
    }

    const canManage =
      authResult.auth.role === "super_admin" ||
      (project.tenantId.toString() === authResult.auth.tenantId &&
        (project.ownerId?.toString() === authResult.auth.userId || ["college_admin", "faculty"].includes(authResult.auth.role)));

    if (!canManage) {
      return fail("Forbidden", 403);
    }

    const application = await Application.findOneAndUpdate(
      { tenantId: project.tenantId, projectId: id, userId: applicantId },
      { $set: { status: "accepted" } },
      { new: true }
    ).lean();

    if (!application) {
      return fail("Application not found", 404);
    }

    await Notification.create({
      tenantId: project.tenantId,
      userId: applicantId,
      title: "Application accepted",
      body: `You were accepted for project ${project.title}`
    });

    return ok({ application });
  } catch (error) {
    return fail("Failed to accept application", 500, error instanceof Error ? error.message : "unknown");
  }
}
