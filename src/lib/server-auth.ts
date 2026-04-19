import { cookies } from "next/headers";
import { verifyToken } from "@/lib/security-api";

const TOKEN_COOKIE = "campus_nexus_token";

export async function getServerAuthContext() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}
