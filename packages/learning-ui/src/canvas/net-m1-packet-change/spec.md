# Canvas spec: net-m1-packet-change

- **Course and chapter:** networking, 1.5 beat 5. Full spec: `agent-ip/work/networking/canvas-specs/net-m1-packet-and-replay.md`, section A.
- **Renderer:** `PacketCanvas` (folder `net-m1-packet-dns/`), `mode="change"`. Model: `models/net-packet.ts` (`compare`).
- **Claim:** Ping a different computer and only the destination address (and the destination MAC) change; the rest stays.
- **Input:** two destination buttons inside the picture: `192.168.1.20` (recorded) and `192.168.1.30` (made up). Changed fields turn amber and carry the word "changed"; the field card says what the value was.
- **Data:** the real echo request (`recordings/echo-request.txt`) and the same packet to a made-up second computer: `192.168.1.30` and the locally administered MAC `02:00:00:00:00:30`, labelled "made up, not recorded".
- **Verdict:** "The ping as recorded, to 192.168.1.20" or "2 changed, <n> stayed the same".
- **Accessibility:** destination buttons with `aria-pressed`; chips named with their note ("destination address, 192.168.1.30, set by you: the address you gave ping, changed"); polite live region; colour is never the only signal.
- **Limits (in the fold):** the second computer is made up; fields this module does not teach are not drawn.
