# Canvas spec: sysdesign-m17-budget-spend

- **Course and chapter:** system-design, 17.4 beat 1 (The budget is what the SLO lets fail).
- **Renderer:** `scene` (data only), with a 30-day strip.
- **Claim:** An SLO below 100% leaves a budget of allowed failure. Incidents spend it. The team can see how much is left.
- **Story:** Budget 43 min (0.1% of 30 days = 43.2 min). Day 6: 10 bad minutes, 33 left. Day 19: 25 bad minutes, 8 left. Verdict: "35 of 43 minutes spent by day 19".
- **Numbers:** 0.001 x 30 x 24 x 60 = 43.2 minutes (arithmetic). The two incidents are course numbers.
- **Sources:** Error budget definition and the 99.999% example [S96]; 2.6 for the nines to downtime arithmetic.
