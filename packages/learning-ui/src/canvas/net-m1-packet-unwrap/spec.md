# Canvas spec: net-m1-packet-unwrap

- **Course and chapter:** networking, 1.6 beat 4. Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section A.
- **Renderer:** `PacketCanvas` (folder `net-m1-packet-dns/`), `mode="unwrap"`. Model: `models/net-packet.ts` (`routerHop`, `unwrap`, `wrap`).
- **Claim:** A router takes off only the outer Ethernet header, reads the IP header, lowers TTL by one, and wraps a new Ethernet header for the next link.
- **Input:** one step button that reads **Strip**, then **Read**, then **New header** (then "Done"), and **Start over**.
- **Steps:** Strip (the Ethernet header lifts off, dashed, "taken off"), Read (destination address and TTL light up), New header (TTL 64 becomes 63, marked "was 64"; a new Ethernet header with the router's own MAC `02:00:00:00:00:02` and the next device `02:00:00:00:00:03`, both marked "new"; IP addresses and message unchanged).
- **Data:** the fictional web request of `net-m1-packet-jobs`; all MACs fictional (first byte 02). A packet with TTL 1 or less would be dropped by the model (`ttl-expired`); the canvas does not show it.
- **Verdict:** "Arrives with its Ethernet header", "Ethernet header off: only for that link", "Read the IP header: TTL 64", "TTL 63, new Ethernet header".
- **Accessibility:** buttons are native with names; the polite live card says what each step did; reduced motion shows each step without fading.
- **Limits (in the fold):** one router, made-up MACs; the routing table (module 4) and the TTL 0 drop are not shown.
