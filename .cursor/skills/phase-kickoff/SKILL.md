---
name: phase-kickoff
description: >-
  Start work on a buildment build milestone (M0 through M7) with the right context
  loaded. Use when the user asks to start, begin, or work on a specific milestone/phase,
  or says things like "let's do M2" or "start the next phase".
---

# Start a build phase

buildment's docs are deliberately split so you never need the whole spec in context at once — see
`docs/README.mdx`.

## Steps

1. Read `AGENTS.md` if you haven't already this session (the invariants rarely change, but confirm
   nothing's been updated).
2. Identify the phase from the user's request and read `docs/phases/mN-*.mdx` for it.
3. Read only the topic docs that phase file links in its `Reads:` header — not the rest of `docs/`.
4. Check `docs/11-decisions-and-open-questions.mdx` for anything that phase explicitly needs
   resolved first (M4 calls this out for scoring/retakes — other phases may not need it).
5. Turn the phase file's task checklist into a todo list (via the todo tool) before writing any
   code — the checklist is already scoped to that phase's demo criterion, don't expand it.
6. Confirm the "Out of scope for this phase" section with the user if any requested work seems to
   fall outside it, rather than silently including or silently skipping it.

## After finishing the phase

Check the phase file's "Acceptance criteria" section explicitly before declaring it done, and
update `docs/11-decisions-and-open-questions.mdx` if anything was decided along the way that isn't
already logged there.
