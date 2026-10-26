# Canvas spec: net-m1-packet-wrap

- **Course and chapter:** networking, 1.6 beat 3. Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section A.
- **Renderer:** `PacketCanvas` (folder `net-m1-packet-dns/`), `mode="wrap"`. Model: `models/net-packet.ts` (`tryWrap`, `WRAP_ORDER`, `wrap`).
- **Claim:** Sending wraps the message from the inside out: TCP, then IP, then Ethernet last.
- **Input:** three tray buttons inside the picture (Ethernet, IP, TCP header, in the order of the finished packet, so the order is not given away); one control, **Start over**. A header out of order is refused with the reason ("Ethernet goes on last. It is the first header a device reads, so it must be outermost: add TCP, then IP, first."). An accepted header says why it goes there.
- **Picture:** the message sits at the bottom and the packet grows outward and upward; the finished packet fixes where the message is.
- **Data:** the same fictional web request as `net-m1-packet-jobs`.
- **Verdict:** "The message, with no headers yet", "TCP header on: the app's port", "IP header on: the far computer", "Packet complete: ready to send", or "Not yet: that header goes on later".
- **Accessibility:** tray buttons named "Add the Ethernet header" with `aria-pressed` (true once added); the card, with the refusal reason, is in a polite live region; new bands fade in unless reduced motion is on.
- **Limits (in the fold):** made-up addresses; TCP over IP over Ethernet only; Wi-Fi uses a different link header.
