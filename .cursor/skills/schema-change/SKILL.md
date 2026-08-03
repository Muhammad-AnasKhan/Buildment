---
name: schema-change
description: >-
  Change buildment's Prisma schema safely and keep the schema doc in sync. Use when
  the user asks to add or modify a database model, field, enum, or migration.
---

# Change the Prisma schema

## Steps

1. Edit `prisma/schema.prisma` directly — this is the canonical source of truth (see
   [prisma-database.mdc](../../rules/prisma-database.mdc)).
2. Follow existing conventions: `cuid()` ids (unless the id is author-supplied, like `Block.id`),
   camelCase fields, `@@index` on columns used to filter/sort in a hot path.
3. Run `pnpm prisma migrate dev --name <short-description>` to generate and apply the migration
   locally.
4. **Update `docs/08-data-model.mdx`** to match the new schema in the same change — copy the
   relevant model(s) verbatim so the doc never silently drifts from reality.
5. Check knock-on effects:
   - Does this change affect what's stored in `ChapterProgress`/`Enrollment`
     (`docs/04-progress-and-gating.mdx`)? If so, update `recomputeProgress()` too, not just the
     incremental write path.
   - Does this change affect what a report reads (`docs/06-reports.mdx`)? Reports must keep
     reading only denormalized tables, never `Response` directly.
   - Does this add a new `BlockType`? See the `add-block-type` skill instead — a schema change is
     only step 3 of that larger workflow.
6. If the change is breaking for existing data (renamed/removed required field), write the data
   migration explicitly rather than relying on Prisma's interactive prompts to "guess" a default.

## Non-goals

- Don't use `prisma db push` once the schema is shared — always generate a real migration file.
- Don't add a field "just in case" — every field in this schema traces back to a documented need in
  `docs/01-domain-model.mdx` or `docs/08-data-model.mdx`; keep it that way.
