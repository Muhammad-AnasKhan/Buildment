---
name: add-block-type
description: >-
  Add a new interactive block type to buildment's block registry (schema, grader,
  learner component, report projector, MDXEditor descriptor). Use when the user asks
  to add, create, or design a new block/question/exercise type for chapters, or
  mentions extending the block registry.
---

# Add a block type

buildment has one interactive block type per folder under `src/blocks/`, registered once in
`src/blocks/registry.ts`. Never special-case a block type outside its own folder — see
[project-invariants.mdc](../../rules/project-invariants.mdc).

Reference: `docs/03-blocks-registry.mdx` for the existing six block types' shape, and
`docs/02-content-authoring.mdx` for how the MDXEditor descriptor plugs in.

## Steps

1. **Confirm the shape with the user** before writing code: what does the block ask the learner to
   do, is it auto-graded or reviewed, does it block chapter completion, what does it contribute to
   reports.
2. Create `src/blocks/<type>/`:
   - `schema.ts` — Zod schema for `Block.config` (author-time, server-only fields like correct
     answers/rubrics included here).
   - `grade.ts` — pure function `(config, payload) => { score, maxScore, isCorrect, status }`. If
     the block needs human review, return `status: 'PENDING_REVIEW'` instead of a score.
   - `Component.tsx` — the learner-facing React component. Server Component unless it needs
     interactivity, per [typescript-nextjs.mdc](../../rules/typescript-nextjs.mdc).
   - `report.ts` — projector: what this block type contributes to the chapter/course/mentee reports
     (see `docs/06-reports.mdx`).
   - `editorDescriptor.tsx` — MDXEditor `JsxComponentDescriptor` with a purpose-built property
     editor, not a raw JSX-attribute form.
3. Register the new type in `src/blocks/registry.ts`: add the enum value to `BlockType` in
   `prisma/schema.prisma` (needs a migration — see the `schema-change` skill) and map it to the
   five files above.
4. **Sanitizer test**: add a case in the sanitizer test suite asserting the config's
   server-only fields (whatever this block calls them — `correct`, `rubric`, `answerKey`, etc.)
   never reach the client projection. This is required, not optional — see
   `docs/09-security.mdx`.
5. Add a unit test for `grade.ts` covering a correct case, an incorrect case, and one edge case
   from the config (see [testing.mdc](../../rules/testing.mdc)).
6. Document the new type in `docs/03-blocks-registry.mdx` in the same shape as the existing six
   (MDX authoring syntax example, config fields, completion rule, report contribution).

## Non-goals

- Don't touch progress/gating logic (`server/progress/`) unless the new block type needs a
  genuinely new completion signal beyond "has a satisfying Response" — most blocks don't.
- Don't add UI outside `Component.tsx` and `editorDescriptor.tsx` for the block itself; reader-page
  and editor-page chrome stay generic across all block types.
