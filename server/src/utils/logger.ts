import pino from "pino";
import { env, isProduction, isTest } from "../config/env.js";

// Structured JSON in production (ready for a log aggregator); pretty-printed locally.
export const logger = pino({
  level: isTest ? "silent" : env.LOG_LEVEL,
  base: { service: "buildment-api" },
  redact: ["req.headers.authorization", "req.headers.cookie", 'req.headers["x-buildment-secret-key"]'],
  transport: isProduction
    ? undefined
    : { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname,service" } },
});
