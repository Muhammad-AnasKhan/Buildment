# Canvas spec: sysdesign-m25-cents-not-floats

- **Course and chapter:** system-design, 25.3 beat 6 ("Count whole cents, not decimals").
- **Renderer:** `scene` (data only).
- **Claim:** Adding decimal fractions in binary floating point gives results that are not exact (0.1 + 0.2 is 0.30000000000000004). Whole numbers of the smallest unit (cents) add exactly, up to the safe integer limit.
- **Story:** The program adds 0.1 and 0.2 and gets 0.30000000000000004. It adds 10 and 20 cents and gets exactly 30. Verdict: "Count whole cents, not decimals".
- **Numbers:** 0.1 + 0.2 = 0.30000000000000004 in JavaScript (checked by running it). 10 + 20 = 30.
- **Sources:** Run in Node.js (checked 2026-10-24). Safe integers: MDN `Number.MAX_SAFE_INTEGER` (source needed if cited by name in the chapter).
