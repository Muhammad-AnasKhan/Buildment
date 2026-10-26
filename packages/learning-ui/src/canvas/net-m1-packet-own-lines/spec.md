# Canvas spec: net-m1-packet-own-lines

- **Course and chapter:** networking, 1.5 beat 4. Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section A.
- **Renderer:** `PacketCanvas` (folder `net-m1-packet-dns/`), `mode="lines"`. Model: `models/net-packet.ts`.
- **Claim:** Each line of `tcpdump -n -v -e` is one packet, and its words are the fields.
- **Input:** tap one of three line buttons (ARP request, echo request, echo reply); the words of the real line that are fields light up, and so do the matching chips in the bands. Tap a lit chip for its field card.
- **Data:** the three real lines of `agent-ip/work/networking/recordings/cable-capture.txt`, without the leading timestamp. The segments of each line, joined by single spaces, are exactly the recorded text (tested). Words that are not fields this module teaches (length, id, flags) stay unlit.
- **Verdict:** "<line>: <n> words are fields".
- **Accessibility:** line buttons are named "Capture line 2, Echo request" with `aria-pressed`; chips are buttons; a polite live card gives the line's meaning and the field; no motion.
- **Limits (in the fold):** real lines from the lab; your own capture has other numbers in the same shape; unlit words are fields this module does not need yet.
