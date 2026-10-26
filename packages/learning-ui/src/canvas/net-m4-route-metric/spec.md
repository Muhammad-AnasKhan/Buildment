# Canvas spec: net-m4-route-metric

Course and chapter: networking, 4.3 beat 5. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

When two rows have the same prefix length and both hold the destination, the metric breaks the tie and the lower metric wins. Two `10.1.0.0/16` rows with metrics 100 and 200: the packet for `10.1.2.3` uses the row with 100. When the first metric becomes 300, the other row (200) is now the lower one and wins.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 2 the learner first taps which of two equal-length rows the router uses (metric 100, metric 200, or both in turn). The packet leaves after the pick, with the reason. Step 3 changes one metric in the table (the cell carries the word "changed") and step 4 shows the packet taking the other path. The learner cannot type a metric here.

## Limits

One router and three rows with made-up metrics. The rule that the lower metric wins comes from the module brief, not from a numbered source in the dossier. A real table shows the metric in `ip route` output. Two rows with the same length and the same metric are not drawn (the code exercise in 4.6 uses "first listed" for that case, which is an exercise rule, not a router fact). The table is a model view, not a recording. The addresses are made up.
