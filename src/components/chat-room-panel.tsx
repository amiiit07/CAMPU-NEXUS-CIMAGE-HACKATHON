"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { MessageSquare, Plus, RefreshCcw, Send, Users } from "lucide-react";
import { Button, Card, Input, SectionTitle } from "@/components/ui";

type RoomItem = {
  _id: string;
  title: string;
  type: string;
  projectId: string | null;
  participantCount: number;
};

type MessageItem = {
  _id: string;
  senderId: string;
  senderName?: string;
  text: string;
  createdAt?: string;
};

type ProjectOption = {
  _id: string;
  title: string;
};

type MessageResponse = {
  ok: boolean;
  data?: {
    items?: MessageItem[];
  };
  error?: {
    message?: string;
  };
};

type RoomResponse = {
  ok: boolean;
  data?: {
    items?: RoomItem[];
    room?: RoomItem;
  };
  error?: {
    message?: string;
  };
};

export function ChatRoomPanel({
  initialRooms,
  projectOptions,
  currentUserId
}: {
  initialRooms: RoomItem[];
  projectOptions: ProjectOption[];
  currentUserId: string;
}) {
  const [rooms, setRooms] = useState<RoomItem[]>(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRooms[0]?._id ?? "");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const [roomProjectId, setRoomProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedRoom = useMemo(() => rooms.find((room) => room._id === selectedRoomId) ?? null, [rooms, selectedRoomId]);

  async function refreshRooms() {
    setError(null);
    try {
      const response = await fetch("/api/chat/rooms", { cache: "no-store" });
      const payload = (await response.json()) as RoomResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to refresh rooms.");
      }
      const nextRooms = payload.data?.items ?? [];
      setRooms(nextRooms);
      if (!selectedRoomId && nextRooms[0]) {
        setSelectedRoomId(nextRooms[0]._id);
      }
      if (selectedRoomId && !nextRooms.some((room) => room._id === selectedRoomId)) {
        setSelectedRoomId(nextRooms[0]?._id ?? "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh rooms.");
    }
  }

  async function loadMessages(roomId: string) {
    if (!roomId) {
      setMessages([]);
      return;
    }

    try {
      const response = await fetch(`/api/chat/${roomId}`, { cache: "no-store" });
      const payload = (await response.json()) as MessageResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to load messages.");
      }
      setMessages(payload.data?.items ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load messages.");
    }
  }

  async function sendMessage() {
    if (!selectedRoomId || !messageText.trim()) {
      return;
    }

    setError(null);
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoomId,
          text: messageText.trim()
        })
      });
      const payload = (await response.json()) as MessageResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to send message.");
      }
      setMessageText("");
      await loadMessages(selectedRoomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
    }
  }

  async function createRoom() {
    if (!roomTitle.trim()) {
      setError("Room title is required.");
      return;
    }

    setError(null);
    try {
      const response = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: roomTitle.trim(),
          projectId: roomProjectId || undefined
        })
      });
      const payload = (await response.json()) as RoomResponse;
      if (!response.ok || !payload.ok || !payload.data?.room) {
        throw new Error(payload.error?.message ?? "Unable to create room.");
      }

      await refreshRooms();
      setSelectedRoomId(payload.data.room._id);
      setRoomTitle("");
      setRoomProjectId("");
      await loadMessages(payload.data.room._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create room.");
    }
  }

  useEffect(() => {
    startTransition(() => {
      void loadMessages(selectedRoomId);
    });
  }, [selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadMessages(selectedRoomId);
    }, 8000);

    return () => {
      window.clearInterval(timer);
    };
  }, [selectedRoomId]);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Chat rooms"
        title="Realtime collaboration room"
        description="Open a project room, send messages, or create a fresh collaboration space from the project board."
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Rooms</div>
              <h3 className="mt-2 text-lg font-semibold text-white">Available chat spaces</h3>
            </div>
            <Button onClick={() => void refreshRooms()} variant="secondary" className="px-3 py-2">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {rooms.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                No room found yet. Create one below and start collaboration.
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => setSelectedRoomId(room._id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    room._id === selectedRoomId
                      ? "border-cyan-300/40 bg-cyan-400/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{room.title}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">{room.type}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                    <Users className="h-4 w-4 text-cyan-200" />
                    {room.participantCount} participants
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Create room</div>
            <Input
              value={roomTitle}
              onChange={(event) => setRoomTitle(event.target.value)}
              placeholder="Enter room title"
              className="mt-4"
            />
            <select
              value={roomProjectId}
              onChange={(event) => setRoomProjectId(event.target.value)}
              className="mt-3 w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white"
            >
              <option value="">No linked project</option>
              {projectOptions.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
            <Button onClick={() => void createRoom()} className="mt-4 w-full">
              <Plus className="h-4 w-4" />
              Create Chat Room
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Conversation</div>
              <h3 className="mt-2 text-lg font-semibold text-white">{selectedRoom?.title ?? "Select a room"}</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {pending ? "Updating..." : selectedRoom ? `${selectedRoom.participantCount} members` : "No room selected"}
            </div>
          </div>

          <div className="mt-5 h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            {!selectedRoom ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Choose a room to open the chat feed.</div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No messages yet. Send the first one.</div>
            ) : (
              messages.map((message) => {
                const mine = message.senderId === currentUserId;
                return (
                  <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        mine ? "bg-cyan-400 text-slate-950" : "border border-white/10 bg-white/5 text-slate-100"
                      }`}
                    >
                      <div className={`text-xs ${mine ? "text-slate-900/70" : "text-cyan-200"}`}>{mine ? "You" : message.senderName ?? "User"}</div>
                      <div className="mt-1 whitespace-pre-wrap">{message.text}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <Input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder={selectedRoom ? "Write a message..." : "Select a room first"}
              disabled={!selectedRoom}
              className="flex-1"
            />
            <Button onClick={() => void sendMessage()} disabled={!selectedRoom || !messageText.trim()}>
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              <MessageSquare className="h-4 w-4 text-cyan-200" />
              Messages refresh automatically every few seconds.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
