# Canvas spec: sysdesign-m16-retry-budget

- **Course and chapter:** system-design, 16.4 beat 6 (A retry budget).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A retry budget caps the extra load that retries can add, however long the failure lasts.
- **Story:** The first call fails. The client retries twice, spending its budget. The next failure is not retried: the budget is empty, so the client fails fast and the dependency gets a rest.
- **Numbers:** With a budget of one retry per 10 requests, 1,000 failing requests make at most 100 retries, so the dependency sees 1,100 calls, not 4,000 (1 + 3 retries each).
- **Sources:** Local retry token bucket [S89]; server-wide retry budget [S91]. Exact refill numbers are the chapter's design, not a quoted rule.
