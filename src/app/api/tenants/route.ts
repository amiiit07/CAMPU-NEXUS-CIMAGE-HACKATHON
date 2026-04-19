import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Tenant } from "@/lib/models";

export async function GET() {
  await connectToDatabase();
  const tenants = await Tenant.find().sort({ createdAt: -1 }).limit(25).lean();
  return NextResponse.json({ tenants });
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const tenant = await Tenant.create({
    slug: body.slug,
    name: body.name,
    brandColor: body.brandColor ?? "#22d3ee",
    subdomain: body.subdomain ?? body.slug,
    isolationMode: body.isolationMode ?? "shared"
  });

  return NextResponse.json({ tenant }, { status: 201 });
}
