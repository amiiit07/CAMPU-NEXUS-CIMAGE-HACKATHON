import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Message, Room, User } from "@/lib/models";
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

    const senderIds = Array.from(new Set(messages.map((message) => message.senderId?.toString()).filter(Boolean)));
    const senders = await User.find({ _id: { $in: senderIds }, tenantId: authResult.auth.tenantId })
      .select("name")
      .lean();
    const senderMap = new Map(senders.map((sender) => [sender._id.toString(), sender.name]));

    return ok({
      items: messages.reverse().map((message) => ({
        ...message,
        senderName: senderMap.get(message.senderId.toString()) ?? "Unknown user"
      })),
      page,
      limit
    });
  } catch (error) {
    return fail("Failed to fetch chat", 500, error instanceof Error ? error.message : "unknown");
  }
}
