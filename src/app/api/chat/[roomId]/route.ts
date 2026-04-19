import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Message, Room } from "@/lib/models";
import { fail, ok } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { paginationFromSearch } from "@/lib/pagination";

export async function GET(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return fail("Invalid room id", 400);
    }

    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const room = await Room.findOne({ _id: roomId, tenantId: authResult.auth.tenantId }).lean();
    if (!room) {
      return fail("Room not found", 404);
    }

    const isParticipant = room.participantIds?.some((id) => id.toString() === authResult.auth.userId);
    if (!isParticipant) {
      return fail("Forbidden", 403);
    }

    const { page, limit, skip } = paginationFromSearch(new URL(request.url));
    const messages = await Message.find({ tenantId: authResult.auth.tenantId, roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return ok({ items: messages.reverse(), page, limit });
  } catch (error) {
    return fail("Failed to fetch chat", 500, error instanceof Error ? error.message : "unknown");
  }
}
