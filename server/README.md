# @buildment/server

The Buildment API: Express 5 + TypeScript (ESM), Prisma 7 on PostgreSQL, Zod validation.

```
src/
├─ index.ts          process entry: connect DB, listen, graceful shutdown
├─ app.ts            Express app assembly (importable by tests)
├─ config/env.ts     every env var, validated once at boot
├─ routes/           URL → middleware chain → controller
│  ├─ v1/            first-party API (/api/v1) — { success, data } envelope
│  └─ integrations   public organisation API (/integrations/v1) — published contract
├─ validations/      Zod schemas for params / query / body, reused by services
├─ controllers/      thin: read validated input, call a service, send a response
├─ services/         all business logic and Prisma access, grouped by domain
├─ middlewares/      authenticate, requireOrganization, validate, rate limits, error handlers
├─ utils/            errors (AppError family), responses (ok/created), logger
├─ types/            Express request augmentation, SessionUser, view models
└─ generated/prisma  Prisma client (generated, git-ignored)
tests/
├─ api/              supertest suites against a real Postgres
└─ helpers/          fixtures that build and tear down their own course/org
prisma/              schema, migrations, seed
```

## Conventions

- **Flow:** route → `validate(...)` → controller → service. Controllers never touch Prisma.
- **Errors:** services throw `NotFoundError`, `ForbiddenError("...", "STABLE_CODE")`, etc. from
  `utils/errors`. The global handler turns them into `{ success: false, message, code, errors? }`.
  Express 5 forwards rejected promises, so no `catchAsync` wrappers.
- **Auth:** opaque session tokens in the `Session` table, accepted as `Authorization: Bearer` or
  the `authjs.session-token` cookie. `authenticate` rejects, `optionalAuth` only decorates.
- **Config:** import `env` from `config/env.ts`; never read `process.env` elsewhere.
- **Shared code:** block schemas/graders and domain enums come from `@buildment/shared`.

## Commands

| Command | |
|---|---|
| `pnpm dev` | `tsx watch` with pretty logs |
| `pnpm build` / `pnpm start` | compile to `dist/` and run it |
| `pnpm test` | unit + API tests (`DATABASE_URL`, or `TEST_DATABASE_URL`, must point at Postgres) |
| `pnpm typecheck` / `pnpm lint` | |
| `pnpm db:migrate` / `db:ready` / `db:seed` / `db:studio` | Prisma |
