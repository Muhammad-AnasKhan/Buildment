import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backendBase, fetchCatalog } from '../src/api';
import { filterCourses } from '../src/catalog';
import { courses, courseDetail } from './fixtures';
import { createPreviewClient } from '../src/preview-api';
import { createBrowserAuth } from '../src/browser-auth';
import { createHash } from 'node:crypto';

test('catalog uses the existing envelope and fixed endpoint', async () => {
  const result = await fetchCatalog(
    'http://localhost:4000',
    async (url, init) => {
      assert.equal(url, 'http://localhost:4000/api/v1/catalog');
      assert.equal(init?.redirect, 'error');
      return Response.json({ success: true, data: { courses } });
    },
  );
  assert.deepEqual(result, { ok: true, courses });
});

test('browser callback rejects wrong state and binds code exchange to the private verifier', async () => {
  let challenge = '';
  const auth = createBrowserAuth(
    'http://localhost:3000',
    async (code, verifier) => {
      assert.equal(code, 'c'.repeat(43));
      assert.equal(
        createHash('sha256').update(verifier).digest('base64url'),
        challenge,
      );
      return { ok: true, data: { signedIn: true } };
    },
    async (raw) => {
      const url = new URL(raw);
      challenge = url.searchParams.get('challenge')!;
      assert.equal(url.pathname, '/desktop/connect');
      assert.equal(url.searchParams.has('verifier'), false);
      const callback = new URL(
        `http://127.0.0.1:${url.searchParams.get('port')}/callback`,
      );
      callback.search = new URLSearchParams({
        code: 'c'.repeat(43),
        state: 'invalid',
      }).toString();
      assert.equal((await fetch(callback)).status, 400);
      callback.searchParams.set('state', url.searchParams.get('state')!);
      assert.equal((await fetch(callback)).status, 200);
    },
  );
  try {
    assert.deepEqual(await auth.start(), {
      ok: true,
      data: { signedIn: true },
    });
  } finally {
    auth.cancel();
  }
});

test('browser opening failure resolves with an actionable error', async () => {
  const auth = createBrowserAuth(
    'http://localhost:3000',
    async () => {
      throw new Error('Must not exchange');
    },
    async () => {
      throw new Error('No browser');
    },
  );
  const result = await auth.start();
  assert.equal(!result.ok && result.code, 'BROWSER_ERROR');
});

test('preview login keeps bearer token private and sign-out clears it', async () => {
  const calls: string[] = [];
  const client = createPreviewClient(
    'http://localhost:4000',
    async (url, init) => {
      calls.push(String(url));
      if (String(url).endsWith('/exchange')) {
        assert.equal(new Headers(init?.headers).has('Authorization'), false);
        assert.deepEqual(JSON.parse(String(init?.body)), {
          code: 'c'.repeat(43),
          verifier: 'v'.repeat(43),
        });
        return Response.json({
          success: true,
          data: { session: { token: 'private-session' } },
        });
      }
      assert.equal(
        new Headers(init?.headers).get('Authorization'),
        'Bearer private-session',
      );
      return Response.json({
        success: true,
        data: String(url).endsWith('/logout')
          ? { loggedOut: true }
          : courseDetail,
      });
    },
  );
  assert.equal((await client.courseDetail('systems')).ok, false);
  assert.equal(calls.length, 0);
  assert.deepEqual(await client.exchange('c'.repeat(43), 'v'.repeat(43)), {
    ok: true,
    data: { signedIn: true },
  });
  assert.deepEqual(await client.courseDetail('systems'), {
    ok: true,
    data: courseDetail,
  });
  assert.deepEqual(await client.signOut(), {
    ok: true,
    data: { signedIn: false },
  });
  assert.equal((await client.courseDetail('systems')).ok, false);
  assert.equal(calls.length, 3);
});

test('expired sessions and unverified accounts respect backend access rules', async () => {
  let status = 403;
  const client = createPreviewClient('http://localhost:4000', async (url) =>
    String(url).endsWith('/exchange')
      ? Response.json({ success: true, data: { session: { token: 'token' } } })
      : Response.json(
          {
            success: false,
            code: 'EMAIL_UNVERIFIED',
            message: 'Verify your email',
          },
          { status },
        ),
  );
  await client.exchange('c'.repeat(43), 'v'.repeat(43));
  assert.deepEqual(await client.courseDetail('systems'), {
    ok: false,
    code: 'EMAIL_UNVERIFIED',
    message: 'Verify your email',
  });
  status = 401;
  const expired = await client.courseDetail('systems');
  assert.equal(!expired.ok && expired.code, 'AUTH_REQUIRED');
  const next = await client.courseDetail('systems');
  assert.equal(!next.ok && next.message, 'Sign in to view the curriculum.');
});

test('malformed curriculum fails safely and offline logout still clears local session', async () => {
  const client = createPreviewClient('http://localhost:4000', async (url) => {
    if (String(url).endsWith('/logout')) throw new Error('offline');
    return Response.json({
      success: true,
      data: String(url).endsWith('/exchange')
        ? { session: { token: 'token' } }
        : { ...courseDetail, modules: [{}] },
    });
  });
  await client.exchange('c'.repeat(43), 'v'.repeat(43));
  const detail = await client.courseDetail('systems');
  assert.equal(!detail.ok && detail.code, 'INVALID_RESPONSE');
  const logout = await client.signOut();
  assert.equal(!logout.ok && logout.code, 'LOCAL_SIGN_OUT');
  const next = await client.courseDetail('systems');
  assert.equal(!next.ok && next.code, 'AUTH_REQUIRED');
});
test('rejects malformed courses without rendering broken data', async () => {
  for (const body of [
    { success: true, data: { courses: [{}] } },
    { success: false },
    {},
  ]) {
    assert.equal(
      (
        await fetchCatalog('http://localhost:4000', async () =>
          Response.json(body),
        )
      ).ok,
      false,
    );
  }
});
test('distinguishes empty catalog from HTTP and network failures', async () => {
  assert.deepEqual(
    await fetchCatalog('http://localhost:4000', async () =>
      Response.json({ success: true, data: { courses: [] } }),
    ),
    { ok: true, courses: [] },
  );
  assert.equal(
    (
      await fetchCatalog(
        'http://localhost:4000',
        async () => new Response('', { status: 503 }),
      )
    ).ok,
    false,
  );
  assert.equal(
    (
      await fetchCatalog('http://localhost:4000', async () => {
        throw new Error('offline');
      })
    ).ok,
    false,
  );
});
test('only allows secure remote or loopback backend origins', () => {
  assert.equal(
    backendBase('https://api.example.com/'),
    'https://api.example.com',
  );
  for (const url of [
    'http://example.com',
    'https://user:secret@example.com',
    'file:///tmp',
    'https://example.com/api',
  ])
    assert.throws(() => backendBase(url));
});
test('search and category selection work together', () => {
  assert.equal(filterCourses(courses, '  LINUX ', 'TECH').length, 1);
  assert.equal(filterCourses(courses, 'Linux', 'SOFT_SKILLS').length, 0);
  assert.equal(filterCourses(courses, 'mentor', 'all')[0]?.id, 'two');
});
