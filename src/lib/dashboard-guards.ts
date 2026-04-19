import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/server-auth";

export async function requireDashboardRole(roles: string[]) {
  const auth = await getServerAuthContext();
  if (!auth) {
    redirect("/login");
  }
  if (!roles.includes(auth.role)) {
    redirect("/dashboard");
  }
  return auth;
}
