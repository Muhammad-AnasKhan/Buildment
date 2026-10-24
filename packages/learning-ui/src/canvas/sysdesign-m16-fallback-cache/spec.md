# Canvas spec: sysdesign-m16-fallback-cache

- **Course and chapter:** system-design, 16.6 beat 3 (A fallback).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A fallback replaces a missing answer with a worse but useful one, chosen ahead of time.
- **Story:** The breaker is open, so Checkout does not call Picks. It asks the cache for the popular items, gets a list that is an hour old, and builds the page.
- **Numbers:** No timing numbers; the point is the choice of fallback.
- **Sources:** Fallbacks and degradation are discussed in the SRE book [S91]. The story is a course example.
