import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Tenant } from "@/lib/models";
import { fail, safeJson } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { z } from "zod";

const tenantCreateSchema = z.object({
  slug: z.string().min(2).max(60),
  name: z.string().min(2).max(120),
  brandColor: z.string().optional(),
  subdomain: z.string().optional(),
  isolationMode: z.enum(["shared", "isolated", "schema"]).optional(),
  contactEmail: z.string().email().optional()
});

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth(request, ["super_admin"]);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const tenants = await Tenant.find().sort({ createdAt: -1 }).limit(25).lean();
    return NextResponse.json({ ok: true, data: { tenants } });
  } catch (error) {
    return fail("Failed to fetch tenants", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth(request, ["super_admin"]);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = tenantCreateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid tenant payload", 400, parsed.error.flatten());
    }

    await connectToDatabase();
    const slug = parsed.data.slug.trim().toLowerCase();
    const subdomain = (parsed.data.subdomain ?? slug).trim().toLowerCase();
    const duplicate = await Tenant.findOne({
      $or: [{ slug }, { subdomain }]
    })
      .select("_id")
      .lean();

    if (duplicate) {
      return fail("Tenant slug or subdomain already exists", 409);
    }

    const tenant = await Tenant.create({
      slug,
      name: parsed.data.name,
      brandColor: parsed.data.brandColor ?? "#7C3AED",
      subdomain,
      isolationMode: parsed.data.isolationMode ?? "shared",
      contactEmail: parsed.data.contactEmail
    });

    return NextResponse.json({ ok: true, data: { tenant } }, { status: 201 });
  } catch (error) {
    return fail("Failed to create tenant", 500, error instanceof Error ? error.message : "unknown");
  }
}
