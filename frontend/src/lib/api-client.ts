// Browser-side client for the Buildment API. Paths are same-origin (`/api/v1/...`)
// and proxied by next.config.ts to the API service, which keeps the session cookie
// flowing without any token handling here.
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

export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const response = await fetch(path, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  const body = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!body || !body.success) {
    const message = body && !body.success ? body.message : `Request failed (${response.status})`;
    const code = body && !body.success ? body.code : "UNKNOWN";
    throw new ApiError(message, response.status, code, body && !body.success ? body.errors : undefined);
  }
  return body.data;
}
