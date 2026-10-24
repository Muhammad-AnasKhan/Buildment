# Canvas spec: sysdesign-m28-probe-stepper

- **Course and chapter:** system-design, module 28, chapter 28.3 beat 2, "Step through six follow-ups".
- **Renderer:** custom beat canvas on the house `DesignStepper` (`primitives/design-stepper.tsx`) with a `DesignSpec`, like `sysdesign-m20-design-stepper`. Data in `models/probe-design.ts` (`probeDesign()`); course numbers from `models/wasla-numbers.ts`. Uses the optional `labelRows` of the stepper (see the interview stepper spec).
- **Claim:** A follow-up is answered by scaling the numbers, dividing each load by its plan, fixing the part that breaks first and pricing the fix. The same design answers six probes.

## Model

Peak: 100,000 opens and 1,000 creates a second; 90% hits; an app server planned at 5,000 opens a second; a database node planned at 2,500 operations a second; 5 partitions.

- Database operations = opens x (1 - hit rate) + creates.
- Share of plan = (operations / partitions) / 2,500. App servers = opens / 5,000.

| Case | Database ops a second | Per partition | Share of plan |
|---|---|---|---|
| Today | 11,000 | 2,200 (5) | 88% |
| 10x, 90% hits | 110,000 | 22,000 (5) | 880% (8.8x) |
| 99% hits | 20,000 | 4,000 (5) / 2,500 (8) / 2,000 (10) | 160% / 100% / 80% |
| Cold cache, 8 partitions | 1,010,000 | 126,250 | 5,050% (50x) |
| Ten cache nodes, one empty | 119,000 (9,000 + 100,000 + 10,000) | 14,875 (8) | 595% (6x) |
| Hot link | 100,000 reads a second on one node | | 200 app servers / 5 s = 40 reads a second |

## Inputs

- Back and Next (Start over on the last step); six chips (Today, 10x, Fix, Cold, Hot link, Cost); arrow keys, Home and End.
- Step 3: a three-state button cycling 5, 8 and 10 partitions (also the tap target on the Database card). Step 4: a toggle "Spread the cache" (tap target: Cache card). Step 5: a toggle "Copy in each app" (tap target: Apps card). Actions do not carry to later steps; steps 4 and 5 assume 8 partitions and 99% hits.

## Picture (420 x 330)

Browsers, Apps and Cache in a row at y = 100, Database below Apps at y = 230. A load chip sits under Browsers (centred at x = 66 so the widest text stays inside the picture); result chips at y = 290 (database operations, or reads on one node) and y = 316 (each partition). Pills carry the share of plan: Apps "20 servers" then "needs 200", Cache "90% hits", "99% hits", "empty", "10 nodes", "1 hot code", Database "88% of plan", "8.8x plan", "160% of plan", "50x plan". Step 6 clears the pills and shows three cost chips.

## Verdicts

| Step | Verdict (tone) |
|---|---|
| 1 | Today: every part inside its plan (good) |
| 2 | 10x: database at 8.8x its plan (bad) |
| 3 | 99% hits: database at 160% of plan (bad); 8 partitions: each at 100% of plan (good); 10 partitions: each at 80% of plan (good) |
| 4 | Empty cache: database at 50x plan (bad); spread: One node empty: database at 6x plan (warn) |
| 5 | One cache node takes 100,000 reads/s (bad); copies: App copies cut it to 40 reads/s (good) |
| 6 | Name the cost before they ask (good) |

All verdicts 38 characters or fewer, all pills 15 or fewer (`checkDesign`, tested).

## Accessibility

Chips and the action are real buttons with visible labels; toggles carry `aria-pressed`; the picture has a text description of every part and chip; a polite live region reads the step, the verdict and the sentence. Reduced motion: no moving dots, lit links and final numbers.

## Sources

Course numbers (chapters 20.1, 20.2, 20.4). The 2,500 plan follows chapter 2.5.
