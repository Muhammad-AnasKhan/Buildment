# Canvas spec: net-m1-replay-setup-checker

- **Course and chapter:** networking, 1.2 "For phone readers". Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section B.
- **Renderer:** custom beat canvas, `ReplayCanvas.tsx` in this folder (a dark terminal card inside `BeatFrame`). The same component serves `net-m1-replay-own-numbers` and `net-m1-replay-virtual-cable`. Model: `models/net-replay.ts`.
- **Claim:** The setup checker names the check that failed, and the name says what to fix: outside the lab the failing check is `not-in-lab`.
- **Input:** **Next** plays the next command; **Start over** goes back to the first. At the last step the output is hidden and the learner taps one of three options first. No other control.
- **Data:** the real runs in `agent-ip/work/networking/recordings/replay-sessions.txt` (sessions setup-checker, not-privileged, outside-lab). Step 1: the working lab (all 18 checks pass). Step 2: a lab started without `--privileged` (long output shortened with a `...` line). Step 3: the same checker outside the lab (predict: which check name is on the FAIL line; options `no-privilege`, `not-in-lab`, `tool-ping`; right answer second). The not-privileged and outside-lab sessions were recorded without the typed command, so the checker command from the first session is shown.
- **Every step:** a label "In the lab" or "On your computer", the command, the output, one note line.
- **Accessibility:** native buttons with names; prediction options use `aria-pressed` and say "your pick" and "right answer" in words; the revealed step is announced in a polite live region; the output stays out of the page until the learner picks; fade-in is off under reduced motion; the terminal region is focusable so it scrolls from the keyboard.
- **Limits (in the fold):** a recording of real runs; long outputs shortened; commands for two runs were not recorded.
