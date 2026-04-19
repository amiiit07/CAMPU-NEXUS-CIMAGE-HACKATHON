import { fail, ok } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authResult = await requireApiAuth(request);
  if ("error" in authResult) {
    return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
  }

  return ok({ user: authResult.auth });
}
