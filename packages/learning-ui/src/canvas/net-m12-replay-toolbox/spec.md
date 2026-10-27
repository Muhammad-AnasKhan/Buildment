# Canvas spec: net-m12-replay-toolbox

Course and chapter: networking, 12.2 to 12.8 (the "On a phone?" sections). Renderer: the shared `ReplayCanvas` in `net-m1-replay-setup-checker/`. Model: `models/net-replay.ts`. Data only, no new component.

## Claim

One lab network with four planted faults can be diagnosed with one tool per fault, and each tool leaves one line of evidence. The capture is a file that `tcpdump -r` reads the same way Wireshark does (TTL 107 from the server). A capture filter keeps only DNS. mtr shows loss that starts at hop 2 and goes on to the last hop (fault 1), and loss at hop 1 only when r1 limits its own replies. Two resolvers give two answers for `docs.lab.test` (fault 2). nmap shows port 7630 `filtered` next to an `open` and a `closed` port while the app listens (fault 3). iperf3 shows a low, steady speed with no retransmits in one direction only, and no UDP loss below the limit (fault 4). curl shows a slow page waiting about 4 seconds for its first byte.

## Touch

**Next** and **Start over**. Seventeen steps, all in the lab: the setup (step 1), part 1 (steps 2 and 3), part 2 (steps 4 and 5), part 3 (steps 6 to 8), part 4 (steps 9 and 10), part 5 (steps 11 and 12), part 6 (steps 13 to 16) and part 7 (step 17). At step 8 the output is hidden until the learner picks what the last hop shows while r1 limits its own replies (0.0%, 70.0% or 10.0% loss). At step 15 it is hidden until the learner picks how many UDP packets are lost at 2 Mbit/s, below the speed limit (92/864, 0/864 or 432/864).

## Limits

Built only from the challenge 9 lab sessions recorded on 2026-10-27 in the lab image with the seed `ref-mentor`, not by a learner. Every output line is copied as recorded; trailing spaces are removed and a line with three dots marks lines left out. A learner's seed gives other ports, names, loss and speeds, and times differ on every run. Wireshark is not shown, because it runs on the learner's own computer: the capture is read back with `tcpdump -r`, as the part 1 test does. The test runs, the `+trace` session and the blind round are not replayed.
