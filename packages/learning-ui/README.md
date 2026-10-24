# Shared learning UI

`@buildment/learning-ui` owns the browser-safe lesson blocks, diagrams, canvases,
UI primitives, and quiz integrity engine used by web and desktop. Edit these
implementations here. The old frontend paths re-export the package for existing
readers and tests; they contain no duplicate implementation.

Both apps declare a local `file:../packages/learning-ui` dependency. Run `pnpm
--dir frontend install` and `pnpm --dir desktop install` after changing this
package so their local package snapshots and lockfiles stay current. Each app
registers the installed package's `src` directory with Tailwind's `@source`
directive; no cross-application CSS import is required.

Components receive data and callbacks. Keep Next.js, Electron, session tokens,
and application API clients outside this package. The integrity hook requires
an explicit transport: web supplies its cookie-based API client; desktop supplies
its authenticated IPC adapter. React and React DOM are peer dependencies, while
Base UI, its utilities, D3, and other rendering dependencies belong to this package.

`src/shared` contains only the contract subset listed in `contracts.json`.
Update it with `pnpm --dir server sync-shared`; CI verifies it alongside the web
contract copy. Assets are bundled for desktop and served from public paths on web.

Web Docker builds now use the repository root context:
`docker build -f frontend/Dockerfile -t buildment-web .`
