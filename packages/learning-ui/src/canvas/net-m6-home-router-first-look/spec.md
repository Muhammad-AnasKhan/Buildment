# Canvas spec: net-m6-home-router-first-look

Course and chapter: networking, 6.1 beat 1. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` home router. Data only.

## Claim

A server cannot tell fifteen home devices apart by source address. Each packet leaves the router with the router's outside address as its source, so the server's log holds one address, fifteen times.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 4 the learner first taps where the server sends its reply (the router's outside address, `203.0.113.45`, not the private address of Device 1 or the router's inside address). The step plays after the pick, and the feedback says why. Steps 2 and 3 show Device 1's packet before and after the router; the server's log table gains one row and its count rises to 15.

## Limits

Three of the fifteen devices are drawn (`192.168.1.20`, `.21` and `.34`); the other twelve are said to do the same. Linux-style NAT only. The log is a one-row model with a count, not a real server log. `203.0.113.45` stands in for a public address and comes from a documentation range; the lab built in 6.7 uses `203.0.113.1` for the same job. Devices and addresses are made up.
