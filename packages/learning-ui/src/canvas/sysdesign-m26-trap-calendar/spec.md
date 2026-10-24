# Canvas spec: sysdesign-m26-trap-calendar

- **Course and chapter:** system-design, 26.4 beat 6 (A calendar that never ends).
- **Renderer:** `scene` (data only). Export: `sysdesignM26TrapCalendar`.
- **Claim:** A trap makes endless new URLs, so only a budget on each host (or a depth limit) can stop it.
- **Story:** The fetcher follows next month, again and again. The page count climbs to 50 and the budget says stop. Verdict: "Budget per site ends the trap".
- **Numbers:** 50 pages per site (course number).
- **Sources:** None needed. Chapter 26.4 fold runs a fake web.
