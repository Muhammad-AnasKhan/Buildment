# Canvas spec: net-m6-replay-masquerade

Course and chapter: networking, 6.7 (phone-only section). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.

## Claim

With forwarding on and one masquerade rule, the server sees the router's outside address, `203.0.113.1`, for every device. When both devices send from the same source port, the router keeps the port for the first and gives the second a new one, and `conntrack -L` shows the new port in the second half of that device's line.

## Touch

**Next** and **Start over**. Two steps. At the first step (`masquerade.sh`) the output is hidden and the learner first picks what port the server reports for the phone (a new port). Then the recorded output shows: the ping that gets no answer before the rule, the two devices that reach the server, the phone's new port and the NAT table. The second step (`test.sh`) shows every check passing. Every step has a label "In the lab", the command, the output and one note line.

## Limits

Built only from the `masquerade` session in `agent-ip/work/networking/recordings/replay-sessions.txt`. Output lines are copied as recorded, with nothing cut. It is one run of the reference solution; the kernel chose the phone's new port, `15510`, on that run and it differs on every run. The test names two other ports (`42261` and `6028`) because it picks its own random source port. The same symptoms can have other causes.
