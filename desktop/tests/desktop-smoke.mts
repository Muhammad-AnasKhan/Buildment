import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { courses } from './fixtures';

// Windows desktop smoke test. The temporary API never contacts production.
// Set TEST_DESKTOP_DEV=1 while Forge's development server is running to test dev startup.
const development = process.env.TEST_DESKTOP_DEV === '1';
const server = createServer((request, response) => {
  if (request.url !== '/api/v1/catalog') {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ success: true, data: { courses } }));
});
await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string')
  throw new Error('Missing fixture server address');
await mkdir('test-results', { recursive: true });
const profile = await mkdtemp(path.resolve('test-results/electron-profile-'));
const child = spawn(
  path.resolve(
    development
      ? 'node_modules/electron/dist/electron.exe'
      : 'out/Buildment-win32-x64/Buildment.exe',
  ),
  [
    ...(development ? [path.resolve('.')] : []),
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
  ],
  {
    windowsHide: true,
    env: {
      ...process.env,
      BUILDMENT_API_URL: `http://127.0.0.1:${address.port}`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
let browser;
try {
  const endpoint = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Desktop did not start in 30 seconds')),
      30_000,
    );
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Desktop exited: ${code}`));
    });
    child.stderr.on('data', (data) => {
      if (development) console.log(String(data));
      const match = String(data).match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
  });
  browser = await chromium.connectOverCDP(endpoint);
  const context = browser.contexts()[0];
  const page = context.pages()[0] || (await context.waitForEvent('page'));
  page.on('pageerror', (error) =>
    console.error('Renderer error:', error.message),
  );
  page.on('console', (message) => {
    if (message.type() === 'error')
      console.error('Renderer console:', message.text());
  });
  page.on('requestfailed', (request) =>
    console.error('Request failed:', request.url(), request.failure()),
  );
  console.log('Renderer URL:', page.url());
  await expect(
    page.getByRole('heading', { name: courses[0].title }),
  ).toBeVisible();
  await expect(page.locator('article')).toHaveCount(2);
  expect(
    await page.evaluate(
      () => typeof (window as unknown as { require?: unknown }).require,
    ),
  ).toBe('undefined');
  expect(await page.evaluate(() => typeof window.buildment.listCourses)).toBe(
    'function',
  );
  await page.screenshot({ path: 'test-results/desktop-packaged.png' });
  console.log(
    'Packaged desktop passed: renderer, preload bridge, HTTP catalog, and Node isolation.',
  );
} finally {
  await browser?.close();
  child.kill();
  server.closeAllConnections();
  server.close();
}
