# Shared learning UI

`@buildment/learning-ui` owns the shared course-block renderers, labs, diagrams,
canvases, exercise clients, and quiz integrity engine used by web and desktop.
Edit visual block implementations here so both readers stay consistent.

`src/lesson-blocks.tsx` is the shared MDX block registry. The web and desktop
registries extend it with host-specific blocks and adapters. Shared blocks
include Checklist and Learning Log as well as the course content and activity
blocks. For interactive blocks, pass initial state and callbacks into the
package component; keep server actions, API clients, and IPC calls in the host
app. Host adapters may load or save state, but must not duplicate block UI.

Canvas consumers import this package directly; the frontend canvas folder has
been removed. Legacy frontend component paths should remain thin adapters or
re-exports, not duplicate visual implementations.

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
