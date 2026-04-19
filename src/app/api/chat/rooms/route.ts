import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Project, Room, User } from "@/lib/models";
import { requireApiAuth } from "@/lib/api-auth";
import { fail, ok, safeJson } from "@/lib/http";
import { sanitizeText } from "@/lib/security-api";

const roomSchema = z.object({
  title: z.string().min(2).max(120),
  type: z.enum(["dm", "group", "voice", "project"]).optional(),
  projectId: z.string().optional(),
  participantIds: z.array(z.string()).max(20).optional()
});

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();

    const rooms = await Room.find({
      tenantId: authResult.auth.tenantId,
      participantIds: authResult.auth.userId
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    return ok({
      items: rooms.map((room) => ({
        _id: room._id.toString(),
        title: room.title,
        type: room.type,
        projectId: room.projectId ? room.projectId.toString() : null,
        participantCount: room.participantIds?.length ?? 0,
        createdAt: room.createdAt
      }))
    });
  } catch (error) {
    return fail("Failed to fetch rooms", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = roomSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid room payload", 400, parsed.error.flatten());
    }

    const projectId = parsed.data.projectId;
    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
      return fail("Invalid project id", 400);
    }

    await connectToDatabase();

    if (projectId) {
      const existingRoom = await Room.findOne({
        tenantId: authResult.auth.tenantId,
        projectId
      });

      if (existingRoom) {
        if (!existingRoom.participantIds.some((id) => id.toString() === authResult.auth.userId)) {
          existingRoom.participantIds.push(new mongoose.Types.ObjectId(authResult.auth.userId));
          await existingRoom.save();
        }

        return ok({
          room: {
            _id: existingRoom._id.toString(),
            title: existingRoom.title,
            type: existingRoom.type,
            projectId: existingRoom.projectId ? existingRoom.projectId.toString() : null,
            participantCount: existingRoom.participantIds?.length ?? 0
          }
        });
      }

      const project = await Project.findOne({ _id: projectId, tenantId: authResult.auth.tenantId }).lean();
      if (!project) {
        return fail("Project not found", 404);
      }
    }

    const requestedParticipantIds = Array.from(
      new Set([authResult.auth.userId, ...(parsed.data.participantIds ?? [])].filter((id) => mongoose.Types.ObjectId.isValid(id)))
    );
    const validParticipants = await User.find({
      _id: { $in: requestedParticipantIds },
      tenantId: authResult.auth.tenantId,
      status: "active"
    })
      .select("_id")
      .lean();
    const participantIds = validParticipants.map((user) => user._id);

    const room = await Room.create({
      tenantId: authResult.auth.tenantId,
      title: sanitizeText(parsed.data.title),
      type: parsed.data.type ?? (projectId ? "project" : "group"),
      projectId: projectId ?? undefined,
      creatorId: authResult.auth.userId,
      participantIds
    });

    return ok(
      {
        room: {
          _id: room._id.toString(),
          title: room.title,
          type: room.type,
          projectId: room.projectId ? room.projectId.toString() : null,
          participantCount: room.participantIds?.length ?? 0
        }
      },
      201
    );
  } catch (error) {
    return fail("Failed to create room", 500, error instanceof Error ? error.message : "unknown");
  }
}
