# Buildment desktop

Electron Forge + React + TypeScript + Tailwind CSS. Includes the public course catalog, dedicated course previews, protected curriculum outlines, browser sign-in, and a branded startup loader. No IDE or labs are included yet.

From the repository root:

```powershell
pnpm --dir desktop install
# Start your configured backend separately:
pnpm --dir server dev
# In separate terminals:
pnpm --dir frontend dev
pnpm --dir desktop start
```

The backend defaults to `http://localhost:4000`. To connect to another deployment, set its origin before starting the app:

```powershell
$env:BUILDMENT_API_URL = 'https://your-api.example.com'
npm --prefix desktop start
```

Remote backends must use HTTPS. The API must implement `GET /api/v1/catalog`, returning the existing Buildment success envelope. The app imports only shared API types from `server/`; it does not bundle backend runtime code. Run install/build commands from this repository checkout.

Sign-in opens the default browser (Chrome if configured as default). The web app defaults to `http://localhost:3000`; configure `BUILDMENT_WEB_URL` alongside `BUILDMENT_API_URL` for other deployments. Deploy the included web connection page and backend desktop authorization/exchange endpoints together. A short-lived, single-use code with proof verification returns through a loopback callback. Session tokens remain in Electron main-process memory, and closing the app requires signing in again. No database migration is required.

Course requests run in Electron's main process over a narrowly scoped preload bridge. Renderer Node integration is disabled. There are no credentials, fixture courses, or secrets in the application. Cover images use remote HTTPS URLs or local HTTP URLs; missing images show a decorative placeholder.

```powershell
npm --prefix desktop run typecheck
npm --prefix desktop run lint
npm --prefix desktop test
npm --prefix desktop run test:ui
npm --prefix desktop run package
```

On Windows, after packaging, `cd desktop` and run `npx tsx tests/desktop-smoke.mts` to check the packaged application's real preload and HTTP connection against a temporary local test API. It closes the app when finished.

UI tests use isolated backend fixtures through a mocked desktop bridge and require a locally installed Chrome. They do not validate a live backend. Packaging produces an application in `desktop/out/`; `npm --prefix desktop run make` creates a platform-specific distributable. Signing and publishing are not configured.
