import { fail, ok } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { permissionMatrix } from "@/lib/rbac";

export async function GET(request: Request) {
  const authResult = await requireApiAuth(request, ["super_admin", "college_admin", "faculty"]);
  if ("error" in authResult) {
    return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
  }

  return ok({ permissionMatrix });
}
