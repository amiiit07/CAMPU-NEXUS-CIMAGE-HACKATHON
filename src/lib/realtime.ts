import { Server as SocketServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var campusNexusIo: SocketServer | undefined;
}

export function getSocketServer() {
  return globalThis.campusNexusIo ?? null;
}

export function registerSocketServer(server: SocketServer) {
  globalThis.campusNexusIo = server;
  return server;
}
