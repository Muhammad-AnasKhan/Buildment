import type { Response } from "express";
import type { FieldError } from "./errors.js";

// The first-party API (/api/v1) answers with one envelope so every client — web,
// desktop, scripts — can parse responses the same way.
//   success: { success: true, data }
//   failure: { success: false, message, code, errors? }
// The public organisation API (/integrations/v1) is a separate, versioned contract
// and keeps its own shapes — see controllers/integrations.

export type SuccessBody<T> = { success: true; data: T; message?: string };
export type ErrorBody = { success: false; message: string; code: string; errors?: FieldError[] };

export function ok<T>(res: Response, data: T, options: { status?: number; message?: string } = {}) {
  const body: SuccessBody<T> = { success: true, data };
  if (options.message) body.message = options.message;
  return res.status(options.status ?? 200).json(body);
}

export function created<T>(res: Response, data: T, message?: string) {
  return ok(res, data, { status: 201, message });
}

export function noContent(res: Response) {
  return res.status(204).end();
}

export function errorBody(message: string, code: string, errors?: FieldError[] | null): ErrorBody {
  const body: ErrorBody = { success: false, message, code };
  if (errors && errors.length) body.errors = errors;
  return body;
}
