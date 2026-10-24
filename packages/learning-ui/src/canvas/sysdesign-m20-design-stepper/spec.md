# Canvas spec: sysdesign-m20-design-stepper

- **Course and chapter:** system-design, module 20, chapter 20.2 beat 3, "Step through the design at peak".
- **Renderer:** custom beat canvas on `BeatFrame`, using the house `DesignPicture` (`primitives/design-stepper.tsx`) and the `DesignSpec` model (`models/design-stepper.ts`) like `sysdesign-m1-design-loop` and `sysdesign-m5-pattern-stepper`. The canvas adds the step chips, Back and Next, and the partition choice. Data in `models/wasla-design.ts` (`waslaDesign(k)`), course numbers in `models/wasla-numbers.ts`.
- **Backward compatible change to a primitive:** `DesignPicture` takes an optional `children` (extra SVG drawn inside the picture, under the verdict). Existing canvases pass none and are unchanged.
- **Claim:** The numbers decide the blocks. App servers do nothing for the database; a cache cuts its load by the hit rate; partitions share what is left.

## Model

Peak load: 100,000 redirects and 1,000 creates a second (101,000 operations). An app server is planned at 5,000 redirects a second, a database node at 2,500 operations a second.

| Step | What appears | Database operations a second | Times its plan |
|---|---|---|---|
| 1. One box | Browsers and one box | 101,000 | 40.4 |
| 2. App servers | 20 app servers (100,000 / 5,000) and the database | 101,000 | 40.4 |
| 3. Cache | A cache with a 90% hit rate | 100,000 x 0.10 + 1,000 = 11,000 | 4.4 |
| 4. Partitions | k partitions chosen by a hash of the code | 11,000 / k each | k = 3: 147% of plan; k = 5: 88%; k = 8: 55% |
| 5. Counting | A queue and a counter worker next to the redirect service | unchanged | unchanged |

## Inputs

- Back and Next under the picture (Start over on the last step); five step chips on top; arrow keys, Home and End while the focus is in the canvas.
- Step 4 only: partition count 3, 5 or 8 (default 5), a row of three chips inside the picture, each laid over by a real button. The choice stays for step 5.

## Picture

Browsers, Apps, Cache on one row; Counter, Queue and Database on the next. A pill on the app card shows the server count ("20 servers"); a pill on the database card shows "40x its plan", "4.4x its plan", then "88% of plan". Requests run as dots: in step 3 nine green dots turn back at the cache and one amber dot goes on to the database. Under the database card, k small boxes show the partitions. In step 5 a blue dot leaves the apps toward the queue and the counter, and a chip says the counting is off the redirect path.

## Verdicts

| Step | Verdict (tone) |
|---|---|
| 1 | Database at 40 times its plan (bad) |
| 2 | Apps cope, database still 40x over (bad) |
| 3 | Cache: database now 4.4 times plan (warn) |
| 4, k = 5 | 5 partitions: each at 88% of plan (good) |
| 4, k = 3 | 3 partitions: each at 147% of plan (bad) |
| 4, k = 8 | 8 partitions: each at 55% of plan (good; the cost of more nodes is in the chapter fold) |
| 5 | Counting leaves the redirect path (good) |

All 38 characters or fewer. `checkDesign` returns no problems for k = 3, 5 and 8 (tested).

## Accessibility

- Step chips and partition chips are real buttons with visible labels; the partition buttons are laid over the drawn chips and use `aria-pressed`. The step chip row keeps `aria-current="step"`.
- The picture has a text description of every part, its pill and the verdict; a polite live region repeats the step, the picture and the sentence under it.
- Reduced motion: no moving dots; lit links show the request paths and the pills show the final numbers.

## Sources

Course numbers (chapter 20.2 fold). The 2,500 plan follows chapter 2.5 (plan a node at about half busy).
