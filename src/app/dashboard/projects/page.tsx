import { ChatRoomPanel } from "@/components/chat-room-panel";
import { ProjectsBoard } from "@/components/projects-board";
import { connectToDatabase } from "@/lib/db";
import { Application, Project, Room, Tenant, User } from "@/lib/models";
import { getServerAuthContext } from "@/lib/server-auth";

export default async function ProjectsPage() {
  const auth = await getServerAuthContext();
  if (!auth) {
    return null;
  }

  await connectToDatabase();

  const tenant = await Tenant.findById(auth.tenantId).select("name").lean();
  const communityParticipants = await User.find({
    tenantId: auth.tenantId,
    status: "active",
    role: { $in: ["student", "college_admin"] }
  })
    .select("_id")
    .lean();

  const participantIds = communityParticipants.map((user) => user._id);
  if (participantIds.length > 1) {
    await Room.findOneAndUpdate(
      {
        tenantId: auth.tenantId,
        type: "group",
        title: `${tenant?.name ?? "College"} Community Room`
      },
      {
        $set: {
          participantIds
        },
        $setOnInsert: {
          creatorId: auth.sub
        }
      },
      { upsert: true, new: true }
    );
  }

  const [projects, applications, rooms] = await Promise.all([
    Project.find({ tenantId: auth.tenantId }).sort({ createdAt: -1 }).lean(),
    Application.find({ tenantId: auth.tenantId, userId: auth.sub }).lean(),
    Room.find({ tenantId: auth.tenantId, participantIds: auth.sub }).sort({ updatedAt: -1, createdAt: -1 }).lean()
  ]);

  const ownerIds = Array.from(new Set(projects.map((project) => project.ownerId?.toString()).filter(Boolean)));
  const owners = await User.find({ _id: { $in: ownerIds }, tenantId: auth.tenantId }).select("name").lean();
  const ownerMap = new Map(owners.map((owner) => [owner._id.toString(), owner.name]));
  const appliedProjectIds = new Set(applications.map((application) => application.projectId.toString()));

  const projectCards = projects.map((project) => ({
    _id: project._id.toString(),
    title: project.title,
    summary: project.summary ?? "",
    type: project.type,
    stage: project.stage,
    budget: typeof project.budget === "number" ? project.budget : null,
    timeline: project.timeline ?? null,
    successPrediction: typeof project.successPrediction === "number" ? project.successPrediction : null,
    requiredSkills: project.requiredSkills ?? [],
    ownerId: project.ownerId?.toString() ?? "",
    ownerName: ownerMap.get(project.ownerId?.toString() ?? "") ?? "Unknown owner",
    applied: appliedProjectIds.has(project._id.toString()),
    owned: project.ownerId?.toString() === auth.sub
  }));

  const roomCards = rooms.map((room) => ({
    _id: room._id.toString(),
    title: room.title ?? "Untitled room",
    type: room.type,
    projectId: room.projectId ? room.projectId.toString() : null,
    participantCount: room.participantIds?.length ?? 0,
    isCommunity: (room.title ?? "").includes("Community Room")
  }));

  roomCards.sort((a, b) => Number(b.isCommunity) - Number(a.isCommunity));

  return (
    <div className="space-y-10">
      <ProjectsBoard initialProjects={projectCards} role={auth.role} />
      <ChatRoomPanel
        initialRooms={roomCards}
        projectOptions={projectCards.map((project) => ({ _id: project._id, title: project.title }))}
        currentUserId={auth.sub}
      />
    </div>
  );
}
