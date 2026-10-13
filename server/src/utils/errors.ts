// Errors services throw and the global error handler turns into one response
// envelope: { success: false, message, code, errors? }. `code` is a stable string
// clients branch on; `message` is safe to show to a person.

export type FieldError = { field: string; message: string };

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly errors: FieldError[] | null;
  /** Expected failures (4xx) versus bugs. Only unexpected errors page anyone. */
  readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    options: { errors?: FieldError[] | null; isOperational?: boolean; cause?: unknown } = {}
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = options.errors ?? null;
    this.isOperational = options.isOperational ?? true;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors: FieldError[] = []) {
    super(message, 400, "VALIDATION_ERROR", { errors });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", code = "AUTH_REQUIRED") {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists", code = "CONFLICT") {
    super(message, 409, code);
  }
}

/** The request is well-formed but a business rule rejects it; `errors` lists each reason. */
export class UnprocessableError extends AppError {
  constructor(message: string, code = "UNPROCESSABLE", reasons: string[] = []) {
    super(message, 422, code, { errors: reasons.map((reason) => ({ field: "_", message: reason })) });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class NotImplementedError extends AppError {
  constructor(message = "Not implemented") {
    super(message, 501, "NOT_IMPLEMENTED");
  }
}

export class InternalError extends AppError {
  constructor(message = "Something went wrong on our end", cause?: unknown) {
    super(message, 500, "INTERNAL", { isOperational: false, cause });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
