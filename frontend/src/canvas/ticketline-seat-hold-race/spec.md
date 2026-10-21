# Seat hold race

- **Slug:** `ticketline-seat-hold-race`
- **Course:** Ticketline; review gallery first, then capacity/concurrency chapter if approved.
- **Teaching claim:** When several buyers see the same inventory snapshot, separate read-then-write holds can overbook; one atomic capacity update accepts only available seats.
- **Renderer:** Custom React component, HTML controls and stacked request bars. This demonstrates that canvases are not limited to the reusable sequence, state-machine, and factor renderers.

## Model

Inputs: buyer requests, integer 0–16 (default 6); available seats, integer 0–12 (default 4). Each request asks for one seat. For the illustrative worst-case unguarded path, all requests read the same snapshot. If at least one seat is visible, all requests pass that check. `oversold = max(0, accepted - seats)`. For the atomic path, `accepted = min(buyers, seats)` and `rejected = buyers - accepted`; oversold is always zero. There are no network calls or randomness.

The default shows six requests for four seats: the unguarded path can accept six and overbook two; the atomic path accepts four and refuses two. At zero seats, both paths refuse every request. At zero buyers, all outputs are zero.

## Learning interaction

- **What this shows:** Two methods processing the same batch, with accepted, refused, and beyond-capacity portions labelled directly.
- **Try this:** Raise buyers above seats; set seats to zero; set buyers below seats.
- **What changed:** The live sentence names the input delta, the overbooking delta, and the atomic result.
- **Limits:** This is one worst-case simultaneous read batch. Request timing, hold expiry, retries, payment, and distributed locks are omitted. It does not claim every unguarded implementation oversells on every batch.

The learner should predict when overbooking first appears before changing the controls. The chapter that eventually embeds it should follow with a transfer question about a different capacity value.

## QA

Check default, zero, maximum, overflow, reset, keyboard range controls, phone width, dark mode, and the reader preview. The registry and allowed-slug lists must match. The component is local and receives no learner data.
