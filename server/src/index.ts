import http from "node:http";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./db/prisma.js";
import { createApp } from "./app.js";

async function start() {
  await prisma.$connect();
  logger.info("database connection established");

  const server = http.createServer(createApp());
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, `API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, "shutting down");
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
