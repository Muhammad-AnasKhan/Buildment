# Course import (staging)

Paste your existing course here — any layout is fine for now (folders, `.md`, `.mdx`, etc.).

## Current import

The **FreshMarket — Multi-Vendor Grocery Marketplace** course lives in
`multi-vendor-marketplace/` (347 lessons across 24 modules).

To load or refresh it in the database after editing source files:

```bash
pnpm db:seed          # ensures mentor + mentee users exist
pnpm content:import   # upserts Course / Module / Chapter / Block rows
pnpm content:validate # compiles every chapter's MDX (fast sanity check)
```

Transformed MDX output is written to `content/transformed/multi-vendor-marketplace/` for
review — do not edit that folder manually; change files under `content/import/` and re-run
`content:import`.

## What the import does

- **Course** → `Course` record (title, slug, description, …)
- **Module folders** (`01-introduction/`, …) → `Module` rows
- **Lesson files** (`01.01-what-youre-building.md`, …) → `Chapter` rows with MDX in `Chapter.source`
- **` ```quiz` blocks** → real `<Quiz>` / `<OpenQuestion>` interactive blocks (answers in server-only `Block.config`)
- **Reserved quiz stubs** → mini self-check questions become optional `<OpenQuestion>` blocks
- **MDX safety** → braces and angle brackets in prose are escaped so technical writing renders correctly

## Viewing the course

1. `pnpm dev`
2. Log in as a seeded mentee (e.g. `mentee1@buildment.dev` via the dev login link on `/login`)
3. Open **Dashboard** → **FreshMarket — Multi-Vendor Grocery Marketplace**
