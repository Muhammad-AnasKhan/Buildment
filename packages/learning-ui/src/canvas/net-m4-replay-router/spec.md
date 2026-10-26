# Canvas spec: net-m4-replay-router

Course and chapter: networking, 4.7 (phone-only section). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.

## Claim

A router is a computer with two plugs that has forwarding switched on, a way out for the laptop and a way back for the server. In the recorded run, a ping across the router shows `ttl=63` (the router lowered the TTL by one), and a ping to an address the router has no route for gets `Destination Net Unreachable` from the router, not silence. The test also confirms that the MACs changed at the router and the IP addresses did not.

## Touch

**Next** and **Start over**. Two steps. At the first step (`router.sh`) the output is hidden and the learner first picks the TTL that the reply shows at the laptop (`ttl=64`, `ttl=63` or `ttl=62`). At the second step (`test.sh`) the output is hidden and the learner first picks what comes back for an address the router has no route for. Then the recorded output shows. Every step has a label "In the lab", the command, the output and one note line.

## Limits

Built only from the `router` session in `agent-ip/work/networking/recordings/replay-sessions.txt` (the second recording, the reference solution of challenge 2). Output lines are copied as recorded, with trailing spaces removed; the first step cuts lines and marks each cut with three dots. The capture itself is not in the recording, only the test's PASS lines about it. It is one run with no NAT.
