# Canvas spec: net-m6-nat-keepalive

Course and chapter: networking, 6.5 beat 4. Renderer: the existing `slider` renderer (`renderers/slider/`), data only, standing in for the planned `[timeline]` model, which has no renderer in the package yet. No new component.

## Claim

A keepalive sent before the idle timer runs out resets the timer and keeps the NAT row alive. An interval below the timeout keeps the row for good; an interval at or above the timeout lets the row expire between keepalives.

## Touch

Two sliders: **Keepalive every** (10 s to 600 s, step 10, starting at 120 s) and **Idle timeout** (120 s to 600 s, step 10, starting at 300 s). The numbers show whether the row never expires or expires, the share of the hour in which the server can reach the phone, and the keepalives sent in an hour; two bars compare the interval with the timeout. Setting the timeout to 350 s and trying 300 s and 350 s answers the chapter's quiz.

## Limits

A model with one row and an hour of quiet, made up for teaching. A real router's timer is different: a UDP timer must not be under two minutes and five minutes or more is recommended [S18], and one cloud NAT gateway uses 350 seconds and advises keepalives below that [S51]. The model assumes that a keepalive which finds no row makes a new one, so with a slow interval the server can reach the phone for the timeout's share of each interval. A new row may get a different outside port on a real router.
