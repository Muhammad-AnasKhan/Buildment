# Canvas spec: net-m6-replay-forward-guest

Course and chapter: networking, 6.8 (phone-only section). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.

## Claim

One forwarding rule opens one port: the server reaches the laptop through `203.0.113.1:8080`, an unforwarded port such as 22 is refused at once (exit 7), and the server cannot reach the private address directly (exit 7). One filter rule in the forward chain keeps the guest away from the home network, and the guest's blocked request times out.

## Touch

**Next** and **Start over**. Two steps. At the first step (`forwarding-guest.sh`) the output is hidden and the learner first picks what happens to a request for port 22, where nothing listens (it is refused at once). Then the recorded output shows: the three outside tests, the guest's two requests and the router's rules. The second step (`test.sh`) shows every check passing. Every step has a label "In the lab", the command, the output and one note line.

## Limits

Built only from the `forward-guest` session in `agent-ip/work/networking/recordings/replay-sessions.txt`. Output lines are copied as recorded, with nothing cut. It is one run of the reference solution. The guest's blocked request times out after three seconds because the script limits it to that, and the same symptoms can have other causes.
