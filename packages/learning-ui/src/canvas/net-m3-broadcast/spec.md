# Canvas spec: net-m3-broadcast

- **Course and chapter:** networking, 3.2, beat 4. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-broadcast` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="mask-and"`, view `broadcast` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `MaskView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** The network address has every host bit 0, the broadcast has every host bit 1, and the hosts lie between them.
- **Input:** tap any host bit; **All host bits 1** and **All host bits 0**. The network bits are shown but cannot be flipped.
- **Rule:** `subnetFacts`, `withHostPart`, `hostPartOf` and `roleInBlock` in `models/net-subnet.ts`. The broadcast rule is derived arithmetic; `/31` is sourced to RFC 3021 ([S70]).
- **Picture:** 3.2 beat 4: the broadcast is the network with every host bit set to 1; the hosts lie between the two. Only the host bits of 10.20.143.7/20 can be flipped.
- **Verdict:** "All host bits are 1: the broadcast, not for a host", or the network or host sentence for the other states.
- **Edge cases (tested):** `/31`: two addresses, no broadcast, both hosts. `/32`: one address, network, broadcast and host in one. All host bits 1 on a `/20` is `10.20.143.255`.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** IPv4 only. Hosts are the addresses strictly between the network and the broadcast, so a block has two fewer than its size, up to /30. A /31 has two addresses and no directed broadcast (RFC 3021) and a /32 is one address. This picture uses a /20.
