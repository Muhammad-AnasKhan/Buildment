# Canvas spec: net-m11-replay-challenge-8

Course and chapter: networking, 11.4, 11.5 and 11.6 (the "On a phone?" sections). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`. Data only, no new component.

## Claim

A VPN tunnel is a packet inside a packet. Before the tunnel, the internet has no route to the office's private address. With the tunnel, the cafe sees only UDP on port 51820 between two public addresses, while the VPN box sees the inner ping. An 84-byte ping travels in a 156-byte outer packet. A full tunnel makes the website see the office, but name questions still go to the cafe until the name server is changed; a split tunnel hides only office traffic.

## Touch

**Next** and **Start over**. Thirteen steps: part 1 (steps 1 and 2: the build and `forward-test.txt`), parts 2 and 3 (steps 3 to 7: `tunnel.sh`, `wg0` down and up, `captures.sh`, `wg0.txt`, the size files), part 4 (steps 8 to 13: `full-split.sh`, the two DNS captures, the three website answers, the split capture, the test). At step 5 the output is hidden until the learner picks what the cafe's outside plug carries (only UDP 51820, ICMP and TCP, or UDP and ICMP). At step 8 it is hidden until the learner picks which address the website sees in the full tunnel (198.51.100.2, 203.0.113.2 or 192.168.50.23).

## Limits

Built only from the challenge 8 learner sessions recorded on 2026-10-27 in the lab image with the reference scripts, not by a learner. Every output line is copied as recorded; trailing spaces are removed and a line with three dots marks lines left out. Keys, times, ports and some byte counts differ on every run, and part 4 rebuilt the tunnel with new keys. The optional keepalive extra and the template checks with empty gaps are not replayed.
