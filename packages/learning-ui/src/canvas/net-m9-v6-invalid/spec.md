# Canvas spec: net-m9-v6-invalid

- **Course and chapter:** networking, 9.2, beat 4. Brief: `agent-ip/work/networking/module-briefs/09-ipv6.md` and the `net-m9-v6-invalid` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="v6"`, view `invalid` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `V6View.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-ipv6.ts`, parameters checked by a zod schema in the same file.
- **Claim:** A form can be invalid (a rule is broken and nobody can read it) or valid but not standard (everybody can read it, but it is not the form to write).
- **Input:** a field to type any form, and **Next example**. Default 2001:db8::1::5c.
- **Rule:** `judgeV6` and `parseIpv6` in `models/net-ipv6.ts`: invalid names the rule (two `::`, a group over four digits, a character that is not hex, too many or too few groups); non-standard lists the reasons.
- **Picture:** 9.2 beat 4: 2001:db8::1::5c is invalid (two ::); 2001:0DB8:0:0:0:0:0:5C is valid but not standard. The learner types forms and reads the rule that refuses or corrects them.
- **Verdict:** "Invalid: this is not an address", "Valid, but not the standard form" or "Valid and standard".
- **Edge cases (tested):** Uppercase, leading zeros, an uncompressed run, `::` over a single group, a partly compressed run and a tie broken the wrong way are valid but not standard; a status is standard only when the text equals the short form.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** IPv6 text only. Invalid means no reader can take it (for example two ::). Valid but not standard means every reader accepts it, but RFC 5952 asks writers to use the short form. Dotted IPv4 endings are real but not covered.
