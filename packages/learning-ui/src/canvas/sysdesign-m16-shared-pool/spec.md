# Canvas spec: sysdesign-m16-shared-pool

- **Course and chapter:** system-design, 16.5 beat 3 (One pool, one slow friend).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A resource shared by everything lets one slow part starve the rest; separate pools (bulkheads) stop that.
- **Story:** Home pages call Picks and each keeps a worker for 2 s. All 20 workers are taken. A payment request arrives, which needs none of Picks, and still waits for a free worker.
- **Numbers:** Chapter 16.5 playable: with a shared pool of 50 and a Picks that holds home pages for 3 s, payments are served for only about 21% of requests.
- **Sources:** Bulkhead pattern [S93]. Numbers are course numbers.
