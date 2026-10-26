# Canvas spec: net-m1-packet-dns

- **Course and chapter:** networking, 1.5 beat 2. Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section A.
- **Renderer:** custom beat canvas on `BeatFrame`, `DotGrid`, `VerdictBanner` and `SvgButton`. One component for all six packet modes, `PacketCanvas.tsx` in this folder, `mode="inspect"`; the views are in `FieldViews.tsx` and `BuildViews.tsx`, the geometry in `layout.ts`, the packets in `packets.ts`. Model: `models/net-packet.ts`.
- **Claim:** A DNS query names two computers (addresses), the app on each end (ports) and how many hops it may take (TTL).
- **Input:** tap any field chip (one is selected at the start: the destination port). No other control.
- **Data:** the real DNS query recorded in the lab (`agent-ip/work/networking/recordings/dns-query.txt`): laptop `192.168.1.10` port 37028 to the phone's DNS server `192.168.1.20` port 53, UDP, TTL 64, question `A? web.test.`. Header values decoded from the hex dump; the test decodes it again.
- **Field card (three lines):** what it is, who set it, where the course explains it (module number). TTL: "your laptop's operating system (64 by default on Linux)" (dossier source S28).
- **Verdict:** "Two addresses, two ports, one TTL".
- **Accessibility:** each chip is a button named like "TTL, 64, set by your laptop's operating system" with `aria-pressed`; the field card is in a polite live region; no motion.
- **Limits (in the fold):** one real query; only the fields this module teaches are drawn; ports are module 5, DNS module 7.
