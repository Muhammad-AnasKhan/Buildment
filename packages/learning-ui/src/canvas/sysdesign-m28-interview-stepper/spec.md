# Canvas spec: sysdesign-m28-interview-stepper

- **Course and chapter:** system-design, module 28, chapter 28.2 beat 1, "Six boxes fill 45 minutes".
- **Renderer:** custom beat canvas on the house `DesignStepper` (`primitives/design-stepper.tsx`) with a `DesignSpec` (`models/design-stepper.ts`), like `sysdesign-m20-design-stepper`. Data in `models/interview-plan.ts` (`interviewDesign()`). The stepper gets an optional `labelRows` (backward compatible, default unchanged) so the request label can sit above or below the row of cards.
- **Claim:** A 45-minute round is six boxes of time, each ending with one thing said or drawn. Minutes spent drawing the sketch come out of the deep dive.

## Model

Plan: clarify 5, estimate 5, sketch 10, deep dive 15, trade-offs and failure 7, wrap-up 3 = 45 minutes (course choice, chapter 28.2). The clock pill shows the minute at the end of the step. In step 3 the action adds 8 minutes to the sketch: 5 + 5 + 18 = minute 28, and the deep dive left is 45 - 28 - 7 - 3 = 7 minutes (15 - 8).

## Inputs

- Back and Next under the picture (Start over on the last step); six step chips on top (Clarify, Numbers, Sketch, Dive, Cost, Wrap-up); arrow keys, Home and End while the focus is in the canvas.
- Step 3 only: a toggle button "Draw 8 min longer" / "Back to 10 min", also the tap target on the Clock card. The action does not carry to step 4, which shows the plan.

## Picture (420 x 330)

Clock, Board and Interviewer cards in a row at y = 100, joined Clock to Board to Interviewer. Under the Board a column of up to five chips at x = 210 (rows 190 to 302), one new chip per step that stays in later steps. A labelled request dot runs Board to Interviewer in every step; the label is what that step produces.

Two small additions to the spec: a chip under the Clock reads "dive: 15 min" in step 4 and, while the sketch runs long in step 3, "dive left: 7 min", so the cost of the long sketch is a number in the picture and not only in the banner.

## Verdicts

| Step | Clock pill | Board pill | Verdict (tone) |
|---|---|---|---|
| 1 Clarify | minute 5 | scope | Minute 5: scope agreed (good) |
| 2 Numbers | minute 10 | numbers | Minute 10: opens drive it (good) |
| 3 Sketch | minute 20 | 4 boxes | Minute 20: main path drawn (good) |
| 3, action on | minute 28 | 4 boxes | Sketch ran long: dive gets 7 min (bad) |
| 4 Dive | minute 35 | 1 deep dive | Minute 35: one dive, done (good) |
| 5 Cost | minute 42 | cost + failure | Minute 42: cost and failure named (good) |
| 6 Wrap-up | minute 45 | done | Minute 45: three-sentence summary (good) |

The Interviewer pill reads "listening" (1), "asks why" (5), "can score it" (6), empty otherwise. All verdicts are 38 characters or fewer and all pills 15 or fewer (`checkDesign`, tested).

## Accessibility

- Step chips are buttons with `aria-current="step"`; the action is a real button with `aria-pressed`. The picture has a text description of every part, chip and the verdict; a polite live region repeats the step, the verdict and the sentence under the picture.
- Reduced motion: no moving dot; lit links show the path, and pills and chips show the final state of the step.

## Sources

Course plan (chapter 28.2); design loop (chapter 1.4).
