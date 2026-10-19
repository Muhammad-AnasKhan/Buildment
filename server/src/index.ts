import http from "node:http";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./db/prisma.js";
import { createApp } from "./app.js";
import { startScheduler } from "./jobs/scheduler.js";
import { startNotificationWorker } from "./jobs/notification-worker.js";
import { startRealtime } from "./realtime/sse.js";

async function start() {
  await prisma.$connect();
  logger.info("database connection established");

  const server = http.createServer(createApp());
  // Keep idle connections longer than any client or proxy in front of us does
  // (Node's fetch drops idle sockets after ~4s), otherwise a request can race a
  // server-side close and fail with "other side closed".
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, `API listening on http://localhost:${env.PORT}`);
  });
  const stopRealtime = startRealtime();
  const stopScheduler = startScheduler();
  const stopNotificationWorker = startNotificationWorker();

  const shutdown = (signal: string) => {
    logger.info({ signal }, "shutting down");
    stopScheduler();
    stopNotificationWorker();
    // Ends the open notification streams first: server.close() waits for every open response.
    stopRealtime();
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "unhandled promise rejection");
  process.exit(1);
});

start().catch((error) => {
  logger.fatal({ err: error }, "failed to start");
  process.exit(1);
});
