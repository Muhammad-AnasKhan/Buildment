# Canvas spec: net-m8-replay-capstone-2

Course and chapter: networking, 8.3 (phone-only section). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.

## Claim

Masquerade makes home and guest devices appear as one address, one forwarding rule makes one port reachable from outside, and a forward-chain rule keeps the guest from home. An unforwarded port is refused at once; a dropped packet times out.

## Touch

**Next** and **Start over**. Two steps. At the second step (test.sh) the output is hidden and the learner first picks what happens when the server connects to 198.51.100.2 on port 22 (refused at once, times out slowly, or connects). Then the recorded output shows.

## Limits

Built only from the capstone-2 session in the recorded sessions file. The lines are copied as recorded and a line with three dots marks lines left out. It is one run of the reference solution. The source ports in the output are random, which is why the tests never check a port.
