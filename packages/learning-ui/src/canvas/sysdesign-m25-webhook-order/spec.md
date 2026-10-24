# Canvas spec: sysdesign-m25-webhook-order

- **Course and chapter:** system-design, module 25, chapter 25.4 beat 3, "Duplicate, late, out of order".
- **Renderer:** custom beat canvas on `BeatFrame`. Arrival order on `primitives/snap-stops-rail.tsx` and a "Captured arrives twice" toggle (`SvgChip`) inside the picture, compact event cards, state strips, `VerdictBanner`. Pure model in `models/webhook-order.ts`. No control outside the picture.
- **Claim:** Webhooks arrive in any order and sometimes twice. A rule that sets the status to the last event received ends in the wrong state. A payment that only moves forward, ignoring any event that would move it back, always ends in the right one.

## Model

- Ranks: created 0, authorized 1, captured 2, refunded 3. The events A (authorized), C (captured) and R (refunded) happened in that order; the true final state is refunded.
- Last event wins: status = the state of the final arrival.
- Forward only: start at created; for each arrival, if its rank is above the current rank, move to it; otherwise ignore it (the event is still saved).

## Inputs

- Arrival order on a rail of six stops: A C R, A R C, C A R, C R A, R A C, R C A (default C A R). Arrow keys step one stop.
- Toggle "Captured arrives twice": adds a second C at the end of the arrival order (default off).

## Picture

Top: the arrivals as numbered cards (1 to 3, or 1 to 4 with the duplicate), each with its event letter and name. Two rows below, "Last event wins" and "Forward only". Each row has a strip of the four states with a marker (a lit cell) that visits each arrival in turn (0.9 s each) and rests on the final state, and under it one chip per arrival showing the status after it. On the forward-only row an arrival that is not a step forward is drawn dashed and dimmed with the word "ignored". The final state keeps a green or red ring and a tick or cross with "ends on <state>", compared with the truth refunded, so the story is complete when the marker is paused or the motion is reduced.

## Numbers (checked in the unit tests; the true state is refunded)

| Arrival order | Last wins | Forward only |
|---|---|---|
| A C R | refunded | refunded |
| A R C | captured | refunded |
| C A R | refunded | refunded |
| C R A | authorized | refunded |
| R A C | captured | refunded |
| R C A | authorized | refunded |
| any of the six, plus a second C at the end | captured | refunded |

## Verdicts

"Both end on refunded" (good). "Last wins: captured. Truth: refunded" or "Last wins: authorized. Truth: refunded" (bad, 38 characters at most). A third case, "Forward: <state>. Truth: refunded", exists for completeness and is never reached by the six orders.

## What the learner should notice

- Last event wins is right only when the refund arrives last (A C R and C A R), and wrong after a duplicate captured event.
- Forward only ends on refunded for every order, because the late events are saved but cannot move the payment back.

## Accessibility

The rail is a `role="slider"` with the value text "Arrival order captured, authorized, refunded; last event wins ends on refunded; forward only ends on refunded". The chip is a toggle button (`aria-pressed`). The SVG title and description say both final states. Reduced motion: the markers jump to the final state; no stepping.

## Sources

Course design. State ranks and "ignore events that move backwards" are the rule taught in chapter 25.4. (Source needed: whether providers promise webhook order. The course assumes they do not.)
