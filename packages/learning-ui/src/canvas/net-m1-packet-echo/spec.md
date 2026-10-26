# Canvas spec: net-m1-packet-echo

- **Course and chapter:** networking, 1.5 beat 3. Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section A.
- **Renderer:** `PacketCanvas` (folder `net-m1-packet-dns/`), `mode="inspect"`. Model: `models/net-packet.ts`.
- **Claim:** A ping has addresses, a TTL and a type, and no port: ICMP has no ports.
- **Input:** tap any field chip, including the greyed, dashed "port: none" slot, which explains "ICMP has no ports". TTL is selected at the start.
- **Data:** the real echo request of challenge 1 (`agent-ip/work/networking/recordings/echo-request.txt`, also line 3 of `cable-capture.txt`): `192.168.1.10` to `192.168.1.20`, TTL 64, protocol ICMP (1), type echo request, 56 bytes of data. Header values decoded from the hex dump; the test decodes it again. ICMP type numbers are not shown, only tcpdump's words.
- **Verdict:** "Two addresses, a TTL, a type: no port".
- **Accessibility:** chips are buttons with names ("port, none. ICMP has no ports."), `aria-pressed`, polite live card; colour is never the only signal (the empty slot is dashed and says "none").
- **Limits (in the fold):** one real echo request; ICMP has no port field, the grey slot marks what is missing; other fields are left out.
