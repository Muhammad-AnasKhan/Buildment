---
artifact: canvas-spec
course: cause-and-effect
chapter: 04.04-fishbone-diagrams
slug: fishbone-check-evidence
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: From thirteen possible causes to two

## Teaching claim
A fishbone lists possible causes so none are forgotten; it is not evidence. Checking a few likely causes against evidence narrows thirteen candidates to the two the evidence supports, and both are in steps and information, not people.

## Why a canvas
The two halves of the method, filling and checking, are easy to merge in a reader's mind. Stepping through six "fill" steps and then the checks, with "supported" and "not supported" badges, keeps them apart and shows the count falling from thirteen to two.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, note, outcome badges.
- Rule: three lanes (Family, Fishbone, Order notes); thirteen steps: six groups filled (steps 3, people 2, tools 2, supplies 2, information 2, surroundings 2), choose what to check, four results, the new helper, two remain.
- Data (chapter 4.4): 7 of 60 orders wrong; 4 unclear notes, 2 swaps without asking, 1 with no reason; mistakes on 4 busy and 3 quiet mornings; no look-alike mix-ups; Yazan packed 2 of the 7, both from unclear notes.
- Limitations: seven orders is a small sample; causes the notes cannot show are unchecked, not ruled out.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels at most 17 characters.
- Static fallback: chapter 4.4 gives the groups (step 3) and the checks ("Step 6") in prose; the Mermaid fishbone shows the filled groups.

## Controls
Shared stepper controls only.

## Copy
- What this shows: the purpose line in `data.ts`.
- Try this: the first line matches the chapter's predict (what Amal can say before checking).
- What changed: each step note.
- Limits of the model: in `data.ts`.

## Edge cases
The last step is a loop on the Family lane. Good, bad and warn tones each carry a text badge.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` for screen readers; text badges with every tone.

## Acceptance criteria
- [x] The claim is testable (quizzes after: Maha's empty groups, Nadine's eleven causes).
- [x] Numbers match chapter 4.4 exactly (13 causes; 4 plus 2 plus 1 equals 7).
- [x] Prediction before, prose after.
- [x] Reader fallback exists.

## Placement
After the predict that follows the Mermaid fishbone, before "Step 6: choose which causes to check, and check them".
