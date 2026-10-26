# Canvas spec: net-m9-v6-shorten

- **Course and chapter:** networking, 9.2, beat 3. Brief: `agent-ip/work/networking/module-briefs/09-ipv6.md` and the `net-m9-v6-shorten` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="v6"`, view `shorten` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `V6View.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-ipv6.ts`, parameters checked by a zod schema in the same file.
- **Claim:** The standard short form drops leading zeros, writes the longest run of zero groups as `::` (the first on a tie) and never uses `::` for a single group.
- **Input:** **Drop leading zeros** (a toggle), a native button for each run of zero groups, and **Next address**. Default the tie example.
- **Rule:** `shortenV6`, `standardRun`, `zeroRuns` and `judgeV6` in `models/net-ipv6.ts`; `shortenV6` is compared with the URL standard's serialiser on 4,000 random addresses in tests.
- **Picture:** 9.2 beat 3: 2001:0db8:0000:0000:0001:0000:0000:0001 shortens to 2001:db8::1:0:0:1: two equal zero runs, and the first is compressed. The learner drops the leading zeros and chooses the run.
- **Verdict:** "Standard form: 2001:db8::1:0:0:1", or why a valid result is not standard.
- **Edge cases (tested):** A single zero group stays `0`; the longest run beats an earlier shorter one (`2001:db8:0:1::1`); all-zero shortens to `::`.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** Standard form is RFC 5952: no leading zeros, lowercase, the longest run of two or more zero groups becomes ::, the first one when two are equally long, and a single zero group stays 0. Other forms can still be valid; they are just not the one to write. The tie rule is in section 4.2.3 of the RFC.
