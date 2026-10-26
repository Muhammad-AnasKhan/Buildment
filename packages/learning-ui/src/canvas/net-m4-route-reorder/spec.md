# Canvas spec: net-m4-route-reorder

Course and chapter: networking, 4.3 beat 4. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

The order of rows in a routing table does not decide which row is used. The router compares prefix lengths, so the packet for `10.1.2.3` leaves by the `/16` row whether the table lists the `/8`, the `/16` and `default` in one order or in another.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Step 2 changes the table to a second order (default first, the `/16` last); the three changed rows carry the word "changed". At step 3 the learner first taps which row the router uses for `10.1.2.3`. The packet leaves toward Router B after the pick, with the reason. The learner cannot drag rows in this picture.

## Limits

One router and three rows, the same rows and next hops as `net-m4-route-longest`. The picture shows two fixed orders. The table is a model view of what `ip route` lists, not a recording. Ties between rows of the same length are broken by the metric, shown in `net-m4-route-metric`. The addresses are made up.
