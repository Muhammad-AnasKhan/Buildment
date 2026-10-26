# Canvas spec: net-m1-packet-jobs

- **Course and chapter:** networking, 1.6 beat 2. Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section A.
- **Renderer:** `PacketCanvas` (folder `net-m1-packet-dns/`), `mode="jobs"`. Model: `models/net-packet.ts`.
- **Claim:** Three headers do three jobs: this link (MAC), the whole path (IP address), the app (port).
- **Input:** tap a header band (Ethernet, IP, TCP); the card shows its job, the address it holds, who reads it and the module; the address chips of that header light up.
- **Data:** a fictional web request: laptop `192.168.1.23` port 40000 to server `203.0.113.80` port 80 (documentation range), TTL 64, MACs `02:00:00:00:00:23` (laptop) and `02:00:00:00:00:01` (router), message `GET /`.
- **Verdict:** "MAC address: this link", "IP address: the whole path", "Port: the app".
- **Accessibility:** each header is a button named like "Ethernet header, this link: destination MAC ..., source MAC ..., type ..." with `aria-pressed`; polite live card.
- **Limits (in the fold):** everything is made up; real headers hold more fields; Wi-Fi uses a different link header, the lab uses Ethernet.
