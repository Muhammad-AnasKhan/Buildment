# Canvas spec: sysdesign-m9-stale-map

- **Course and chapter:** system-design, 9.5 beat 5 (A stale map costs one extra hop).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A client with an old partition map reaches the old owner, which tells it the new one. The cost is one extra hop.
- **Story:** Client (map version 7) asks node 1; node 1 replies moved: node 5; the client sets map version 8 and asks node 5, which serves the key. Verdict: One extra hop, then the map is fresh.
- **Numbers:** No numbers beyond the map versions.
- **Sources:** Standard routing design; Envoy's ring hash router [S16] is an example of a proxy that routes by consistent hash.
