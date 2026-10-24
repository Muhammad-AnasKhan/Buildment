import type { IntegrityTransport } from '@buildment/learning-ui/lib/integrity/use-quiz-integrity';

// The shared web hook uses this adapter so all desktop requests go through IPC.
export const integrityTransport: IntegrityTransport = {
  async apiFetch<T>(
    path: string,
    options: { method?: string; json?: unknown } = {},
  ): Promise<T> {
    const result = await window.buildment.integrityRequest(
      path,
      options.method || 'GET',
      options.json,
    );
    if (!result.ok) throw new Error(result.message);
    return result.data as T;
  },
  async fetch(input, options = {}) {
    const path = String(input);
    let body: unknown;
    if (options.body instanceof Blob)
      body = new Uint8Array(await options.body.arrayBuffer());
    else if (typeof options.body === 'string') body = JSON.parse(options.body);
    const result = await window.buildment.integrityRequest(
      path,
      options.method || 'GET',
      body,
    );
    if (result.ok) return Response.json({ success: true, data: result.data });
    let status = 503;
    if (result.code === 'AUTH_REQUIRED') status = 401;
    if (result.code === 'INVALID_INPUT') status = 400;
    if (result.code === 'FORBIDDEN') status = 403;
    if (result.code === 'NOT_FOUND') status = 404;
    return Response.json(
      { success: false, message: result.message },
      { status },
    );
  },
};
