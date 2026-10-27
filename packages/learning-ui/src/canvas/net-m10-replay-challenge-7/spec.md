# Canvas spec: net-m10-replay-challenge-7

Course and chapter: networking, 10.7, 10.8 and 10.10 (the "On a phone?" sections). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`. Data only, no new component.

## Claim

Three networks that talk BGP learn each other's blocks: r1 reads the AS path `64497 64498` for `203.0.113.0/24`, and a ping from r1's block crosses r2 with `ttl=63`. A withdrawal removes the route at once and the ping fails. A local preference of 50 on the direct link makes it the backup even though its path is shorter, and it carries the ping when the main link is cut. A more specific `/25` from the wrong network takes the traffic for its half of the block, and an exact-block filter with an origin check stops it.

## Touch

**Next** and **Start over**. Thirteen steps: part 1 (steps 1 to 4: `three-networks.sh`, `show route all`, the ping without `-I`, the test), part 2 (steps 5 to 7: `withdraw.sh`, `Network is unreachable`, the test), part 3 (steps 8 to 10: `backup-link.sh`, two traceroutes around the cut, the test), part 4 (steps 11 to 13: `hijack.sh`, `show route filtered`, the test). At step 2 the output is hidden until the learner picks r1's AS path (`64497 64498`, `64498 64497` or `64496 64498`). At step 11 it is hidden until the learner picks who answers for `198.51.100.130` during the hijack (r2, r1 or nobody).

## Limits

Built only from the challenge 7 sessions recorded on 2026-10-27 in the lab image (BIRD 2.14) with the reference scripts, block 1 (every gap filled), not by a learner. Every output line is copied as recorded; trailing spaces are removed and a line with three dots marks lines left out. Times differ on every run. Step 6 and step 9 show several commands typed one after the other, with their outputs in that order. The template runs with empty gaps are not replayed.
