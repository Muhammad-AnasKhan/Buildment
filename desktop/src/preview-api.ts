import { backendBase, isCourse } from './api';
import type { CourseDetail, Result } from './catalog';

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object';
function isDetail(value: unknown): value is CourseDetail {
  if (!isCourse(value) || !record(value)) return false;
  const detail = value as unknown as Record<string, unknown>;
  return (
    ['active', 'payment_required', 'none'].includes(String(detail.access)) &&
    Array.isArray(detail.modules) &&
    detail.modules.every(
      (module) =>
        record(module) &&
        typeof module.id === 'string' &&
        typeof module.title === 'string' &&
        typeof module.order === 'number' &&
        Array.isArray(module.chapters) &&
        module.chapters.every(
          (chapter) =>
            record(chapter) &&
            typeof chapter.id === 'string' &&
            typeof chapter.title === 'string' &&
            typeof chapter.order === 'number' &&
            (chapter.estimatedMinutes === null ||
              typeof chapter.estimatedMinutes === 'number'),
        ),
    )
  );
}

// This module runs only in Electron's main process. Tokens never cross IPC.
export function createPreviewClient(
  base: string,
  request: typeof fetch = fetch,
) {
  let token: string | null = null;
  let authVersion = 0;
  async function call(
    path: string,
    method = 'GET',
    body?: unknown,
    session = token,
  ): Promise<Result<unknown>> {
    try {
      const response = await request(`${backendBase(base)}${path}`, {
        method,
        redirect: 'error',
        signal: AbortSignal.timeout(15_000),
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(session ? { Authorization: `Bearer ${session}` } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (response.status === 401 && session && session === token) token = null;
      const payload: unknown = await response.json();
      if (!response.ok || !record(payload) || payload.success !== true) {
        return {
          ok: false,
          code:
            response.status === 401
              ? 'AUTH_REQUIRED'
              : record(payload) && typeof payload.code === 'string'
                ? payload.code
                : 'REQUEST_FAILED',
          message:
            record(payload) && typeof payload.message === 'string'
              ? payload.message.slice(0, 500)
              : 'The request could not be completed. Please try again.',
        };
      }
      return { ok: true, data: payload.data };
    } catch {
      return {
        ok: false,
        code: 'CONNECTION_ERROR',
        message:
          'Could not reach the course service. Check your connection and try again.',
      };
    }
  }
  return {
    async courseDetail(slug: string): Promise<Result<CourseDetail>> {
      if (typeof slug !== 'string' || !slug || slug.length > 200)
        return { ok: false, code: 'INVALID_INPUT', message: 'Invalid course.' };
      if (!token)
        return {
          ok: false,
          code: 'AUTH_REQUIRED',
          message: 'Sign in to view the curriculum.',
        };
      const result = await call(`/api/v1/catalog/${encodeURIComponent(slug)}`);
      if (!result.ok) return result;
      if (!isDetail(result.data))
        return {
          ok: false,
          code: 'INVALID_RESPONSE',
          message:
            'The course service returned an unexpected curriculum. Please try again.',
        };
      return { ok: true, data: result.data };
    },
    cancelSignIn() {
      authVersion++;
    },
    async exchange(
      code: string,
      verifier: string,
    ): Promise<Result<{ signedIn: true }>> {
      if (
        !/^[A-Za-z0-9_-]{43}$/.test(code) ||
        !/^[A-Za-z0-9_-]{43}$/.test(verifier)
      )
        return {
          ok: false,
          code: 'INVALID_INPUT',
          message: 'Invalid browser sign-in response.',
        };
      const version = ++authVersion;
      const result = await call(
        '/api/v1/auth/desktop/exchange',
        'POST',
        { code, verifier },
        null,
      );
      if (!result.ok) return result;
      if (
        !record(result.data) ||
        !record(result.data.session) ||
        typeof result.data.session.token !== 'string' ||
        !result.data.session.token
      ) {
        return {
          ok: false,
          code: 'INVALID_RESPONSE',
          message:
            'The service did not return a valid session. Please try again.',
        };
      }
      if (version !== authVersion)
        return {
          ok: false,
          code: 'CANCELLED',
          message: 'Sign-in was cancelled. Please try again.',
        };
      token = result.data.session.token;
      return { ok: true, data: { signedIn: true } };
    },
    async signOut(): Promise<Result<{ signedIn: false }>> {
      const previous = token;
      token = null;
      authVersion++;
      if (previous) {
        const result = await call(
          '/api/v1/auth/logout',
          'POST',
          undefined,
          previous,
        );
        if (!result.ok)
          return {
            ok: false,
            code: 'LOCAL_SIGN_OUT',
            message:
              'Signed out on this device. The service could not confirm session revocation.',
          };
      }
      return { ok: true, data: { signedIn: false } };
    },
  };
}
