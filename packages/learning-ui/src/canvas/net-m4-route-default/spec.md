# Canvas spec: net-m4-route-default

Course and chapter: networking, 4.3 beat 6. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

A connected row has no next hop: a packet whose destination is on that network goes straight to it. The default row holds every address, so a destination that no other row holds, such as `203.0.113.80` for the laptop, goes to the gateway. Every computer has such a table, not only routers.

## Touch

**Next** plays the next step; **Start over** goes back to the first. The packet for the printer (`192.168.1.40`) is sent first and the connected row lights up. At step 4 the learner first taps which row the laptop uses for the server (the connected row, the default or none). The packet goes toward R1 after the pick, with the reason. The learner cannot type a destination here.

## Limits

One laptop with two rows, the same two rows the recorded challenge 2 laptop has (`192.168.1.0/24` on its plug and `default via 192.168.1.1`); the table here is a model view of `ip route`. The path beyond R1 is drawn as one hop. Static rows only. The addresses are made up; the documentation range `203.0.113.0/24` stands for a public address.
