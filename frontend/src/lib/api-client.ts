// Browser-side client for the Buildment API. Paths are same-origin (`/api/v1/...`)
// and proxied by next.config.ts to the API service, which keeps the session cookie
// flowing without any token handling here. Server Components and Server Actions
// use `serverApiFetch` from api-server.ts instead, which talks to the API directly.
//
// Every first-party endpoint answers with one envelope:
//   { success: true, data }  |  { success: false, message, code, errors? }
// `apiFetch` unwraps `data` and throws `ApiError` for anything else.

export type ApiFieldError = { field: string; message: string };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly errors: ApiFieldError[] = []
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Envelope<T> =
  | { success: true; data: T }
  | { success: false; message: string; code: string; errors?: ApiFieldError[] };

export type ApiRequestInit = Omit<RequestInit, "body"> & {
  /** Serialised as the JSON body; sets the content type for you. */
  json?: unknown;
};

export function apiHeaders(init: ApiRequestInit): Record<string, string> {
  return {
    Accept: "application/json",
    ...(init.json !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
}

/** Unwraps the API envelope or throws `ApiError`. */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  // The API deliberately returns 204 for successful mutation endpoints that have
  // no response payload (for example, marking a chapter complete). There is no
  // JSON envelope to unwrap in that case.
  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!body || !body.success) {
    const message = body && !body.success ? body.message : `Request failed (${response.status})`;
    const code = body && !body.success ? body.code : "UNKNOWN";
    throw new ApiError(message, response.status, code, body && !body.success ? body.errors : undefined);
  }
  return body.data;
}

export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { json, ...rest } = init;
  const response = await fetchApiResponse(path, {
    ...rest,
    headers: apiHeaders(init),
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
  return parseApiResponse<T>(response);
}

/** Retry safe reads once; never replay a potentially successful mutation. */
export async function fetchApiResponse(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET")).toUpperCase();
  const signal = init?.signal ?? (typeof Request !== "undefined" && input instanceof Request ? input.signal : undefined);
  const attempts = method === "GET" || method === "HEAD" ? 2 : 1;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (signal?.aborted || (error instanceof Error && error.name === "AbortError")) throw error;
      if (attempt + 1 < attempts) {
        await new Promise(resolve => setTimeout(resolve, 200));
        continue;
      }
      const failure = new ApiError("Cannot reach the API server. Check your connection and try again.", 503, "API_UNAVAILABLE");
      failure.cause = error;
      throw failure;
    }
  }
}
