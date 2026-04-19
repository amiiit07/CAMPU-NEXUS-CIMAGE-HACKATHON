import { fail, ok } from "@/lib/http";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { requireApiAuth } from "@/lib/api-auth";
import { paginationFromSearch } from "@/lib/pagination";

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth(request, ["super_admin", "college_admin", "faculty"]);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const url = new URL(request.url);
    const { skip, limit, page } = paginationFromSearch(url);

    const [rows, total] = await Promise.all([
      User.find({ tenantId: authResult.auth.tenantId })
        .select("email name role status lastLoginAt createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ tenantId: authResult.auth.tenantId })
    ]);

    return ok({ items: rows, page, limit, total });
  } catch (error) {
    return fail("Failed to fetch users", 500, error instanceof Error ? error.message : "unknown");
  }
}
