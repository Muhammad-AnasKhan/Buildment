import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { markDeliveredForUser } from "../services/help/delivery.js";
import { addConnection, removeConnection, sendFrame } from "../services/realtime/hub.js";

// A named heartbeat event (not a comment) so the browser can tell a live stream from one
// a proxy is silently buffering. Must stay well under the frontend proxy's idle timeout.
const HEARTBEAT_MS = 10_000;

// GET /api/v1/events/stream — Server-Sent Events for the signed-in user.
export async function stream(req: Request, res: Response) {
  const user = req.user!;

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    // no-transform keeps compression middleware (including Next's proxy) from buffering the stream.
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  req.socket.setTimeout(0);
  req.socket.setKeepAlive(true);

  res.write("retry: 3000\n\n");
  addConnection(user.id, res);
  sendFrame(res, "ready", {});

  const heartbeat = setInterval(() => sendFrame(res, "ping", {}), HEARTBEAT_MS);
  req.on("close", () => {
    clearInterval(heartbeat);
    removeConnection(user.id, res);
  });

  // They are online now: anything sent to them while they were away counts as delivered.
  void markDeliveredForUser(user.id).catch((error: unknown) => logger.warn({ err: error }, "failed to mark messages delivered"));
}
