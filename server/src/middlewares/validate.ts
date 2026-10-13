import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";
import { ValidationError, type FieldError } from "../utils/errors.js";

type Segment = "body" | "query" | "params";

type Schemas = Partial<Record<Segment, ZodType>>;

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldError[] {
  return issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));
}

/**
 * Validates request segments against Zod schemas and replaces them with the parsed
 * values, so controllers only ever see typed, coerced, stripped input.
 *
 *   router.post("/", validate({ params: idParams, body: createBody }), controller.create)
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: FieldError[] = [];
    for (const segment of ["params", "query", "body"] as const) {
      const schema = schemas[segment];
      if (!schema) continue;
      const result = schema.safeParse(req[segment]);
      if (!result.success) {
        errors.push(...fieldErrors(result.error.issues));
        continue;
      }
      // Express 5 exposes `query` through a prototype getter; an own property shadows it.
      Object.defineProperty(req, segment, { value: result.data, writable: true, configurable: true, enumerable: true });
    }
    if (errors.length) {
      return next(new ValidationError(errors[0]?.message ?? "Validation failed", errors));
    }
    next();
  };
}

export const validateBody = (schema: ZodType) => validate({ body: schema });
export const validateQuery = (schema: ZodType) => validate({ query: schema });
export const validateParams = (schema: ZodType) => validate({ params: schema });
