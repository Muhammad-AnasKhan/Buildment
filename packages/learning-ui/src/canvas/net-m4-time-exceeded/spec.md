# Canvas spec: net-m4-time-exceeded

Course and chapter: networking, 4.4 beat 2. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

A router that discards a packet because its TTL reached 0 sends an ICMP Time Exceeded message to the sender, and the message comes from the router's own address. A probe with TTL 1 dies at R1, so the reply comes from `192.168.1.1`, and that source address tells the laptop who stopped the probe. The router duty is in RFC 1812; RFC 792 only says a gateway "may" notify.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 3 the learner first taps who R1 tells after the discard (nobody, the server, or the laptop from R1's own address). The reply packet shows after the pick, with the reason; its changed fields carry the word "changed". The learner cannot type a TTL here.

## Limits

Four made-up devices on one path of two routers, IPv4 only, no NAT. One probe with TTL 1 and its reply; the sequence of three probes is the next beat (`net-m4-traceroute-probes`). Real routers can limit how many replies they send and some send none, which is the beat after that. IPv6 has a similar counter, the hop limit, and this picture makes no claim about its errors.
