import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Message, Notification, Room } from "@/lib/models";
import { fail, ok, safeJson } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { chatSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/security-api";
import { emitSocketEvent } from "@/lib/socket";

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid chat payload", 400, parsed.error.flatten());
    }

    if (!mongoose.Types.ObjectId.isValid(parsed.data.roomId)) {
      return fail("Invalid room id", 400);
    }

    await connectToDatabase();
    const room = await Room.findOne({ _id: parsed.data.roomId, tenantId: authResult.auth.tenantId });
    if (!room) {
      return fail("Room not found", 404);
    }

    if (!room.participantIds.some((id) => id.toString() === authResult.auth.userId)) {
      return fail("Forbidden", 403);
    }

    const message = await Message.create({
      tenantId: authResult.auth.tenantId,
      roomId: room._id,
      senderId: authResult.auth.userId,
      text: sanitizeText(parsed.data.text),
      attachments: parsed.data.attachments ?? []
    });

    const recipientIds = room.participantIds.filter((id) => id.toString() !== authResult.auth.userId);
    if (recipientIds.length > 0) {
      await Notification.insertMany(
        recipientIds.map((recipientId) => ({
          tenantId: authResult.auth.tenantId,
          userId: recipientId,
          title: "New chat message",
          body: `${authResult.auth.name}: ${sanitizeText(parsed.data.text).slice(0, 80)}`
        }))
      );
    }

    emitSocketEvent({
      type: "message",
      payload: {
        roomId: room._id.toString(),
        message
      }
    });

    return ok({ message }, 201);
  } catch (error) {
    return fail("Failed to send message", 500, error instanceof Error ? error.message : "unknown");
  }
}
