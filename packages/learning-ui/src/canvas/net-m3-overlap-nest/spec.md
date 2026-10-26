# Canvas spec: net-m3-overlap-nest

- **Course and chapter:** networking, 3.6, beat 3. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-overlap-nest` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="overlap"`, view `nest` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `OverlapView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** Two valid CIDR blocks either contain one another or share nothing; they nest exactly when the shorter block's bits are a prefix of the other's.
- **Input:** two native range inputs: the office block's size (/12 to /28) and where it sits; **Reset**. Default 172.17.5.0/24 against 172.17.0.0/16.
- **Rule:** `compareBits`, `relate` and `relationText` in `models/net-subnet.ts`. Tested on 3,000 random valid pairs: any overlap is a containment, and the bit comparison agrees with the ranges.
- **Picture:** 3.6 beat 3: two valid CIDR blocks either contain one another or share nothing. Both addresses are drawn as 32 bits; the shorter prefix pins down the leading bits, and the blocks nest exactly when those bits agree.
- **Verdict:** "Overlap: Office is inside Docker" or "No overlap: the blocks are apart", and the first differing bit when apart.
- **Edge cases (tested):** The predict pairs: 10.0.0.0/16 and 10.1.0.0/16 touch but share nothing; 10.0.0.0/8 holds 10.1.0.0/16; 192.168.1.0/25 and 192.168.1.128/25 touch but share nothing.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** IPv4 only. Valid blocks only: each starts where its host bits are zero, so two blocks can never overlap by halves. Blocks that only touch share no address and are not an overlap. The office block moves inside 172.16.0.0/12 (172.16.0.0 to 172.31.255.255).
