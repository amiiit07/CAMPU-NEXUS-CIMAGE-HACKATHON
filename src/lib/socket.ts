import { EventEmitter } from "events";

type SocketEvent = {
  type: "message" | "notification";
  payload: unknown;
};

const globalWithBus = globalThis as typeof globalThis & { campusSocketBus?: EventEmitter };

export function socketBus() {
  if (!globalWithBus.campusSocketBus) {
    globalWithBus.campusSocketBus = new EventEmitter();
    globalWithBus.campusSocketBus.setMaxListeners(200);
  }
  return globalWithBus.campusSocketBus;
}

export function emitSocketEvent(event: SocketEvent) {
  socketBus().emit(event.type, event.payload);
}
