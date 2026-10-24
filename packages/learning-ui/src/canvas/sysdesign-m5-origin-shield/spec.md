# Canvas spec: sysdesign-m5-origin-shield

- **Course and chapter:** system-design, 5.7 beat 3 ("Many edges, many misses: add a shield").
- **Renderer:** `scene` (data only).
- **Claim:** Every CDN edge keeps its own copy, so a page that expires everywhere is fetched once per edge. A shield (a middle cache layer that all edges ask on a miss) collapses those fetches into one.
- **Story:** Edge 1 misses /p/42 and asks the shield; the shield fetches it from the origin "once". Edge 20 misses later and asks the shield: hit. The origin shows "1 fetch, not 20". Verdict: "Shield: 1 origin fetch, not 20".
- **Numbers:** 20 edges, a story number. Derived: without a shield the origin gets one fetch per edge per TTL (20); with it, one per TTL.
- **Predict before it (in the chapter):** how many origin fetches a page gets per TTL from 20 edges, with and without a shield.
- **Sources:** source needed. The dossier has no source for origin shields (for example the CloudFront Origin Shield documentation). The arithmetic is derived.
