import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import { fail, ok, safeJson } from "@/lib/http";
import { User } from "@/lib/models";
import { limitByIp } from "@/lib/security-api";
import { updatePasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const throttled = limitByIp(request, "auth-update-password", 40, 60_000);
    if (throttled) {
      return throttled;
    }

    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = updatePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid request body", 400, parsed.error.flatten());
    }

    await connectToDatabase();

    const user = await User.findOne({ _id: authResult.auth.userId, tenantId: authResult.auth.tenantId }).select("+passwordHash");
    if (!user || !user.passwordHash) {
      return fail("User not found", 404);
    }

    const isMatch = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isMatch) {
      return fail("Current password is incorrect", 400);
    }

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();

    return ok({ message: "Password updated" });
  } catch (error) {
    return fail("Update password failed", 500, error instanceof Error ? error.message : "unknown");
  }
}
