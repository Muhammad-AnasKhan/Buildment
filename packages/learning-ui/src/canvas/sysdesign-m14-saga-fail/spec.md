# sysdesign-m14-saga-fail (14.3, "Fail a step and watch the undo")

## What it teaches
When a saga step fails, the saga runs the undo steps of the finished steps, newest first. A step that cannot be undone goes last and is retried, not undone. Without undo steps the saga leaves a half-done order behind.

## Model (`models/saga-fail.ts`)
Four steps: 1 reserve stock (undo: release stock), 2 charge card 18 (undo: refund card), 3 book courier (undo: cancel booking), 4 send receipt (no undo: retried).

| Fails at | Actions that ran | Undo steps, in order | Card | Stock |
|---|---|---|---|---|
| none | 1 2 3 4 | none | net 18 | held |
| 1 | none | none | net 0 | free |
| 2 | 1 | release stock | net 0 | free |
| 3 | 1 2 | refund card, release stock | net 0 | free |
| 4 | 1 2 3 | none, retry the receipt | net 18 | held |

Undo off: failing at 2 leaves stock held (net 0); failing at 3 leaves stock held and net 18, no order. Failing at 4 is the same as with undo on, because a retry is not an undo step (decision made by the builder; the spec table only covers step 3 for undo off).

## Inputs
Five chips in the picture (Step 1 to 4, None fail) and the four step cards themselves (tap a card to make it fail; tap the failed one again for none). A toggle under the picture: Undo steps on / off. Default: step 3, on.

## What moves
Cards that ran turn solid green, the failed card solid red, steps never reached are dashed. Undo cards slide in under the finished ones, rightmost first, each with its place number and a left-pointing arrow between neighbours. Two counters: "Card: net N" and "Stock: held / free", green when the end state is whole or empty, red when half-done.

## Verdicts (38 characters or fewer)
None fail "All four steps committed"; step 1 "Nothing to undo: step 1 failed"; step 2 "1 undo step: release the stock"; step 3 "2 undo steps, newest first"; step 4 "No undo: retry the receipt"; undo off at step 2 "Stock held, no order"; undo off at step 3 "Card charged, stock held, no order".

## Accessibility
Cards are real buttons (role="button", aria-pressed); chips are radios; the toggle is a pair of buttons. The SVG description restates the steps that ran, the undo order, and the two counters. Undo cards use CSS transitions only, so the final state shows when motion is reduced or the page is paused.

## Primitive choice
The spec suggested `block-map.tsx`. A four-card row with sliding undo cards did not fit its path highlight, so the picture is composed from the house kit (`SvgButton`, `VerdictBanner`, `DotGrid`, tones) plus the new `radio-chip-row.tsx`.

## Sources
S78 (compensating transactions); microservices.io saga page for the pattern.
