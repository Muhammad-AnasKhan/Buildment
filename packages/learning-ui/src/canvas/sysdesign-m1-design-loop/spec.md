# Canvas spec: sysdesign-m1-design-loop

- **Course and chapter:** system-design, 1.4 "The design loop", closing beat ("Play the whole loop").
- **Renderer:** custom beat canvas on `BeatFrame`, built on the new reusable primitive `primitives/design-stepper.tsx` (`DesignStepper`) with its pure model in `models/design-stepper.ts`. The slug folder holds only the PasteBox data (`pastebox.ts`) and a three-line wrapper. Why custom: no existing renderer lets a design grow step by step and also lets the learner flip a choice or break a part inside the picture.
- **Claim:** Each step of the design loop changes the design, and later steps build on earlier ones: the scope and the driving number decide the sketch, the sketch decides what to dive into, and the failure step sends you round the loop again.

## The model

A `DesignSpec` is a list of steps. Each step is a patch on the picture: it adds actors (SvgNode cards), links and chips, changes status pills, and sets the requests that run through it. `designFrame(spec, step, phase)` applies the patches of steps 1 to `step` in order, so later steps keep what earlier steps added. A step may hold an action: a list of phases, each a further patch with its own verdict and sentence, moved on by one button (or by tapping the target card in the picture), wrapping back to phase 0. Phases do not carry to later steps.

Rules the model applies for every course:

- A link to a failed actor is drawn failed (dashed red).
- A request whose path reaches a failed actor stops there and turns red.
- A request never runs through a faint ("considered, not added") actor.
- Links on a running request's path are lit.
- `checkDesign(spec)` lists unknown ids, verdicts over 38 characters, status pills over 15 characters, and cards or chips outside the picture or on top of each other, at every step and phase. The tests require an empty list for PasteBox.

## PasteBox steps (numbers from the chapter)

| Step | What appears | Verdict |
|---|---|---|
| Clarify | Scope note with three answers: up to 1 MB, kept 30 days, no edits | Scope fixed before any drawing |
| Estimate | The driving number as a chip: 12 reads/s (100,000 a day x 10 reads / 86,400 s) | Small numbers: keep it simple |
| Sketch | Browser, balancer, App 1, App 2, database; a read and a write run through | The simplest design that fits |
| Deep dive | "id: unique key" on the database; App 2's insert of aB3xY9 is refused | The unique key catches the clash |
| Trade-offs | A faint cache. Tap it: the cache pill turns "+cost, +stale", the database stays "<1% busy" (12 x 0.5 ms = 6 ms a second) | At 12 reads/s, skip the cache / A cache adds cost, buys little |
| Failure | Break the database: it turns red, its links go dashed red, requests fail. Add a standby, break it again: the standby takes over | Database down: every request fails / Standby takes over: users served |

At most three numbers are visible at once (12 reads/s, <1% busy, <1 s behind).

## Inputs

- Six step chips on top of the picture (buttons, `aria-current="step"`), Back and Next (Start over on the last step) under it, and arrow keys, Home and End while focus is in the canvas (`useStepper`).
- On Trade-offs and Failure, one action button under the picture ("Add a cache", "Break the database", "Add a standby", "Start over") and the same move by tapping the dashed-ring card in the picture.

## What the learner should notice

- The picture grows: nothing is drawn until the scope is fixed, and the number chip stays on the picture while the blocks appear.
- The cache changes cost and risk but not the database's load, so it is turned down.
- Two app servers survive a crash, one database does not; the fix is the start of the next turn round the loop.

## Accessibility

- The SVG has `role="img"` and an `aria-label` that describes the current step, every part and its status, the running requests and the verdict.
- The sentence under the picture is an `aria-live="polite"` region and includes the step and verdict for screen readers.
- Every control is a real button with a 44 px target on phones and `FOCUS_RING`. The tap area in the picture is a pointer shortcut for the action button, so it is hidden from assistive technology.
- Reduced motion: no moving requests; lit links show the request path, new parts appear settled, and the verdict shows at once.
- Colours come only from `tones.ts`; every colour sits next to words (status pills, verdict).
