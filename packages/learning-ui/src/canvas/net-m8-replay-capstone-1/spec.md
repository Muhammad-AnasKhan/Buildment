# Canvas spec: net-m8-replay-capstone-1

Course and chapter: networking, 8.2 (phone-only section). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`.

## Claim

With routes alone, a packet from a home device reaches the public server, but the server cannot answer a private source address. The test proves every path that works and proves the one that must fail: home1 gets no reply from 203.0.113.80 before NAT exists.

## Touch

**Next** and **Start over**. Two steps. At the second step (test.sh) the output is hidden and the learner first picks what the test expects from the home1 ping (a normal reply, no reply at all, or a quick refusal). Then the recorded output shows. Every step has the label "In the lab", the command, the output and one note line.

## Limits

Built only from the capstone-1 session in the recorded sessions file. The lines are copied as recorded, with trailing spaces removed, and a line with three dots marks lines left out. It is one run of the reference solution, not the learner's script. Interface names and addresses are the reference ones.
