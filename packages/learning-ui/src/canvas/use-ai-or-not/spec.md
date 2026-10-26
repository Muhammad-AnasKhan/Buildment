---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 11.04-when-not-to-use-ai
slug: use-ai-or-not
version: 1
owner: interaction-designer
renderer: context picker (shared primitive, data only)
---

# Canvas spec: Use AI or not?

## Teaching claim
Whether to use AI is a question about the task, not about the tool. Four facts decide it: what a mistake costs, whether you can check the result, whether the task is a skill you are learning, and whether private data is in it. The answers are: use AI and check, use it as a tutor only, anonymise first (or do not paste), or do it yourself (or ask a person who can check). Sources: chapter 1.6 (answers can weaken practice, hints help), chapter 2.2 (before you paste), A62 (a person must be able to decide not to use a system), A61 (a vendor's 2025 test found many AI code samples failed security tests).

## Why a canvas
A list of "do not use AI when..." is read once and forgotten, and it sounds like a ban. Changing one fact at a time shows that the same task flips between answers when its context changes, and that the answer is often "yes".

## Model
- Primitive: context picker (`models/context-picker.ts`, `primitives/context-picker.tsx`, factory `makeContextPickerCanvas`).
- Factors (4, two choices each): stakes (costs little or a lot), check (yes myself or no), learning (need it done or learning it), data (none or private).
- Options (4): `use`, `tutor`, `anon`, `self`.
- Rules, first match wins: (1) high stakes and cannot check gives `self`; (2) private data gives `anon`; (3) learning gives `tutor`; (4) cannot check (low stakes by then) gives `use` with a warning to treat the answer as a guess; fallback gives `use`.
- All 16 contexts, checked twice: rule 1 takes 4 (`self`); of the 12 left, the private-data contexts are 6 (`anon`); of the 6 left, the learning contexts are 3 (`tutor`); the last 3 (need it done, no private data, not both costly and uncheckable) give `use`. 4 + 6 + 3 + 3 = 16. Every option is reachable (checked by `checkContextConfig`).
- Start context: low stakes, can check, need it done, no private data, which gives `use`.
- Assumptions: the learner can make a task checkable by changing it, for example by testing on a copy; the chapter says so in a fold, and then the facts change.
- Limitations: see `limits`.

## Rendering
The shared context picker, 4 factors of 2 choices and 4 options. Factor labels are 13 to 18 characters, choices 4 to 12, option labels 6 to 14, subs up to 17, reasons under 90.

## Copy
- What this shows: the answer for the chosen facts and the one-line reason.
- Try this: start from the default, then switch "Is it your lesson?" to "Learning it", then switch "Private data?" to "Yes".
- What changed: the ring moves and the reason changes.
- Limits of the model: as in `limits`.

## Edge cases
Rule order matters: a costly mistake you cannot catch beats privacy, and privacy beats learning. A low-stakes task you cannot check still gets "Use AI", with the reason telling the learner to treat the answer as a guess.

## Accessibility
The shared picker: pills are real buttons with names "Factor: Choice", a live line announces the answer and the reason, the ring moves without animation under reduced motion.

## Acceptance criteria
- [x] The claim is testable: the quick check gives two cases and asks for the answer.
- [x] `checkContextConfig` returns no problems (every option reachable, ids valid).
- [x] No em or en dashes, no colours in the data.
- [x] Prediction before (chapter predict about Bayan and Sami), transfer check after.
- [x] Reader fallback: the flow diagram in beat 1 and the rules table in the beat's fold.

## Placement
Chapter 11.4, beat 2 "Change one fact, watch the answer move". The orchestrator registers the slug.
