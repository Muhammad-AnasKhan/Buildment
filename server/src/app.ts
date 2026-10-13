import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env, isTest } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { apiLimiter } from "./middlewares/rate-limit.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import routes from "./routes/index.js";

/** Builds the Express app without listening, so tests can drive it with supertest. */
export function createApp() {
  const app = express();

  // Behind the Next.js proxy / a load balancer: trust one hop so req.ip is the client.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // JSON API for other origins: CSP/COEP protect nothing here and would break the
  // few redirects we serve. HSTS belongs to the TLS terminator.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, hsts: false }));

  // Same-origin traffic arrives through the frontend proxy (no Origin check needed).
  // CORS_ORIGINS is for clients that call the API host directly.
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`Origin ${origin} is not allowed`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  if (!isTest) {
    app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));
  }

  app.use(apiLimiter);
  app.use(routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
