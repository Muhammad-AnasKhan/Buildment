# Canvas spec: net-m1-replay-own-numbers

- **Course and chapter:** networking, 1.3 "For phone readers". Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section B.
- **Renderer:** the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.
- **Claim:** A hex mask is read as pairs of digits and each `ff` is eight ones, so `0xffffff00` is `/24`, the same as `255.255.255.0`.
- **Input:** **Next** and **Start over**. At the hex step the output is hidden and the learner taps one of three prefixes first.
- **Data:** the real runs in `agent-ip/work/networking/recordings/replay-sessions.txt` (session own-numbers): `check-numbers.sh` on a file with a dotted mask, then on a file with a hex mask (predict: the prefix; options `/16`, `/32`, `/24`; right answer third). Outputs are whole, nothing is cut.
- **Every step:** a label "In the lab", the command, the output, one note line.
- **Accessibility:** as in `net-m1-replay-setup-checker`.
- **Limits (in the fold):** the recording passes two files kept in `/tmp`, not the learner's `my-numbers.txt`; the numbers are lab examples.
