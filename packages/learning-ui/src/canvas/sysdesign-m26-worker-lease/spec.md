# Canvas spec: sysdesign-m26-worker-lease

- **Course and chapter:** system-design, 26.2 beat 7 (A crashed fetcher only delays a page).
- **Renderer:** `scene` (data only). Export: `sysdesignM26WorkerLease`.
- **Claim:** Leases make fetchers disposable: a lost URL comes back by itself.
- **Story:** Fetcher A takes a URL with a 30 s lease and crashes. The lease runs out. The frontier gives the same URL to fetcher B, which fetches it. Verdict: "A crash only delays the page".
- **Numbers:** 30 s lease (course choice). SQS default visibility timeout is 30 s (S84), shown as the same idea.
- **Sources:** S84; chapter 15.5 (retries).
