# Buildment desktop — implementation plan for review

## Goal

Build an Electron desktop app with React, TypeScript, and Tailwind CSS. Build and review one screen at a time, starting with the backend-connected course catalog, then course previews.

## What you will see

- A consistent desktop theme with one collapsible navigation sidebar.
- A Courses screen with search, course cards, descriptions, difficulty, instructor, and module/chapter counts where supplied by the backend.
- A separate course preview screen with the course description, project goal, estimated duration, pricing, and cover image when available.
- A back button to return to the course list.
- Loading, empty, connection-error, and retry states.
- Sign-in when a learner wants to view the module and chapter outline, which currently requires a verified account on the backend.

The app will open to the public course catalog. Sign-in will be optional for public previews. If you prefer a login screen first, we can change that before implementation.

## Backend integration

Use the existing API and preserve its access rules:

| Purpose | Endpoint | Access |
| --- | --- | --- |
| Course list and public preview information | `GET /api/v1/catalog` | Public |
| Authorize desktop in browser | `POST /api/v1/auth/desktop/authorize` | Verified browser session |
| Exchange single-use code | `POST /api/v1/auth/desktop/exchange` | Code and matching verifier |
| Module and chapter outline | `GET /api/v1/catalog/:courseSlug` | Verified account |
| Sign out | `POST /api/v1/auth/logout` | Current session |

Public previews will use the information returned by the catalog. The protected detail endpoint will provide the outline after sign-in. This phase does not include reading full lessons or submitting quizzes.

Requests will run through Electron's main process. A small, typed preload bridge will expose only the course and authentication operations needed by the UI. The renderer will have no direct Node.js access. Session tokens will remain in main-process memory; closing the app will require signing in again. Passwords will not be saved.

The backend address defaults to `http://localhost:4000`, and the browser web origin defaults to `http://localhost:3000`. Desktop authorization uses the existing verification-token table without a database migration. The app displays real backend data, not a bundled sample catalog.

## Implementation steps

1. Finish generating the app in `desktop/` using Electron Forge's Vite and TypeScript template:
   `npx --yes create-electron-app@latest desktop --template vite --typescript`
2. Set the application name to Buildment and configure its window and security settings. Keep developer tools closed by default.
3. Add typed API handling, backend configuration, request timeouts, and clear error messages.
4. Build the course catalog and search as React components first. Build the dedicated preview screen in the next UI iteration.
5. Add sign-in and sign-out for protected course outlines, with errors for expired sessions or unverified accounts.
6. Configure Tailwind CSS through its Vite plugin. Use Tailwind utilities and shared theme tokens for a unified theme, a collapsible sidebar, keyboard navigation, and smaller window sizes. Keep utility class names statically discoverable in the TypeScript templates.
7. Document dependency installation, backend configuration, starting the app, and packaging it.
8. Run type checking, linting, focused API/error-handling checks, and a desktop build. Check the UI and live backend connection when the required local services are available, and report any checks that cannot run.

## Files and scope

Implementation will live in `desktop/`, including its own package manifest and npm lockfile, Electron configuration, main/preload code, renderer code, styles, and README. The existing web and server applications will remain independent.

This phase excludes IDE/editor features, terminals, Docker controls, Linux environments, labs, quiz submission, enrollment/payment flows, offline downloads, and automatic updates. Those can be added as later phases.

## Current state and review gate

The first UI is implemented: a React course catalog with Tailwind styling and the existing public backend API connected through Electron's preload bridge. Type checking, API tests, UI tests, and a packaged Windows app smoke test passed. The live local backend did not respond during verification; UI and packaged-app checks used isolated test fixtures.

The user approved React + TypeScript + Tailwind and implementation one UI at a time. Dedicated course previews, protected curriculum outlines, and default-browser authentication are now implemented alongside the branded startup loader. Browser authentication includes a web connection page and backend code exchange; passwords never enter the desktop renderer. The user authorized committing and pushing this work on a separate branch named without a Codex prefix. Application deployment is separate from that push.
