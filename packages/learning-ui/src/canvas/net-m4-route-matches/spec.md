# Canvas spec: net-m4-route-matches

Course and chapter: networking, 4.3 beat 2. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

More than one row of a routing table can contain the same destination address. For `10.1.2.3`, the rows `10.0.0.0/8`, `10.1.0.0/16` and `default` all match, and `192.168.1.0/24` does not. Matching only finds the candidates; choosing among them is the next beat.

## Touch

**Next** plays the next step; each step checks one row and lights it. At the last step the learner first taps whether the connected row `192.168.1.0/24` holds `10.1.2.3`. The three matching rows light up after the pick, with the reason. No other control. The learner cannot type a destination here.

## Limits

One router and four rows, the same as `net-m4-route-table`. The destination is fixed at `10.1.2.3`. The table is a model view of what `ip route` lists, not a recording. Static rows only. The addresses are made up.
