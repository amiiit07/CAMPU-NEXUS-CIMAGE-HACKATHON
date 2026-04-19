import { connectToDatabase } from "@/lib/db";
import { Project } from "@/lib/models";
import { fail, ok, safeJson } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { paginationFromSearch } from "@/lib/pagination";
import { projectSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/security-api";

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const url = new URL(request.url);
    const { page, limit, skip } = paginationFromSearch(url);

    const [items, total] = await Promise.all([
      Project.find({ tenantId: authResult.auth.tenantId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Project.countDocuments({ tenantId: authResult.auth.tenantId })
    ]);

    return ok({ items, page, limit, total });
  } catch (error) {
    return fail("Failed to fetch projects", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid project payload", 400, parsed.error.flatten());
    }

    await connectToDatabase();

    const project = await Project.create({
      ...parsed.data,
      tenantId: authResult.auth.tenantId,
      ownerId: authResult.auth.userId,
      title: sanitizeText(parsed.data.title),
      summary: sanitizeText(parsed.data.summary),
      timeline: parsed.data.timeline ? sanitizeText(parsed.data.timeline) : undefined
    });

    return ok({ project }, 201);
  } catch (error) {
    return fail("Failed to create project", 500, error instanceof Error ? error.message : "unknown");
  }
}
