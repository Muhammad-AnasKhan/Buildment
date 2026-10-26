# Canvas spec: net-m3-replay-wrong-mask

Course and chapter: networking, 3.9 (phone-only section). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.

## Claim

When two computers on one cable disagree about the mask, each decides on its own whether the other is local, and the two fail in different ways. The computer with `/24` thinks the other is local, sends, and hears only silence (2 sent, 0 received). The computer with `/28` thinks the other is not local and says `Network is unreachable` at once. Making both `/24` fixes it.

## Touch

**Next** and **Start over**. Two steps. At the second step (the test) the output is hidden and the learner first picks which computer says `Network is unreachable` (the one with `/24`, the one with `/28`, or both). Then the recorded output shows. Every step has a label "In the lab", the command, the output and one note line.

## Limits

Built only from the `wrong-mask` session in `agent-ip/work/networking/recordings/replay-sessions.txt`. Output lines are copied as recorded, with nothing cut. It is one run, with no router or gateway, and the same symptoms can have other causes.
