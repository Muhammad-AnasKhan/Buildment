# Canvas spec: sysdesign-m5-cache-control

- **Course and chapter:** system-design, 5.7 beat 1 ("The header tells the edge how long").
- **Renderer:** `scene` (data only).
- **Claim:** A CDN edge decides how long a copy is fresh from the `Cache-Control` header the origin sends. With `max-age=60`, the edge answers repeat requests itself for 60 seconds.
- **Story:** A shopper asks for /p/42; the edge misses and the origin replies with `max-age=60` (tag "stored at 0 s"). A second shopper at 12 s is a hit with age 12 s (tag "hit at 12 s"); the origin is "not asked". A tag marks "stale at 60 s". Verdict: "The header decides: fresh 60 s".
- **Numbers:** a 60-second max-age, a story choice.
- **Sources:** RFC 9111: `max-age`, `s-maxage`, freshness and the `Age` header [S22].
