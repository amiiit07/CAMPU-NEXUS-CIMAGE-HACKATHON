import bcrypt from "bcryptjs";
import { generateMatchRecommendation } from "@/lib/ai";
import {
  Application,
  Message,
  Notification,
  Profile,
  Project,
  Recommendation,
  Room,
  Skill,
  Task,
  Team,
  Tenant,
  User
} from "@/lib/models";
import { DEMO_PASSWORD, legacyDemoEmails, legacyTenantSlugs, seedProjects, seedTenants, seedUsers } from "@/lib/seed-data";

function tenantSkills(slug: string) {
  const map: Record<string, string[]> = {
    cimage: ["Next.js", "MongoDB", "UI/UX", "ERP"],
    "bia-patna": ["Product Design", "Branding", "Community", "React"],
    "aia-patna": ["Research", "Security", "Automation", "Frontend"],
    "iit-patna": ["AI", "Systems Design", "Data", "Backend"],
    ibm: ["TypeScript", "Realtime", "Presentation", "Analytics"]
  };

  return map[slug] ?? ["Collaboration", "Innovation"];
}

export async function seedDemoData() {
  const targetSlugs = [...legacyTenantSlugs, ...seedTenants.map((tenant) => tenant.slug)];
  const existingTenants = await Tenant.find({ slug: { $in: targetSlugs } }).select("_id slug").lean();
  const tenantIds = existingTenants.map((tenant) => tenant._id);

  if (tenantIds.length > 0) {
    await Promise.all([
      Profile.deleteMany({ tenantId: { $in: tenantIds } }),
      Skill.deleteMany({ tenantId: { $in: tenantIds } }),
      Application.deleteMany({ tenantId: { $in: tenantIds } }),
      Team.deleteMany({ tenantId: { $in: tenantIds } }),
      Task.deleteMany({ tenantId: { $in: tenantIds } }),
      Message.deleteMany({ tenantId: { $in: tenantIds } }),
      Room.deleteMany({ tenantId: { $in: tenantIds } }),
      Recommendation.deleteMany({ tenantId: { $in: tenantIds } }),
      Notification.deleteMany({ tenantId: { $in: tenantIds } }),
      Project.deleteMany({ tenantId: { $in: tenantIds } }),
      User.deleteMany({ tenantId: { $in: tenantIds } }),
      Tenant.deleteMany({ _id: { $in: tenantIds } })
    ]);
  }

  await User.deleteMany({ email: { $in: legacyDemoEmails } });

  const tenants = await Tenant.insertMany(
    seedTenants.map((tenant) => ({
      slug: tenant.slug,
      name: tenant.name,
      brandColor: tenant.brandColor,
      subdomain: tenant.subdomain,
      isolationMode: tenant.isolationMode,
      status: "active",
      subscriptionPlan: tenant.subscriptionPlan,
      contactEmail: tenant.contactEmail
    }))
  );

  const tenantMap = new Map(tenants.map((tenant) => [tenant.slug, tenant]));
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users = await User.insertMany(
    seedUsers.map((user) => {
      const tenant = tenantMap.get(user.tenantSlug);
      if (!tenant) {
        throw new Error(`Tenant ${user.tenantSlug} not found while creating users`);
      }

      return {
        tenantId: tenant._id,
        email: user.email.toLowerCase(),
        name: user.name,
        role: user.role,
        passwordHash,
        authProvider: "seed",
        status: "active",
        isVerified: true
      };
    })
  );

  const userMap = new Map(users.map((user) => [user.email.toLowerCase(), user]));

  await Profile.insertMany(
    users.map((user) => {
      const tenant = tenants.find((item) => item._id.toString() === user.tenantId.toString());
      const skills = tenant ? tenantSkills(tenant.slug) : ["Innovation"];
      return {
        tenantId: user.tenantId,
        userId: user._id,
        headline: user.role === "student" ? "Student collaborator ready for projects" : "College operations and innovation lead",
        bio: `${user.name} is part of the seeded Campus Nexus demo dataset for live presentations and dashboard flows.`,
        skills,
        portfolioLinks: [],
        badges: [user.role],
        availability: "open",
        reputationScore: user.role === "student" ? 78 : 90,
        collaborationScore: user.role === "student" ? 82 : 88
      };
    })
  );

  await Skill.insertMany(
    seedTenants.flatMap((tenant) =>
      tenantSkills(tenant.slug).map((skill) => ({
        tenantId: tenantMap.get(tenant.slug)?._id,
        name: skill,
        category: "Demo",
        trendingScore: 70
      }))
    )
  );

  const projects = await Project.insertMany(
    seedProjects.map((project) => {
      const tenant = tenantMap.get(project.tenantSlug);
      const owner = userMap.get(project.ownerEmail.toLowerCase());
      if (!tenant || !owner) {
        throw new Error(`Seed mapping missing for project ${project.title}`);
      }

      return {
        tenantId: tenant._id,
        title: project.title,
        summary: project.summary,
        type: project.type,
        stage: project.stage,
        requiredSkills: project.requiredSkills,
        budget: project.budget,
        timeline: project.timeline,
        ownerId: owner._id,
        successPrediction: project.successPrediction
      };
    })
  );

  const usersByTenant = new Map<string, typeof users>();
  for (const tenant of tenants) {
    usersByTenant.set(
      tenant.slug,
      users.filter((user) => user.tenantId.toString() === tenant._id.toString())
    );
  }

  const projectRooms = [] as Array<{ roomId: string; tenantSlug: string; projectTitle: string }>;
  const generalRooms = [] as Array<{ roomId: string; tenantSlug: string }>;

  for (const tenant of tenants) {
    const tenantUsers = usersByTenant.get(tenant.slug) ?? [];
    const generalRoom = await Room.create({
      tenantId: tenant._id,
      title: `${tenant.name} General Room`,
      type: "group",
      participantIds: tenantUsers.map((user) => user._id)
    });
    generalRooms.push({ roomId: generalRoom._id.toString(), tenantSlug: tenant.slug });

    const adminUser = tenantUsers.find((user) => user.role === "college_admin") ?? tenantUsers[0];
    const studentUsers = tenantUsers.filter((user) => user.role === "student");

    await Message.insertMany([
      {
        tenantId: tenant._id,
        roomId: generalRoom._id,
        senderId: adminUser._id,
        text: `Welcome to ${tenant.name}. This general room is ready for live demo chats.`
      },
      {
        tenantId: tenant._id,
        roomId: generalRoom._id,
        senderId: studentUsers[0]?._id ?? adminUser._id,
        text: `We are ready to collaborate on projects, tasks, and hackathon workflows.`
      }
    ]);
  }

  for (const project of projects) {
    const tenant = tenants.find((item) => item._id.toString() === project.tenantId.toString());
    if (!tenant) {
      continue;
    }
    const tenantUsers = usersByTenant.get(tenant.slug) ?? [];
    const room = await Room.create({
      tenantId: project.tenantId,
      title: `${project.title} Room`,
      type: "project",
      projectId: project._id,
      participantIds: tenantUsers.map((user) => user._id)
    });

    projectRooms.push({ roomId: room._id.toString(), tenantSlug: tenant.slug, projectTitle: project.title });

    await Message.insertMany([
      {
        tenantId: project.tenantId,
        roomId: room._id,
        senderId: project.ownerId,
        text: `Kickoff started for ${project.title}. Please align on tasks and deliverables.`
      },
      {
        tenantId: project.tenantId,
        roomId: room._id,
        senderId: tenantUsers.find((user) => user.role === "student")?._id ?? project.ownerId,
        text: "Sharing initial thoughts and preparing the first sprint backlog."
      }
    ]);
  }

  const applications = [] as Array<{ tenantId: unknown; projectId: unknown; userId: unknown; status: string }>;
  const recommendations = [] as Array<{
    tenantId: unknown;
    userId: unknown;
    projectId: unknown;
    teammateScore: number;
    projectScore: number;
    mentorScore: number;
    reasoning: string[];
  }>;

  for (const tenant of tenants) {
    const tenantProjects = projects.filter((project) => project.tenantId.toString() === tenant._id.toString());
    const tenantStudents = (usersByTenant.get(tenant.slug) ?? []).filter((user) => user.role === "student");

    tenantStudents.forEach((student, index) => {
      const project = tenantProjects[index % tenantProjects.length];
      if (!project) {
        return;
      }

      applications.push({
        tenantId: tenant._id,
        projectId: project._id,
        userId: student._id,
        status: index % 2 === 0 ? "accepted" : "applied"
      });

      const match = generateMatchRecommendation({
        userId: student._id.toString(),
        skills: tenantSkills(tenant.slug),
        projectSkills: project.requiredSkills ?? [],
        interests: ["innovation", "collaboration", tenant.name.toLowerCase()]
      });

      recommendations.push({
        tenantId: tenant._id,
        userId: student._id,
        projectId: project._id,
        teammateScore: match.teammateScore,
        projectScore: match.projectScore,
        mentorScore: match.mentorScore,
        reasoning: match.reasoning
      });
    });
  }

  if (applications.length > 0) {
    await Application.insertMany(applications);
  }

  if (recommendations.length > 0) {
    await Recommendation.insertMany(recommendations);
  }

  await Notification.insertMany(
    users.map((user) => ({
      tenantId: user.tenantId,
      userId: user._id,
      title: `Welcome ${user.name}`,
      body:
        user.role === "student"
          ? "Your student dashboard, recommendations, and project actions are now ready."
          : user.role === "college_admin"
            ? "Your admin controls, analytics, and CRUD actions are now enabled."
            : "Global super admin controls and tenant analytics are ready."
    }))
  );

  return {
    password: DEMO_PASSWORD,
    tenantCount: tenants.length,
    userCount: users.length,
    projectCount: projects.length,
    roomCount: generalRooms.length + projectRooms.length,
    messageCount: generalRooms.length * 2 + projectRooms.length * 2,
    tenants: tenants.map((tenant) => tenant.name),
    credentials: {
      superAdmin: {
        email: "superadmin@campusnexus.dev",
        password: DEMO_PASSWORD
      },
      admins: seedUsers.filter((user) => user.role === "college_admin").map((user) => ({
        college: seedTenants.find((tenant) => tenant.slug === user.tenantSlug)?.name ?? user.tenantSlug,
        email: user.email,
        password: DEMO_PASSWORD
      })),
      students: seedUsers.filter((user) => user.role === "student").map((user) => ({
        name: user.name,
        email: user.email,
        password: DEMO_PASSWORD
      }))
    }
  };
}
