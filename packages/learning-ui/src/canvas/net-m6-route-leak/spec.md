# Canvas spec: net-m6-route-leak

Course and chapter: networking, 6.3 beat 3. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` home router. Data only.

## Claim

A masquerade rule is not a firewall. With no route, a request from outside to a private address fails at once; once the outside server has a route to `192.168.1.0/24` through the router, a packet addressed straight to the laptop is forwarded and reaches it. The real internet is kept out only because it has no route to private ranges.

## Touch

**Next** plays the next step; **Start over** removes the route again (the routes table goes back to one row). Step 2 adds the route as a new table row. At step 4 the learner first taps which source address the laptop sees on the forwarded packet (`203.0.113.80`, nobody rewrote it); the packet then arrives with its TTL changed from 64 to 63 and the feedback says why.

## Limits

One server, one router and one laptop with made-up addresses from the documentation ranges and private ranges. The router has a masquerade rule and nothing else, as in the course lab (dossier 5.6: the connection to the laptop succeeds once the route exists, and fails at once, curl exit 7, without it). The masquerade rule in the lab acts on packets that leave by the outside plug, which is why this packet keeps its source address. A real router may add a filter. The routes table is a model view of `ip route`.
