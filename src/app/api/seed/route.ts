import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { Project, Room, Tenant, User } from "@/lib/models";
import { fail } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { seedProjects, seedUsers } from "@/lib/seed-data";

export async function POST(request: Request) {
  const authResult = await requireApiAuth(request, ["super_admin"]);
  if ("error" in authResult) {
    return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
  }

  await connectToDatabase();
  const tenant = await Tenant.findByIdAndUpdate(
    authResult.auth.tenantId,
    {
      name: "Campus Nexus Demo",
      brandColor: "#22d3ee",
      subdomain: "demo",
      isolationMode: "shared"
    },
    { new: true }
  );

  if (!tenant) {
    return fail("Tenant not found", 404);
  }

  await Project.deleteMany({ tenantId: tenant._id });
  await Room.deleteMany({ tenantId: tenant._id });

  const passwordHash = await bcrypt.hash("Password123!", 10);
  const users = [] as Array<{ _id: { toString(): string } }>;
  for (const entry of seedUsers) {
    const user = await User.findOneAndUpdate(
      { tenantId: tenant._id, email: entry.email.toLowerCase() },
      {
        tenantId: tenant._id,
        email: entry.email.toLowerCase(),
        name: entry.name,
        role: entry.role,
        passwordHash,
        authProvider: "seed",
        status: "active"
      },
      { upsert: true, new: true }
    );
    users.push(user);
  }

  const actor = await User.findOne({ tenantId: tenant._id, _id: authResult.auth.userId });
  if (actor) {
    const alreadyIncluded = users.some((user) => user._id.toString() === actor._id.toString());
    if (!alreadyIncluded) {
      users.unshift(actor);
    }
  }

  const projects = await Project.insertMany(seedProjects.map((entry) => ({ ...entry, tenantId: tenant._id, ownerId: users[0]._id })));

  const room = await Room.create({
    tenantId: tenant._id,
    title: "General Collaboration",
    type: "group",
    participantIds: users.map((user) => user._id)
  });

  return NextResponse.json({
    ok: true,
    tenantId: tenant._id.toString(),
    roomId: room._id.toString(),
    projectIds: projects.map((project) => project._id.toString()),
    userIds: users.map((user) => user._id.toString())
  });
}
