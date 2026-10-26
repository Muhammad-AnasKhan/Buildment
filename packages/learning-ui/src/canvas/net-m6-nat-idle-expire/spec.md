# Canvas spec: net-m6-nat-idle-expire

Course and chapter: networking, 6.5 beat 3. Renderer: the existing `slider` renderer (`renderers/slider/`), data only, standing in for the planned `[timeline]` model, which has no renderer in the package yet. No new component.

## Claim

A NAT row is state with a timer. If nothing passes for the idle timeout, the router deletes the row, and a later message from the server has no row to be delivered with, so it is stopped at the router.

## Touch

One slider, **Quiet time**, from 0 s to 1 hour in steps of 30 s, starting at one hour. Dragging it changes three numbers (the quiet time, whether the row is still there with its seconds left, and whether a message from the server gets through) and two bars (the quiet time against the model's 300 s timeout). At 270 s the row has 30 s left; at 300 s it is deleted, the same boundary as the code exercise in 6.6.

## Limits

A model with one row and an idle timeout of 300 s, made up for teaching and labelled as such. Real timers differ: a UDP timer must not be under two minutes and five minutes or more is recommended [S18], and one cloud NAT gateway uses 350 seconds [S51]. The lab router's own timers come from `conntrack -L`. Whether a router drops the message or answers with a reset depends on the router.
