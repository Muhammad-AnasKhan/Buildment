# Canvas spec: career-m3-claim-card

- **Course and chapter:** career-brand (course 16), module 3, chapter 3.2 beat 3, "Fill the claim card".
- **Renderer:** the house slot card (`primitives/slot-card.tsx`, model `models/slot-card.ts`) built with `makeSlotCardCanvas` (`primitives/canvas-factories.tsx`). All data is in `data.ts`.
- **Claim:** A number becomes a claim a reader can check only when it has its parts: what was measured, before, after, over what window, from what source, and who did what.

## Slots and chips

Card "Tawfiq's claim card", with the original claim "70 percent faster pipeline" under the title. Six slots: Metric, Before, After, Window, Source, Your share. Nine chips: one right chip per slot, plus three that fit no slot ("It felt much faster": a feeling is not a measurement; "About 70 percent, the AI estimated": a tool's guess is not a source; "Best pipeline the team ever had": no one can check this). Every why is 60 characters or fewer. The pool is dealt in a fixed shuffled order (seed 1, then a new seed per round).

Assembled: "Cut the nightly pipeline's median run time from 50 to 15 minutes over 14 nights each side, from the scheduler's run history; I rewrote the join step and a teammate added the index." 50 to 15 minutes is a 70 percent cut, so the original number survives once it has its parts.

## Inputs and what moves

Tap a chip, then a slot (or drag the chip onto the slot). A right chip snaps in; a wrong one shakes, the strip says why, and it stays in the pool. "Checkable parts: N of 6" in the card counts filled slots. When all six are filled, the slots fade into the assembled sentence and the banner gives the verdict (wrong tries counted). "Start again" re-deals. Slot and chip buttons are real buttons with names; a live region reads each result.

## What the learner should notice

The 70 percent never changes. What changes is whether a reader can ask "measured how, over what, from where, and what did you do?" and get an answer.

## Limits

A real card can need more parts (what else changed in the same weeks). A median over 14 nights is one fair summary, not the only one.

## Sources

Module brief 3 (`agent-ip/work/career-brand/module-briefs/03-honest-numbers-and-proof-of-work.md`), 3.2 beat 3.
