# Canvas spec: net-m4-route-table

Course and chapter: networking, 4.3 beat 1. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

A router decides with a table of rows. Each row names a block of addresses and a next hop: for any address in the block, hand the packet to that next hop. A row with no next hop is a connected row: the router has a plug on that network and delivers directly. The row `default` is for everything else.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Each step lights one row and the device it points to. At the last step the learner first taps what the router does for the connected row (sends it to the default, drops it, or delivers directly). The reason shows after the pick. No other control.

## Limits

One router and four rows: `192.168.1.0/24` (connected), `10.0.0.0/8` via `10.0.0.2`, `10.1.0.0/16` via `10.1.0.2` and `default` via `203.0.113.2`. The next hops match `net-m4-route-longest`. The table is a model view of what `ip route` lists, not a recording; a real table has more rows and columns. Static rows only, no routing protocols. The addresses are made up.
