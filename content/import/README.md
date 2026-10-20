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

## More than one course

Each folder here is one course. The content scripts take `--course <slug>` (the folder name) and
default to `multi-vendor-marketplace`. Run them from `server/`:

```bash
pnpm content:validate:source --course decision-making
pnpm content:audit --course decision-making
pnpm content:import --course decision-making
```

A new course needs a `course.yaml` with its catalog metadata and the planned modules and lessons;
the audit fails when the lesson files and the plan disagree. FreshMarket has no `course.yaml` and
keeps its metadata in `server/src/shared/lib/seed-data.ts`. The full process for building a course
(brief, roadmap, writing, critique, publish) is the course factory in [`agent-ip/`](../../agent-ip/README.md).

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

## Import a ZIP from the mentor workspace

On **Your courses**, choose **Import course ZIP**. Include `course.yaml` and the
numbered module folders with their lesson Markdown files. `COURSE-OUTLINE.md` is
optional. These files can be at the archive root or inside one course folder.
Use the manifest format in `decision-making/course.yaml`; its slug must be unique.
Do not include dependencies, images, system metadata folders, or executable files.

The browser posts the ZIP bytes as `application/zip` to
`POST /api/v1/teach/courses/import` through the existing frontend API proxy. The
endpoint requires the same signed-in, verified instructor access as the other
mentor endpoints and returns `{ success: true, data: { courseSlug } }` on success.
Validation errors use the standard API envelope with details in `errors`.

Limits are 5 MB uploaded, 20 MB expanded, and 1,000 archive entries. Imports run
one at a time per API process. The shared source validator and strict structure
audit run before any database writes. A successful import creates a new draft
course and draft chapters owned by the importing instructor. Review and publish
chapters and the course through the existing editor. Existing slugs return 409;
imports never replace an existing course or learner history.

The original parser and validators remain in `server/scripts/`. The separate
`server/scripts/zip-import/worker.ts` reuses them through the existing production
`tsx` dependency. Heroku includes these scripts; the container image also copies
the shared schemas and MDX helpers they need. Runtime validation uses a bounded child process
(15 seconds), then an atomic Postgres transaction (10 seconds). Temporary files
are removed when the request finishes; no persistent filesystem, new service,
config variable, or database migration is required on Heroku. Deploy the API and
frontend changes together using the existing deployment workflow.


### Quiz flow content

Quiz reader mode accepts only top-level `Quiz`, `OpenQuestion`, `Predict`, and
`CodeExercise` activities after import transforms their YAML fences. Frontmatter
and the author-facing H1/banner are removed during import. Do not include ordinary
paragraphs, headings, lists, recaps, checklists, learning logs, callouts, videos,
or diagrams in the remaining quiz body. Put instructions in the activity prompt
and move teaching content into a standard lesson. The authoring convention keeps
Predict activities in standard lessons, even though the Quiz reader supports them.

`*-quiz.md` or `stepType: Quiz` selects Quiz flow. `stepType: Check` on its own
does not. Both source validation (including ZIP imports) and chapter publishing
reject mixed lesson content in Quiz flow.
