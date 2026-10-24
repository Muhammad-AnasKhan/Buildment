# Canvas spec: sysdesign-m25-estimate-play

- **Course and chapter:** system-design, module 25 (Booking and payments: contention and money), chapter 25.1 beat 2, "Drag the crowd, find the pain".
- **Renderer:** custom beat canvas on `BeatFrame`, built on `primitives/estimate-chain.tsx` (`EstimateChain`, `StepSlider`) as in `sysdesign-m20-estimate-play`. The chain primitive gained one backward-compatible optional prop, `footer` (extra SVG under the cards), used for the line of assumptions. Pure model in `models/ticket-drop.ts`; number formats reused from `models/envelope-estimate.ts`.
- **Claim:** In a ticket drop the request rate grows with the crowd, but the number that matters is fans per seat: it decides how many holds must fail. Payments stay few. The design has two problems, contention and exact money.

## Model

| Quantity | Formula |
|---|---|
| Fans in the first 10 s | fans x 50% |
| Fans a second at the start | that / 10 |
| Requests a second at peak | fans a second x 4 |
| Fans per seat | fans / seats |
| Hold attempts in 10 s | fans x 50% (one hold each) |
| Share that must fail | max(0, 1 - seats / attempts) |
| Payments a second | seats / 120 |
| Money moved in 2 minutes | seats x 80 |

Default (the chapter): 400,000 fans and 20,000 seats give 80,000 requests a second, 20 fans per seat, 90% of holds must fail, 167 payments a second and 1.6 million moved. All twelve input pairs are checked in `tests/unit/canvas/sysdesign-m25-playables.test.ts` against the table in the module spec.

## Inputs

- Fans waiting: 100,000, 200,000, 400,000, 1,000,000 (default 400,000). The blue top-left card.
- Seats: 5,000, 20,000, 50,000 (default 20,000). The blue top-right card.
- Tap a blue card, then drag it sideways, use the arrow keys, Home and End, or use the one slider under the picture (the only control outside the picture).
- Fixed, written on the links and in the line under the cards ("Assumed, not measured"): 50% of fans in the first 10 s, 4 requests and 1 hold per fan, 120 s to pay, 80 a ticket.

## Picture

Three chains. Left: Fans, x 50% and divide by 10 s, Fans a second, x 4 requests, Requests at peak. Middle: Fans and Seats join (a bus line) into Fans per seat, then "1 - seats / holds" gives the share of holds that must fail. Right: Seats, divide by 120 s, Payments a second, x 80 a ticket, Money moved. Dots flow along each link at a speed that grows with the log of the value the link leads to (request rates against the seat store's 5,000 a second plan, fans per seat against 1, the failed share against a half).

## Ring and verdicts

The ring (tone warn) goes on the failed-share card when the share is 50% or more, otherwise on the payments card.

| Condition | Verdict (tone) |
|---|---|
| share 50% or more | Contention: N% of holds must fail (warn) |
| share above 0 and below 50% | Some contention: N% of holds fail (good) |
| share 0 | Every hold can succeed (good) |

N is the share rounded (97.5 shows 98). All verdicts are 38 characters or fewer (tested for every input pair).

## What the learner should notice

- Requests climb with the crowd (fans), but fans per seat and the failed share move with both fans and seats.
- More seats do not remove contention until seats reach half the crowd: 100,000 fans against 50,000 seats is the only pair where every hold can succeed.
- Payments stay between 42 and 417 a second whatever the crowd; the money moved depends on seats only.

## Accessibility

- Each input is a `role="slider"` (arrows, Home, End) with the value text "400,000 fans, 20,000 seats, 80,000 requests a second at peak, 20 fans per seat, 90 percent of holds must fail, 167 payments a second". The ring is also written in the SVG description and the verdict.
- Reduced motion: dots do not flow; the cards show their final values (the primitive draws still dots).
- Colour sits next to words (verdict, ring plus label).

## Sources

Arithmetic on course assumptions (chapter 2.3 for the method). No external source.
