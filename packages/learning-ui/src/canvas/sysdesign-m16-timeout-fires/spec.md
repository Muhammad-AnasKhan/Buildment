# Canvas spec: sysdesign-m16-timeout-fires

- **Course and chapter:** system-design, 16.4 beat 1 (Give every call a time limit).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A time limit turns an open-ended wait into a short, known one, so a worker is held for at most that long.
- **Story:** Checkout calls Picks and starts a 200 ms clock. Picks is slow today. When the clock runs out Checkout stops waiting and shows the page without the picks row.
- **Numbers:** At 100 pages a second, a 200 ms limit holds at most 100 x 0.2 = 20 workers on a stuck Picks. With no limit, the hold has no end.
- **Sources:** Little's law from chapter 2.5; timeouts [S89]. The 200 ms is a course number.
