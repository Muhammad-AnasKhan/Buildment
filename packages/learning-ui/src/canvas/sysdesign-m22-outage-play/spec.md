# Canvas spec: sysdesign-m22-outage-play

- **Course and chapter:** system-design, module 22, chapter 22.5 beat 5, "Drag the outage, drop the stale".
- **Renderer:** custom beat canvas on `BeatFrame`. Pure model in `models/dardasha-outage.ts`; the outage rail uses `primitives/snap-stops-rail.tsx` and the stale limit `primitives/beat-segmented.tsx`.
- **Claim:** While an SMS provider is down, login codes pile up in the queue. After it returns, the queue shrinks only by the spare capacity, so a 5 minute outage takes 10 minutes to clear. Dropping codes that have waited longer than they are worth clears it much sooner.

## Model

A first-in, first-out queue worked out one second at a time; codes arrive at 100 a second; nothing is sent during the outage; 150 a second after it. A code that has waited longer than the limit when it reaches the front is dropped and costs no sending time. Waiting at the end of the outage is 100 x 60 x L; catch-up without a limit is 2 x L; the longest wait is L minutes when nothing is dropped. The dashed limit line sits at limit x 6,000 codes, because the oldest code in a queue that fills at 100 a second is as old as the queue is long divided by 100.

| Outage | Drop older than | Waiting at end | Dropped | Longest wait | Back to normal in |
|---|---|---|---|---|---|
| 1 min | never | 6,000 | 0 | 1 min | 2 min |
| 2 min | never | 12,000 | 0 | 2 min | 4 min |
| 5 min | never | 30,000 | 0 | 5 min | 10 min |
| 10 min | never | 60,000 | 0 | 10 min | 20 min |
| 5 min | 10 min | 30,000 | 0 | 5 min | 10 min |
| 5 min | 5 min | 30,000 | 0 | 5 min | 10 min |
| 5 min | 2 min | 30,000 | 18,000 | 2 min | 4 min |
| 10 min | 5 min | 60,000 | 30,000 | 5 min | 10 min |
| 10 min | 2 min | 60,000 | 48,000 | 2 min | 4 min |
| 2 min | 2 min | 12,000 | 0 | 2 min | 4 min |

All ten rows are tested.

## Inputs

- Outage length L: 1, 2, 5, 10 minutes on a snap rail inside the picture (default 5).
- "Drop codes older than": never, 10 min, 5 min, 2 min (default never), a four-option segmented control outside the picture. One button: Replay.

## Picture

App, Queue and Provider (the SMS provider) cards with code dots; three numbers (waiting at the end, dropped, back to normal in); the queue length over 30 minutes as an area with the outage band shaded, a dashed line for the stale limit, a bold edge where the stale codes are dropped, and a playhead that grows the area.

## Verdicts (the first rule that holds)

- `{n} stale dropped; clear in {t} min` (dropped above 0; good)
- `Old codes sent late: clear in {t} min` (nothing dropped and the longest wait is 2 min or more; warn)
- `Short outage: clear in {t} min` (otherwise; good)

## Accessibility

The rail and the segmented control are controls; the rail's value text is "5 minute outage, drop codes older than 2 minutes, 30,000 waiting at the end, 18,000 dropped, back to normal in 4 minutes".

## Reduced motion

The area shows the final state with no growth.

## Sources

Arithmetic on course numbers (100 codes a second, 150 a second provider limit). The metastable pattern is chapter 16.4 [S94].
