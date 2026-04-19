import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/lib/models";
import { fail, ok } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { paginationFromSearch } from "@/lib/pagination";

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const { page, limit, skip } = paginationFromSearch(new URL(request.url));

    const [items, total] = await Promise.all([
      Notification.find({ tenantId: authResult.auth.tenantId, userId: authResult.auth.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ tenantId: authResult.auth.tenantId, userId: authResult.auth.userId })
    ]);

    return ok({ items, page, limit, total });
  } catch (error) {
    return fail("Failed to fetch notifications", 500, error instanceof Error ? error.message : "unknown");
  }
}
