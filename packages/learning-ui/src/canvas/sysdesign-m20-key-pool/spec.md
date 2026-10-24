# Canvas spec: sysdesign-m20-key-pool

- **Course and chapter:** system-design, 20.3 beat 5 ("Pre-make the codes").
- **Renderer:** `scene` (data only).
- **Claim:** A background job can make random unused codes ahead of time, so creating a link never needs a retry.
- **Story:** The key maker fills the pool with 17M random codes (one day at 193 creates a second). An app takes 1,000 codes; the pool marks them used. Verdict: "Random, and ready before needed".
- **Numbers:** 193 x 86,400 = 16.7M codes a day, about 117 MB at 7 bytes each.
- **Sources:** Arithmetic from the chapter's estimate; no source needed.
