# Canvas spec: net-m8-replay-capstone-3

Course and chapter: networking, 8.4 (phone-only section). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.

## Claim

One dnsmasq in the router serves both subnets, each with its own pool, gateway and DNS address. The guest can still ask the router for names, because a question to the router is not a packet to the home subnet, so the drop rule does not match it.

## Touch

**Next** and **Start over**. Two steps. At the second step (test.sh) the output is hidden and the learner first picks what dig gets when a guest asks the router for web.test while the drop rule is on (timeout, REFUSED, or the address). Then the recorded output shows.

## Limits

Built only from the capstone-3 session in the recorded sessions file. The lines are copied as recorded and a line with three dots marks lines left out. It is one run of the reference solution. The leased addresses are picked by dnsmasq inside each pool, so a learner's run differs.
