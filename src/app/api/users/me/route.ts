import { fail, ok } from "@/lib/http";
import { connectToDatabase } from "@/lib/db";
import { Profile, User } from "@/lib/models";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();

    const [user, profile] = await Promise.all([
      User.findOne({ _id: authResult.auth.userId, tenantId: authResult.auth.tenantId })
        .select("email name role status createdAt")
        .lean(),
      Profile.findOne({ userId: authResult.auth.userId, tenantId: authResult.auth.tenantId }).lean()
    ]);

    if (!user) {
      return fail("User not found", 404);
    }

    return ok({ user, profile });
  } catch (error) {
    return fail("Failed to fetch user profile", 500, error instanceof Error ? error.message : "unknown");
  }
}
