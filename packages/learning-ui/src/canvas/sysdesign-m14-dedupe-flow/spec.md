# sysdesign-m14-dedupe-flow (14.5, "Count the copies, with and without a table")

## What it teaches
A consumer without protection applies every copy. A dedupe table written in a separate step still lets a copy through when the consumer crashes between the work and the record of the id. An id saved in the same transaction as the work gives exactly one effect for any crash chance.

## Model (`models/dedupe-flow.ts`)
N = 100 messages. a = chance the ack is lost after the work (the message comes again). c = chance of a crash between the work and the record.
- No dedupe: effects = N / (1 - a), extra = N x a / (1 - a).
- Separate table: effects = N / (1 - c), extra = N x c / (1 - c); a does not change it.
- Same transaction: effects = N, extra 0.

| a | c | No dedupe | Separate table | Same transaction |
|---|---|---|---|---|
| 0% | 0% | 100 | 100 | 100 |
| 5% | 0% | 105 | 100 | 100 |
| 20% | 5% | 125 | 105 | 100 |
| 20% | 10% | 125 | 111 | 100 |
| 40% | 5% | 167 | 105 | 100 |

Shown rounded to whole numbers. Copies drawn: deliveries = N / (1 - a) (N / (1 - a - c) for the separate table), minus N. This is a drawing estimate; the effects are the checked numbers.

## Inputs
Three radio chips (No dedupe, Separate table, Same transaction) and two snap rails inside the picture: ack lost 0, 5, 10, 20, 40 percent and crash in the gap 0, 2, 5, 10 percent. The gap rail is faded and out of the tab order unless the separate table is picked. Default: no dedupe, 20%, 5%.

## What moves
A grid of dots, one per delivery: the 100 messages in blue with copies spread among them (light), and the copies that get applied again outlined in red. A ring walks along the dots (the next delivery) while the picture is on screen. The consumer band shows its steps; the separate table shows the gap between "work" and "record" with a bolt. Under it a bar fills green to the 100 expected and red beyond it, with the count and "N extra".

## Verdicts (38 characters or fewer)
No dedupe, a = 0 "No copies, no harm"; a above 0 "Every copy counts: N extra"; separate, c = 0 "Fine until a crash hits the gap"; c above 0 "The crash gap lets N through"; same transaction "Exactly 100 effects at any chance".

## Accessibility
Rails are `role="slider"` with `aria-valuetext`; chips are radios; the verdict and the count are live regions; the description restates the result. Reduced motion removes the walking ring.

## Primitive choice
The spec suggested `traffic-playground.tsx` or `picture-slider.tsx` twice. Two rails plus a chip row need independent drag zones, so the picture uses the new `snap-stops-rail.tsx` and `radio-chip-row.tsx`.

## Sources
S82, S83 for at-least-once delivery; the formulas are a geometric-series argument; challenge 13 part 2 is the check.
