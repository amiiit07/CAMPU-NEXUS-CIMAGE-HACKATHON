import { fail, ok } from "@/lib/http";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { requireApiAuth } from "@/lib/api-auth";
import { paginationFromSearch } from "@/lib/pagination";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth(request, ["super_admin", "college_admin", "faculty"]);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const url = new URL(request.url);
    const { skip, limit, page } = paginationFromSearch(url);
    const tenantId = url.searchParams.get("tenantId");
    const q = url.searchParams.get("q")?.trim();
    const isSuperAdmin = authResult.auth.role === "super_admin";

    const filter: Record<string, unknown> = isSuperAdmin
      ? tenantId && mongoose.Types.ObjectId.isValid(tenantId)
        ? { tenantId }
        : {}
      : { tenantId: authResult.auth.tenantId };

    if (q) {
      filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];
    }

    const [rows, total] = await Promise.all([
      User.find(filter)
        .select("email name role status tenantId lastLoginAt createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    return ok({ items: rows, page, limit, total });
  } catch (error) {
    return fail("Failed to fetch users", 500, error instanceof Error ? error.message : "unknown");
  }
}
