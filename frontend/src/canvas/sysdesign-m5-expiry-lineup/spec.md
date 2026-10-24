# Canvas spec: sysdesign-m5-expiry-lineup

- **Course and chapter:** system-design, 5.6 beat 4 ("Same TTL, same second").
- **Renderer:** `scene` (data only).
- **Claim:** Keys stored together with the same TTL expire together, so their misses arrive as one spike. Adding a random part to each TTL (jitter) spreads the same misses over time.
- **Story:** After a restart the app stores 1,000 pages, all with TTL 60 s (tag "stored at 0 s"). They all expire at 60 s (tag "all at 60 s") and 1,000 misses hit the database at once ("spike"). With a TTL from 54 to 66 s (tag "spread 54 to 66 s"), the misses arrive at about 83 a second ("smooth"). Verdict: "Random TTLs spread the misses".
- **Numbers (story):** 1,000 keys, TTL 60 s, jitter of 10% each way. 1,000 misses / 12 s = about 83 a second.
- **Sources:** no primary source names TTL jitter as a practice (dossier "Unverified claims" 12). It is taught as reasoning from the same idea as retry jitter: randomness spreads events that would otherwise line up [S90].
