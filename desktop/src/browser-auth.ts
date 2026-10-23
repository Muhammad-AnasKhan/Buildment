import { createServer } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { backendBase } from './api';
import type { Result } from './catalog';

type SignInResult = Result<{ signedIn: true }>;
export function createBrowserAuth(
  webBase: string,
  exchange: (code: string, verifier: string) => Promise<SignInResult>,
  openBrowser: (url: string) => Promise<unknown>,
) {
  let cancelCurrent: (() => void) | undefined;
  return {
    cancel() {
      cancelCurrent?.();
    },
    start(): Promise<SignInResult> {
      if (cancelCurrent)
        return Promise.resolve({
          ok: false,
          code: 'BUSY',
          message: 'A browser sign-in is already in progress.',
        });
      return new Promise((resolve) => {
        const state = randomBytes(32).toString('base64url');
        const verifier = randomBytes(32).toString('base64url');
        const challenge = createHash('sha256')
          .update(verifier)
          .digest('base64url');
        let completed = false;
        let exchanging = false;
        const finish = (result: SignInResult) => {
          if (completed) return;
          completed = true;
          clearTimeout(timeout);
          cancelCurrent = undefined;
          server.close();
          server.closeIdleConnections();
          resolve(result);
        };
        const server = createServer(async (request, response) => {
          const address = server.address();
          if (
            !address ||
            typeof address === 'string' ||
            request.headers.host !== `127.0.0.1:${address.port}` ||
            request.method !== 'GET'
          ) {
            response.writeHead(400).end();
            return;
          }
          const url = new URL(
            request.url || '/',
            `http://127.0.0.1:${address.port}`,
          );
          const code = url.searchParams.get('code') || '';
          if (
            url.pathname !== '/callback' ||
            url.searchParams.get('state') !== state ||
            !/^[A-Za-z0-9_-]{43}$/.test(code)
          ) {
            response.writeHead(400).end('Invalid desktop sign-in request.');
            return;
          }
          if (exchanging || completed) {
            response
              .writeHead(409)
              .end('This sign-in request is already being processed.');
            return;
          }
          exchanging = true;
          // Only a one-time code crosses the browser URL, never a session token.
          const result = await exchange(code, verifier).catch(
            (): SignInResult => ({
              ok: false,
              code: 'CONNECTION_ERROR',
              message: 'Could not complete sign-in. Please try again.',
            }),
          );
          response.writeHead(result.ok ? 200 : 400, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
            'Referrer-Policy': 'no-referrer',
            'Content-Security-Policy':
              "default-src 'none'; style-src 'unsafe-inline'",
          });
          response.end(
            `<!doctype html><html><head><title>Buildment desktop</title></head><body style="font:16px system-ui;max-width:480px;margin:15vh auto;padding:24px"><h1>${result.ok ? 'You’re connected' : 'Sign-in could not finish'}</h1><p>${result.ok ? 'Return to Buildment desktop. You can close this tab.' : 'Return to the desktop app and start sign-in again.'}</p></body></html>`,
          );
          finish(result);
        });
        const timeout = setTimeout(() => {
          if (!exchanging)
            finish({
              ok: false,
              code: 'TIMEOUT',
              message: 'Browser sign-in timed out. Please try again.',
            });
        }, 180_000);
        cancelCurrent = () =>
          finish({
            ok: false,
            code: 'CANCELLED',
            message: 'Browser sign-in cancelled.',
          });
        server.on('error', () =>
          finish({
            ok: false,
            code: 'CALLBACK_ERROR',
            message:
              'Could not start the local sign-in callback. Please try again.',
          }),
        );
        server.listen(0, '127.0.0.1', () => {
          try {
            const address = server.address();
            if (!address || typeof address === 'string')
              throw new Error('No callback port');
            const url = new URL('/desktop/connect', backendBase(webBase));
            url.search = new URLSearchParams({
              state,
              challenge,
              port: String(address.port),
            }).toString();
            void openBrowser(url.toString()).catch(() =>
              finish({
                ok: false,
                code: 'BROWSER_ERROR',
                message:
                  'Could not open your browser. Check your default browser and try again.',
              }),
            );
          } catch {
            finish({
              ok: false,
              code: 'CONFIG_ERROR',
              message: 'Check the BUILDMENT_WEB_URL configuration.',
            });
          }
        });
      });
    },
  };
}
