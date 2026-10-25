# Canvas spec: sysdesign-m16-slow-picks

- **Course and chapter:** system-design, 16.1 beat 1 (One slow extra, every page stuck).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A slow dependency is more dangerous than a dead one: callers keep waiting, and the shared workers they wait with run out.
- **Story:** Phones send 100 pages a second. Checkout holds a worker for each page while it calls Picks, 10 busy of 50 when Picks answers in 40 ms. Picks slows to 10 s. Each worker is held for 10 s, so 50 workers are gone in half a second. The next pages never load.
- **Numbers:** 100 pages/s x 0.1 s = 10 busy workers (Little's law, chapter 2.5). At 10 s per page: 100 x 10 = 1,000 workers needed, 50 exist, so the pool fills in 50 / 100 = 0.5 s.
- **Sources:** Little's law from chapter 2.5; cascading failure shape [S91]. All numbers are course numbers.
