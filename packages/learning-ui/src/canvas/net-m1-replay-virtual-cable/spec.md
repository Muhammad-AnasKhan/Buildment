# Canvas spec: net-m1-replay-virtual-cable

- **Course and chapter:** networking, 1.4 "For phone readers". Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section B.
- **Renderer:** the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.
- **Claim:** The first thing on the cable is ARP: the laptop does not know the phone's hardware address yet, so the capture shows two ARP packets before the first echo request.
- **Input:** **Next** and **Start over**. At the capture step the output is hidden and the learner taps one of three counts first.
- **Data:** the real runs in `agent-ip/work/networking/recordings/replay-sessions.txt` (session virtual-cable) and `replay-capture.txt` (the README capture step and the test after it). Steps: `cable.sh` (trimmed with `...` lines), the ping, the capture (predict: packets before the first echo request; options `2 packets`, `1 packet`, `4 packets`; right answer first), the ping to `192.168.1.99` that must fail, and the test. The capture command is the exact block from the challenge README. The capture is from a separate run, so its hardware addresses differ from `cable.sh`.
- **Every step:** a label "In the lab", the command, the output, one note line.
- **Accessibility:** as in `net-m1-replay-setup-checker`.
- **Limits (in the fold):** a recording of real runs; the capture is a separate run; long outputs shortened; the capture shows the first ping only.
