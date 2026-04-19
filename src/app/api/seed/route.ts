import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Project, Tenant, User } from "@/lib/models";
import { seedProjects, seedUsers } from "@/lib/seed-data";

export async function POST() {
  await connectToDatabase();
  const tenant = await Tenant.findOneAndUpdate(
    { slug: "campus-nexus" },
    { slug: "campus-nexus", name: "Campus Nexus Demo", brandColor: "#22d3ee", subdomain: "demo", isolationMode: "shared" },
    { upsert: true, new: true }
  );

  await User.deleteMany({ tenantId: tenant._id });
  await Project.deleteMany({ tenantId: tenant._id });

  const users = await User.insertMany(seedUsers.map((entry) => ({ ...entry, tenantId: tenant._id, authProvider: "seed" })));
  await Project.insertMany(seedProjects.map((entry) => ({ ...entry, tenantId: tenant._id, ownerId: users[0]._id })));

  return NextResponse.json({ ok: true, tenantId: tenant._id.toString() });
}
