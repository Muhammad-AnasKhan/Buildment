# Canvas spec: sysdesign-m28-estimate-aloud

- **Course and chapter:** system-design, 28.2 beat 3 ("Estimate out loud, with units").
- **Renderer:** `scene` (data only).
- **Claim:** An estimate is a chain of small steps, each said with its unit; the last step names the number that drives the design.
- **Story:** The candidate sends four messages to the board: 500M links/mo, / 2.6M seconds, x 100 opens, x 5 for peak. The board shows 193 creates/s, then 19,300 opens/s, then 96,500 at peak. The candidate says "opens drive it". Verdict: "Say the unit, then the number".
- **Numbers:** 500,000,000 / 2,592,000 = 192.9 per second; x 100 = 19,290; x 5 = 96,450. Rounded as in chapter 20.1 (193, 19,300, 96,500).
- **Sources:** Chapter 20.1 and chapter 2.3 (method).
