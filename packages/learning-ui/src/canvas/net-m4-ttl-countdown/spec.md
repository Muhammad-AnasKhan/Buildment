# Canvas spec: net-m4-ttl-countdown

Course and chapter: networking, 4.4 beat 1. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

TTL is a countdown carried in every packet. A Linux computer starts it at 64, and each router lowers it by at least one, so the server sees 62 after two routers. A router that would lower the TTL to 0 discards the packet instead of forwarding it. The 64 and 62 match what the lab's capture showed (`tcpdump -v` on the far side of two routers shows `ttl 62`).

## Touch

**Next** plays the next step; **Start over** goes back to the first. The first run starts at TTL 64 and the TTL chip is marked "changed" at every router. The second run starts at TTL 2. At the last step the learner first taps what R2 does with a packet that arrives with TTL 1 (forwards at 0, discards, or forwards unchanged). The discard shows after the pick, with the reason. The learner cannot type a starting TTL here.

## Limits

Four made-up devices on one path of two routers, IPv4 only, no NAT. The picture shows two fixed runs, TTL 64 and TTL 2. An ordinary Linux packet starts at 64; a traceroute probe sets a low TTL on purpose. The reply a router sends after a discard is the next beat (`net-m4-time-exceeded`). The documentation ranges stand for public addresses.
