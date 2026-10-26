---
artifact: canvas-spec
course: build-with-ai
chapter: 10.4-content-people-find-useful
slug: useful-or-bait
version: 1
owner: interaction-designer
renderer: custom, on the reusable Sorter primitive (primitives/sorter.tsx, model models/sorter.ts)
---

# Canvas spec: Useful, fake or invented?

## Teaching claim
Useful, true content earns attention honestly, even when the audience is small; bought, traded or automated activity and invented numbers break platform rules and fade.

## Why a canvas
A list of rules does not train the judgement a fellow needs on a tired evening, when a friend offers a quick way to look popular. Sorting concrete offers one at a time, and getting a short reason for each wrong try, makes the learner apply the rule to cases that look alike. One card (a careful post that only nine people read) is a twist: low reach is not a sign of a fake or a failure.

## Model
- Inputs: one bucket chosen per card, by tap or drag.
- Outputs: the card moves to its bucket when right; when wrong it stays, shows the reason written for that card and bucket, and counts as missed. The verdict counts cards that needed a second try.
- Rule: each card has exactly one right bucket. Buckets: Useful, real (earns attention); Fake activity (bought or traded; also automated); Invented claim (false numbers).
- Cards (8, from the chapter and dossier C59 to C66):
  | Card | Right bucket | Dossier basis |
  |---|---|---|
  | A post with one bug fixed, the commit link and what surprised you | useful | C59 (useful, surprising content is linked to sharing) |
  | Six fellows agree to like and share each other's posts in the first hour | fake | C63 (LinkedIn: do not agree in advance to like or re-share) |
  | You pay a seller for 300 stars on your repository | fake | C65, C66 (rank abuse; fake stars help under about two months) |
  | A tool writes "Great post!" under 100 strangers' posts each day | fake | C63, C65 (bots and automated methods; automated inauthentic activity) |
  | A careful write-up of a real week that only nine people read | useful | C60 (reach is partly luck; low reach is not fake) |
  | A post says "my app has 2,000 users" when twelve people tried it | invented | course rule: never fake metrics |
  | A short screen recording of a tool a classmate now uses every week | useful | C59 (practically useful) |
  | A headline says "ten job offers in a week" when you had none | invented | course rule: never fake metrics |
- Assumptions: each card is clear after reading its text; no card relies on a rule the chapter has not stated.
- Limitations: real cases mix kinds; honest posts can have low reach for no clear reason. The canvas does not say what any platform's ranking does with bait (U10 in the dossier): it sorts by the rules and by truth only.

## Rendering
- Primary: the shared Sorter, inline SVG on a 420 by 300 viewBox, three trays.
- Why this renderer: the learner must choose and get a consequence; a scene cannot do that.
- Controls: tap a tray (a real button per tray) or drag the card onto it.
- Static fallback: the chapter's beat text and its fold "Go deeper: what three platforms say".

## Controls
Three bucket buttons (name, gloss, count). "Sort again" after the last card uses a new order.

## Visualisation
One card on top, three trays below. Right: the card flies into its tray and the count ticks up. Wrong: the card shakes and the reason shows in one line (60 characters or fewer, checked). Verdict at the end uses the Sorter default (38 characters or fewer).

## Copy
- What this shows: three kinds of thing that can happen to a post.
- Try this: 1. Sort the "nine readers" card before the others and notice it is not fake. 2. Sort the like-group card and read why agreement in advance is the problem, not the count.
- What changed: each wrong try says why in one line.
- Limits of the model: as in `limits`.

## Edge cases
Card texts wrap in at most three lines of 40 characters. Reasons are 60 characters or fewer. No colours in the data. The like-group card says "fellows" so no real person is accused. No dashes in any text.

## Accessibility
Bucket buttons labelled with name, gloss and count; polite live region for each result and reason; focus ring on every button; reduced motion removes flight and shake.

## Acceptance criteria
- [x] The claim is testable (the quick check after the canvas transfers it to a new case: Haya and a seller of stars).
- [x] The model is tested (`checkDeck` returns no problems; every bucket has a right card; text limits hold).
- [x] The design is simple and legible at 375 px.
- [x] Prediction before, transfer check after (the chapter's predict is in the next two beats; the quick check follows).
- [x] Reader fallback exists (beat text and the fold).

## Placement
Chapter 10.4, beat 2 ("Sort the useful from the bait"), after the first beat about what spreads and before the song-market beats.

## Build plan
`packages/learning-ui/src/canvas/useful-or-bait/data.ts`, exports `USEFUL_OR_BAIT_BUCKETS`, `USEFUL_OR_BAIT_CARDS` and `usefulOrBait`, to be registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by the registry tests and the sorter deck checks.
