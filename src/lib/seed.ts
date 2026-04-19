import { connectToDatabase } from "@/lib/db";
import { Project, Tenant, User } from "@/lib/models";
import { seedProjects, seedTenants, seedUsers } from "@/lib/seed-data";

async function seed() {
  await connectToDatabase();

  const tenant = await Tenant.findOneAndUpdate(
    { slug: "campus-nexus" },
    { slug: "campus-nexus", name: "Campus Nexus Demo", brandColor: "#22d3ee", subdomain: "demo", isolationMode: "shared" },
    { upsert: true, new: true }
  );

  await Tenant.deleteMany({ slug: { $in: seedTenants.map((entry) => entry.slug) } });
  await User.deleteMany({ tenantId: tenant._id });
  await Project.deleteMany({ tenantId: tenant._id });

  const createdUsers = await User.insertMany(
    seedUsers.map((entry) => ({ ...entry, tenantId: tenant._id, authProvider: "credentials" }))
  );

  await Project.insertMany(
    seedProjects.map((entry) => ({ ...entry, tenantId: tenant._id, ownerId: createdUsers[0]._id }))
  );

  console.log("Campus Nexus seed complete");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
