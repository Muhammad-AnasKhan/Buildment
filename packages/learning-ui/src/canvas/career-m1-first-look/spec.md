# Canvas spec: career-m1-first-look

- **Course and chapter:** career-brand (course 16), module 1, chapter 1.2 beat 3, "Your first screen decides what they see".
- **Renderer:** the house budget stack (`primitives/budget-stack.tsx`, model `models/budget-stack.ts`) built with `makeBudgetStackCanvas` (`primitives/canvas-factories.tsx`). All data is in `data.ts`.
- **Claim:** A quick reader spends a short look top to bottom. Whatever fills the top is what they keep, so the best proof has to come first.

## Blocks, budget and goal

Bashar's resume in its starting order: Objective (filler, 4 s), Skills: 24 tools (context, 5 s), Education (context, 3 s), Order API p95 from 1.9 s to 0.4 s (proof, 4 s), Live demo and case study link (proof, 3 s), Hobbies (filler, 2 s). Budget 12 s, labelled "A quick first look (illustrative)". Goal: 2 proof blocks seen.

Rule: the budget is spent block by block in order; a block counts as seen when the budget covers at least half of its cost (`SEEN_SHARE` in the model).

- Starting order: Objective, Skills and Education spend all 12 s; both proof blocks are not seen. Verdict "Only 0 of 2 proof blocks seen".
- Order API moved to the top: Order API, Objective and most of Skills are seen; the demo is not. 1 of 2.
- Both proof blocks at the top: 7 s on proof, then Objective. "Goal met: 2 proof blocks seen".

## Inputs and what moves

A marker walks down the stack on its own, slower over costly blocks, with a readout of the seconds spent on the rail beside the phone. Blocks get a "seen" tag as the marker passes half of them; when the time runs out, the blocks past it turn grey with a dashed border and a "not seen" tag, a warn line marks the edge, and the rail shows the exact point the budget ran out. It loops while on screen, stops off screen, freezes while pressed, and shows the final frame under reduced motion and before it first plays. Tap a block to select it, then Move up or Move down (or the arrow keys, or drag it); the marker runs again. Replay shows when no block is selected. Kind is an icon plus a word (Proof, Context, Filler).

## What the learner should notice

Nothing about the proof changed, only its place. Moving it above the objective and the skills list is what lets a quick reader see it.

## Limits

The 12 seconds and the costs are illustrative: real readers differ, and no study gives a fixed number of seconds.

## Sources

Module brief 1 (`agent-ip/work/career-brand/module-briefs/01-what-a-reader-sees-first.md`), 1.2 beat 3.
