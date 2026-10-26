# Canvas spec: net-m9-v6-expand

- **Course and chapter:** networking, 9.2, beat 2. Brief: `agent-ip/work/networking/module-briefs/09-ipv6.md` and the `net-m9-v6-expand` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="v6"`, view `expand` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `V6View.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-ipv6.ts`, parameters checked by a zod schema in the same file.
- **Claim:** `::` stands for exactly the zero groups that are missing, so every valid short form has one expansion to eight four-digit groups.
- **Input:** **Expand** and **Next example** buttons, and a field to type your own address. Default 2001:db8:4a1:20::5c.
- **Rule:** `parseIpv6`, `expandV6` in `models/net-ipv6.ts`, checked against the platform's own IPv6 parser on thousands of strings in tests.
- **Picture:** 9.2 beat 2: an address is eight groups of sixteen bits, so :: stands for however many zero groups bring the written groups up to eight. 2001:db8:4a1:20::5c has five groups written, so :: stands for 3.
- **Verdict:** ":: stands for 3 zero groups (48 bits)".
- **Edge cases (tested):** `fe80::` is seven zero groups (112 bits); `::` is eight; an address with no `::` only gains its leading zeros.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** IPv6 text only: no neighbour discovery and no routing. 2001:db8::/32 is the documentation range (RFC 3849) and fe80::/10 is link-local; they are examples, not live addresses. Dotted IPv4 endings such as ::ffff:192.0.2.1 are real but not covered. While you type, the picture keeps the last valid address.
