import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { seedDemoData } from "@/lib/demo-seed";
import { fail } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";

export async function POST(request: Request) {
  const authResult = await requireApiAuth(request, ["super_admin"]);
  if ("error" in authResult) {
    return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
  }

  await connectToDatabase();
  const result = await seedDemoData();

  return NextResponse.json({
    ok: true,
    data: result
  });
}
