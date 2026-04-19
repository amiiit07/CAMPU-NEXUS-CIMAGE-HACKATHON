import { clearAuthCookie } from "@/lib/security-api";
import { ok } from "@/lib/http";

export async function POST() {
  await clearAuthCookie();
  return ok({ loggedOut: true });
}
