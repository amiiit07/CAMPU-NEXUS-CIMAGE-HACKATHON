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
    const project = await Project.findOne({ _id: id, tenantId: authResult.auth.tenantId, ownerId: authResult.auth.userId }).lean();
    if (!project) {
      return fail("Project not found or not owned by user", 404);
    }

    const application = await Application.findOneAndUpdate(
      { tenantId: authResult.auth.tenantId, projectId: id, userId: applicantId },
      { $set: { status: "accepted" } },
      { new: true }
    ).lean();

    if (!application) {
      return fail("Application not found", 404);
    }

    await Notification.create({
      tenantId: authResult.auth.tenantId,
      userId: applicantId,
      title: "Application accepted",
      body: `You were accepted for project ${project.title}`
    });

    return ok({ application });
  } catch (error) {
    return fail("Failed to accept application", 500, error instanceof Error ? error.message : "unknown");
  }
}
