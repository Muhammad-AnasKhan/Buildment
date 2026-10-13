import type { ErrorRequestHandler, Request, RequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/index.js";
import { isProduction } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import { errorBody } from "../utils/responses.js";

type BodyParserError = Error & { type?: string; status?: number };

function knownPrismaErrorCode(error: unknown): string | null {
  return error instanceof Prisma.PrismaClientKnownRequestError ? (error as { code: string }).code : null;
}

/** Normalise well-known thrown shapes into an AppError with a stable code. */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));
    return new AppError(errors[0]?.message ?? "Validation failed", 400, "VALIDATION_ERROR", { errors });
  }

  const prismaCode = knownPrismaErrorCode(error);
  if (prismaCode === "P2025") return new AppError("Resource not found", 404, "NOT_FOUND", { cause: error });
  if (prismaCode === "P2002") return new AppError("Resource already exists", 409, "CONFLICT", { cause: error });
  if (prismaCode === "P2003") {
    return new AppError("A related resource does not exist", 400, "BAD_REQUEST", { cause: error });
  }

  const parserError = error as BodyParserError;
  if (parserError?.type === "entity.parse.failed") {
    return new AppError("Invalid JSON body", 400, "BAD_REQUEST");
  }
  if (parserError?.type === "entity.too.large") {
    return new AppError("Request body too large", 413, "PAYLOAD_TOO_LARGE");
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return new AppError(message, 500, "INTERNAL", { isOperational: false, cause: error });
}

/** 5xx → error with stack, 4xx → warn. Unexpected 5xx are the ones worth alerting on. */
export function logError(error: AppError, req: Request) {
  const context = {
    code: error.code,
    status: error.statusCode,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id ?? null,
    organizationId: req.organization?.id ?? null,
  };
  if (error.statusCode >= 500) {
    logger.error({ ...context, unexpected: !error.isOperational, err: error.cause ?? error }, error.message);
  } else {
    logger.warn(context, error.message);
  }
}

/** Message safe to send back: never leak internals from an unexpected 5xx in production. */
export function publicMessage(error: AppError): string {
  const hide = isProduction && error.statusCode >= 500 && !error.isOperational;
  return hide ? "Something went wrong on our end. Please try again." : error.message;
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const appError = normalizeError(error);
  logError(appError, req);
  res.status(appError.statusCode).json(errorBody(publicMessage(appError), appError.code, appError.errors));
};
