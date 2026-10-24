# Canvas spec: sysdesign-m27-design-stepper

- **Course and chapter:** system-design, module 27, chapter 27.2 beat 4, "Step through the design at peak".
- **Renderer:** custom beat canvas on `BeatFrame`, using the house `DesignPicture` (`primitives/design-stepper.tsx`) and the `DesignSpec` model (`models/design-stepper.ts`) like `sysdesign-m20-design-stepper` and `sysdesign-m1-design-loop`. The canvas adds the step chips, Back and Next, the step 3 toggle (the house action) and the 16 shard boxes in step 5 (drawn as `DesignPicture` children). Data in `models/lamha-design.ts` (`lamhaDesign()`), course numbers in `models/lamha-numbers.ts`.
- **Claim:** The numbers decide the blocks. Storage and app servers do not cut the bytes; a CDN with a high hit rate does. Processing and counting then get their own paths.

## Model

Peak sent 12.5 Tbit/s; a sending machine is planned at 50 Gbit/s; the origin budget is 1 Tbit/s; 15,625 busy machines at peak; a viral video at 5,000 views a second; a shard row planned at 500 writes a second.

| Step | What appears | Card to watch | Value |
|---|---|---|---|
| 1. One box | Viewers and one box | One box | 12,500 / 50 = 250 times its plan |
| 2. Storage | Object storage and API servers | Storage | 12.5 Tbit/s, 12.5 times the budget |
| 3. CDN, 95% hits | A CDN edge in front of storage | Storage | 12.5 x 0.05 = 0.63 Tbit/s, 0.63 times the budget |
| 3. CDN, 70% hits (toggle) | same | Storage | 12.5 x 0.30 = 3.75 Tbit/s, 3.75 times the budget |
| 4. Queue | Uploader, raw storage, queue, workers, video storage | Workers | 15,600 busy machines at peak |
| 5. Counters | A Counter with 16 shard boxes beside the API | Counter | 5,000 / 16 = 312.5, shown as 313 writes a second each, 63% of the 500 plan |

## Inputs

- Back and Next under the picture (Start over on the last step); five step chips on top; arrow keys, Home and End while the focus is in the canvas.
- Step 3 only: the hit-rate toggle, 95% or 70% (default 95%), a button beside the sentence under the picture and also a tap on the dashed CDN card in the picture. The 70% phase does not carry to the next step.

## Picture

Row 1: Viewers, CDN edge (from step 3), Storage. Row 2: API servers, Counter (step 5) with two rows of 8 small shard boxes under it. Rows 3 and 4 (step 4): Uploader, Raw storage, Queue, then Workers and Video store. Status pills: step 1 "250x plan", step 2 "12.5 Tbit/s", step 3 "0.63 Tbit/s" (or "3.8 Tbit/s", tone bad, with 70%), step 4 "15,600 peak", step 5 "313 /s each". Requests run through as dots; in step 3 nineteen in twenty (or seven in ten) turn back at the CDN and the rest go on to storage.

## Verdicts

| Step | Verdict (tone) |
|---|---|
| 1 | One box: 250 times its plan (bad) |
| 2 | Storage must send 12.5 Tbit/s (bad) |
| 3, 95% | CDN: storage now sends 0.63 Tbit/s (good) |
| 3, 70% | At 70% hits storage sends 3.8 Tbit/s (bad) |
| 4 | Processing runs off the play path (good) |
| 5 | Counting spreads over 16 rows (good) |

All 38 characters or fewer. `checkDesign` returns no problems (tested).

## Accessibility

- Step chips and the hit-rate toggle are real buttons with visible labels; the toggle uses `aria-pressed`. The step chip row keeps `aria-current="step"`.
- The picture has a text description of every part, its pill and the verdict; a polite live region repeats the step, the picture and the sentence under it.
- Reduced motion: no moving dots; lit links show the request paths and the pills show the final numbers.

## Sources

Course numbers (chapter 27.2 fold). The 50 Gbit/s plan follows chapter 2.5 (plan a machine at about half busy). The 1,000 write units a second per partition behind the shard plan is [S40].
